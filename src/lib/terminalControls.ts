const terminalControlIdList = [
  'keyboard',
  'ctrl',
  'shift',
  'esc',
  'tab',
  'paste',
  'history',
  'compose',
  'chat',
  'attach',
  'files',
  'links',
  'up',
  'left',
  'right',
  'down',
  'enter',
  'slash',
  'pipe',
  'tilde',
  'end',
  'page-up',
  'page-down',
  'alt',
  'find',
  'home',
] as const;

export type TerminalControlId = typeof terminalControlIdList[number];
export type TerminalControlUsage = Partial<Record<TerminalControlId, number>>;

export const TERMINAL_CONTROL_HIT_SLOP = { top: 4, bottom: 4 } as const;
// Haven-style keys: filled, borderless, and stretched to their column width.
export const TERMINAL_KEY_CLASS =
  'h-8 min-h-0 min-w-9 items-center justify-center rounded-[8px] bg-border px-2 py-0 shadow-none active:bg-border/70';

const terminalControlIds = new Set<string>(terminalControlIdList);
const MAX_USAGE_COUNT = 1_000_000;

export function incrementTerminalControlUsage(
  usage: TerminalControlUsage,
  control: TerminalControlId,
): TerminalControlUsage {
  return {
    ...usage,
    [control]: Math.min(MAX_USAGE_COUNT, (usage[control] || 0) + 1),
  };
}

export function parseTerminalControlUsage(value: unknown): TerminalControlUsage {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const usage: TerminalControlUsage = {};
  for (const [control, count] of Object.entries(value)) {
    if (!terminalControlIds.has(control) || typeof count !== 'number' || !Number.isFinite(count) || count <= 0) continue;
    usage[control as TerminalControlId] = Math.min(MAX_USAGE_COUNT, Math.round(count));
  }
  return usage;
}
