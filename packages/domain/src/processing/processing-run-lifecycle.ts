export const PROCESSING_RUN_STATUSES = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] as const;
export type ProcessingRunStatus = (typeof PROCESSING_RUN_STATUSES)[number];

const allowedTransitions: Readonly<Record<ProcessingRunStatus, readonly ProcessingRunStatus[]>> = {
  PENDING: ['RUNNING'], RUNNING: ['COMPLETED', 'FAILED'], COMPLETED: [], FAILED: [],
};

export function canTransitionProcessingRun(from: ProcessingRunStatus, to: ProcessingRunStatus): boolean {
  return allowedTransitions[from].includes(to);
}
export function assertProcessingRunTransition(from: ProcessingRunStatus, to: ProcessingRunStatus): void {
  if (!canTransitionProcessingRun(from, to)) throw new Error(`Invalid processing run transition: ${from} -> ${to}.`);
}
export function isProcessingRunActive(status: ProcessingRunStatus): boolean { return status === 'PENDING' || status === 'RUNNING'; }
export function isProcessingRunTerminal(status: ProcessingRunStatus): boolean { return status === 'COMPLETED' || status === 'FAILED'; }
