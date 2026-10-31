import type { TerminalControlId } from './terminalControls';

// Layout format and key IDs are compatible with GlassHaven/Haven's ToolbarLayout
// and ToolbarKey (AGPL-3.0): https://github.com/GlassHaven/Haven
export const DEFAULT_CUSTOM_TERMINAL_KEYBOARD = `[
  ["keyboard", "esc", "tab", "shift", "sym_slash", "sym_dash", "voice_kb", "home", "arrow_up", "end", {"label": "^D", "send": "\\u0004"}, "sym_tilde", "alt"],
  ["enter", "ctrl", "new_tab", "prev_tab", "next_tab", "sym_backtick", "goto", "arrow_left", "arrow_down", "arrow_right", {"label": "^C", "send": "\\u0003"}, "snippets", "paste"]
]`;

// Whip-native keys standing in for herdr prefix bindings, which never reach
// herdr because Whip attaches to pane terminals directly.
export const keyboardActions = { new_tab: 'TC', prev_tab: 'TP', next_tab: 'TN', next_pane: 'TO', goto: 'TG' } as const;
export type KeyboardAction = keyof typeof keyboardActions;
export const isKeyboardAction = (item: KeyboardItem): item is KeyboardAction => typeof item === 'string' && Object.hasOwn(keyboardActions, item);
// Layouts saved before the built-in keys existed sent herdr's prefix sequences.
const legacyPrefixActions: Record<string, KeyboardAction> = { '`c': 'new_tab', '`p': 'prev_tab', '` ': 'next_tab', '`o': 'next_pane', '`g': 'goto' };
export type KeyboardCustomKey = { label: string; send: string };
export type KeyboardItem = string | KeyboardCustomKey;
export type KeyboardLayout = [KeyboardItem[], KeyboardItem[]];

export const keyboardControls: Record<string, TerminalControlId> = {
  keyboard: 'keyboard', esc: 'esc', tab: 'tab', enter: 'enter', paste: 'paste',
  shift: 'shift', ctrl: 'ctrl', alt: 'alt', home: 'home', end: 'end',
  arrow_up: 'up', arrow_down: 'down', arrow_left: 'left', arrow_right: 'right',
  pgup: 'page-up', pgdn: 'page-down', attach: 'attach', text_input: 'compose', compose_kb: 'compose',
  chat: 'chat', history: 'history', find: 'find', files: 'files', links: 'links',
};

export interface KeyboardColumn {
  top?: KeyboardItem;
  bottom?: KeyboardItem;
}

// Haven's aligned toolbar: an inverted-T cursor block between the free keys.
const NAV_TOP = ['home', 'arrow_up', 'end', 'pgup'];
const NAV_BOTTOM = ['arrow_left', 'arrow_down', 'arrow_right', 'pgdn'];
const NAV_KEYS = new Set([...NAV_TOP, ...NAV_BOTTOM]);
const isNavKey = (item: KeyboardItem) => typeof item === 'string' && NAV_KEYS.has(item);

function pairColumns(top: KeyboardItem[], bottom: KeyboardItem[]): KeyboardColumn[] {
  return Array.from({ length: Math.max(top.length, bottom.length) }, (_, index) => ({ top: top[index], bottom: bottom[index] }));
}

// Like Haven, keys placed between the first and last nav key of a row are dropped.
function splitAroundNav(row: KeyboardItem[]): [KeyboardItem[], KeyboardItem[]] {
  const first = row.findIndex(isNavKey);
  if (first < 0) return [row, []];
  const last = row.length - 1 - [...row].reverse().findIndex(isNavKey);
  return [row.slice(0, first), row.slice(last + 1)];
}

export function alignedKeyboardColumns([row1, row2]: KeyboardLayout): KeyboardColumn[] {
  const present = new Set([...row1, ...row2].filter(isNavKey));
  if (!present.size) return pairColumns(row1, row2);
  const [left1, right1] = splitAroundNav(row1);
  const [left2, right2] = splitAroundNav(row2);
  const nav = NAV_TOP.flatMap((top, index) => {
    const bottom = NAV_BOTTOM[index];
    if (!present.has(top) && !present.has(bottom)) return [];
    return [{ top: present.has(top) ? top : undefined, bottom: present.has(bottom) ? bottom : undefined }];
  });
  return [...pairColumns(left1, left2), ...nav, ...pairColumns(right1, right2)];
}

export const keyboardSymbols: Record<string, string> = {
  sym_pipe: '|', sym_tilde: '~', sym_slash: '/', sym_dash: '-', sym_underscore: '_',
  sym_equals: '=', sym_plus: '+', sym_backslash: '\\', sym_squote: "'", sym_dquote: '"',
  sym_semicolon: ';', sym_colon: ':', sym_bang: '!', sym_question: '?', sym_at: '@',
  sym_hash: '#', sym_dollar: '$', sym_percent: '%', sym_caret: '^', sym_amp: '&',
  sym_star: '*', sym_lparen: '(', sym_rparen: ')', sym_lbracket: '[', sym_rbracket: ']',
  sym_lbrace: '{', sym_rbrace: '}', sym_lt: '<', sym_gt: '>', sym_backtick: '`',
};

export const keyboardSequences: Record<string, [string, string]> = {
  insert: ['Ins', '\u001b[2~'], delete: ['Del', '\u001b[3~'],
  f1: ['F1', '\u001bOP'], f2: ['F2', '\u001bOQ'], f3: ['F3', '\u001bOR'], f4: ['F4', '\u001bOS'],
  f5: ['F5', '\u001b[15~'], f6: ['F6', '\u001b[17~'], f7: ['F7', '\u001b[18~'], f8: ['F8', '\u001b[19~'],
  f9: ['F9', '\u001b[20~'], f10: ['F10', '\u001b[21~'], f11: ['F11', '\u001b[23~'], f12: ['F12', '\u001b[24~'],
};

export function parseTerminalKeyboard(json: string): KeyboardLayout {
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('Invalid JSON'); }
  if (!Array.isArray(value) || value.length !== 2) throw new Error('Layout must contain exactly two rows');
  return value.map((row: unknown, rowIndex: number) => {
    if (!Array.isArray(row)) throw new Error(`Row ${rowIndex + 1} must be an array`);
    return row.map((item: unknown, index: number): KeyboardItem => {
      const location = `Row ${rowIndex + 1}, key ${index + 1}`;
      let result: KeyboardItem;
      if (typeof item === 'string') {
        if (!Object.hasOwn(keyboardControls, item) && !Object.hasOwn(keyboardSymbols, item) && !Object.hasOwn(keyboardSequences, item) && !Object.hasOwn(keyboardActions, item) && item !== 'voice_kb' && item !== 'voice_input' && item !== 'snippets') {
          throw new Error(`${location}: unsupported key ID "${item}"`);
        }
        result = item;
      } else {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`${location}: expected a key ID or custom key`);
        const custom = item as Record<string, unknown>;
        if (typeof custom.label !== 'string' || !custom.label.trim()) throw new Error(`${location}: label must be a non-empty string`);
        if (typeof custom.send !== 'string' || !custom.send) throw new Error(`${location}: send must be a non-empty string`);
        result = (Object.hasOwn(legacyPrefixActions, custom.send) ? legacyPrefixActions[custom.send] : undefined) ?? { label: custom.label, send: custom.send };
      }
      return result;
    });
  }) as KeyboardLayout;
}
