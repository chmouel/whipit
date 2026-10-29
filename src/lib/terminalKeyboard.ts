import type { TerminalControlId } from './terminalControls';

// Layout format and key IDs are compatible with GlassHaven/Haven's ToolbarLayout
// and ToolbarKey (AGPL-3.0): https://github.com/GlassHaven/Haven
export const DEFAULT_CUSTOM_TERMINAL_KEYBOARD = `[
  ["keyboard", "esc", "tab", "shift", "sym_slash", "sym_dash", "voice_kb", "arrow_up", {"label": "-", "send": "-"}, "home", "end", {"label": "^D", "send": "\\u0004"}, "sym_tilde", "alt"],
  ["enter", "ctrl", {"label": "TC", "send": "\u0060c"}, {"label": "TP", "send": "\u0060p"}, {"label": "TN", "send": "\u0060 "}, "sym_backtick", {"label": "TG", "send": "\u0060g"}, "arrow_left", "arrow_down", "arrow_right", {"label": "^C", "send": "\\u0003"}, "snippets", "paste"]
]`;

export type KeyboardItem = string | { label: string; send: string };
export type KeyboardLayout = [KeyboardItem[], KeyboardItem[]];

export const keyboardControls: Record<string, TerminalControlId> = {
  keyboard: 'keyboard', esc: 'esc', tab: 'tab', enter: 'enter', paste: 'paste',
  shift: 'shift', ctrl: 'ctrl', alt: 'alt', home: 'home', end: 'end',
  arrow_up: 'up', arrow_down: 'down', arrow_left: 'left', arrow_right: 'right',
  pgup: 'page-up', pgdn: 'page-down', attach: 'attach', text_input: 'compose', compose_kb: 'compose',
};

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
        if (!Object.hasOwn(keyboardControls, item) && !Object.hasOwn(keyboardSymbols, item) && !Object.hasOwn(keyboardSequences, item) && item !== 'voice_kb' && item !== 'voice_input' && item !== 'snippets') {
          throw new Error(`${location}: unsupported key ID "${item}"`);
        }
        result = item;
      } else {
        if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error(`${location}: expected a key ID or custom key`);
        const custom = item as Record<string, unknown>;
        if (typeof custom.label !== 'string' || !custom.label.trim()) throw new Error(`${location}: label must be a non-empty string`);
        if (typeof custom.send !== 'string' || !custom.send) throw new Error(`${location}: send must be a non-empty string`);
        result = { label: custom.label, send: custom.send };
      }
      return result;
    });
  }) as KeyboardLayout;
}
