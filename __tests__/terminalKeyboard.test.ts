import { DEFAULT_CUSTOM_TERMINAL_KEYBOARD, parseTerminalKeyboard } from '../src/lib/terminalKeyboard';

test('the Haven layout retains order and exact macro sequences', () => {
  const rows = parseTerminalKeyboard(DEFAULT_CUSTOM_TERMINAL_KEYBOARD);
  expect(rows[0]).toEqual(['keyboard', 'esc', 'tab', 'shift', 'sym_slash', 'sym_dash', 'voice_kb', 'arrow_up', { label: '-', send: '-' }, 'home', 'end', { label: '^D', send: '\u0004' }, 'sym_tilde', 'alt']);
  expect(rows[1]).toEqual(['enter', 'ctrl', { label: 'TC', send: '`c' }, { label: 'TP', send: '`p' }, { label: 'TN', send: '` ' }, 'sym_backtick', { label: 'TG', send: '`g' }, 'arrow_left', 'arrow_down', 'arrow_right', { label: '^C', send: '\u0003' }, 'snippets', 'paste']);
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
