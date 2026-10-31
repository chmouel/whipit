import { alignedKeyboardColumns, DEFAULT_CUSTOM_TERMINAL_KEYBOARD, parseTerminalKeyboard } from '../src/lib/terminalKeyboard';

test('the Haven layout retains order and exact macro sequences', () => {
  const rows = parseTerminalKeyboard(DEFAULT_CUSTOM_TERMINAL_KEYBOARD);
  expect(rows[0]).toEqual(['keyboard', 'esc', 'tab', 'shift', 'sym_slash', 'sym_dash', 'voice_kb', 'home', 'arrow_up', 'end', { label: '^D', send: '\u0004' }, 'sym_tilde', 'alt']);
  expect(rows[1]).toEqual(['enter', 'ctrl', 'new_tab', 'prev_tab', 'next_tab', 'sym_backtick', 'goto', 'arrow_left', 'arrow_down', 'arrow_right', { label: '^C', send: '\u0003' }, 'snippets', 'paste']);
});

const columnLabels = (json: string) => alignedKeyboardColumns(parseTerminalKeyboard(json)).map(({ top, bottom }) =>
  [top, bottom].map(item => item === undefined ? null : typeof item === 'string' ? item : item.label));

test('the default layout aligns into Haven columns with a cursor block', () => {
  expect(columnLabels(DEFAULT_CUSTOM_TERMINAL_KEYBOARD)).toEqual([
    ['keyboard', 'enter'], ['esc', 'ctrl'], ['tab', 'new_tab'], ['shift', 'prev_tab'], ['sym_slash', 'next_tab'],
    ['sym_dash', 'sym_backtick'], ['voice_kb', 'goto'],
    ['home', 'arrow_left'], ['arrow_up', 'arrow_down'], ['end', 'arrow_right'],
    ['^D', '^C'], ['sym_tilde', 'snippets'], ['alt', 'paste'],
  ]);
});

test('cursor block drops keys between nav keys and leaves missing partners empty', () => {
  expect(columnLabels('[["esc","arrow_up","tab","pgup","alt"],["arrow_down","f1"]]')).toEqual([
    ['esc', null], ['arrow_up', 'arrow_down'], ['pgup', null], ['alt', 'f1'],
  ]);
});

test('layouts without nav keys pair rows by position', () => {
  expect(columnLabels('[["esc","tab"],["ctrl"]]')).toEqual([['esc', 'ctrl'], ['tab', null]]);
});

test.each([
  ['{', 'Invalid JSON'],
  ['[]', 'exactly two rows'],
  ['[[], 1]', 'Row 2'],
  ['[["bogus"], []]', 'unsupported key ID'],
  ['[[{"label":"A","send":3}], []]', 'send must be'],
  ['[[{"label":"","send":"x"}], []]', 'label must be'],
])('rejects invalid layout %s', (json, error) => {
  expect(() => parseTerminalKeyboard(json)).toThrow(error);
});

test('custom keys sending herdr prefix sequences become built-in Whip keys', () => {
  const [row] = parseTerminalKeyboard('[[{"label":"TC","send":"`c"},{"label":"TP","send":"`p"},{"label":"TN","send":"` "},{"label":"TG","send":"`g"},{"label":"X","send":"`x"},"next_pane"],[]]');
  expect(row).toEqual(['new_tab', 'prev_tab', 'next_tab', 'goto', { label: 'X', send: '`x' }, 'next_pane']);
});

test('custom keys named after object prototype members stay custom keys', () => {
  const [row] = parseTerminalKeyboard('[[{"label":"A","send":"constructor"},{"label":"B","send":"toString"},{"label":"C","send":"__proto__"}],[]]');
  expect(row).toEqual([{ label: 'A', send: 'constructor' }, { label: 'B', send: 'toString' }, { label: 'C', send: '__proto__' }]);
});
