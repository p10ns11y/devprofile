export type LcvInteract = {
  event: string;
  from: string;
  success: string;
  fail?: string;
  interrupted?: string;
  machine?: string;
};

export function lcvInteract(input: LcvInteract): Record<string, string> {
  return {
    "data-lcv-event": input.event,
    "data-lcv-from": input.from,
    "data-lcv-to-success": input.success,
    "data-lcv-to-fail": input.fail ?? input.from,
    "data-lcv-to-interrupted": input.interrupted ?? input.from,
    ...(input.machine ? { "data-lcv-machine": input.machine } : {}),
  };
}
