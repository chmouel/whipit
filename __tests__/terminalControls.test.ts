import {
  incrementTerminalControlUsage,
  parseTerminalControlUsage,
} from '../src/lib/terminalControls';

test('increments one persisted control without losing other usage', () => {
  expect(incrementTerminalControlUsage({ ctrl: 2 }, 'paste')).toEqual({ ctrl: 2, paste: 1 });
});

test('accepts only known positive finite usage counters', () => {
  expect(parseTerminalControlUsage({ ctrl: 2.4, home: Infinity, unknown: 10, tab: 0 }))
    .toEqual({ ctrl: 2 });
});
