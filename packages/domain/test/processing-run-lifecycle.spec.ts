import { assertProcessingRunTransition, canTransitionProcessingRun, isProcessingRunActive, isProcessingRunTerminal } from '../src';

describe('processing run lifecycle', () => {
  it.each([['PENDING', 'RUNNING'], ['RUNNING', 'COMPLETED'], ['RUNNING', 'FAILED']] as const)('allows %s -> %s', (from, to) => expect(canTransitionProcessingRun(from, to)).toBe(true));
  it.each([['PENDING', 'PENDING'], ['PENDING', 'COMPLETED'], ['RUNNING', 'RUNNING'], ['COMPLETED', 'RUNNING'], ['FAILED', 'RUNNING']] as const)('rejects %s -> %s', (from, to) => expect(() => assertProcessingRunTransition(from, to)).toThrow('Invalid processing run transition'));
  it('identifies active and terminal states', () => { expect(isProcessingRunActive('PENDING')).toBe(true); expect(isProcessingRunActive('COMPLETED')).toBe(false); expect(isProcessingRunTerminal('FAILED')).toBe(true); expect(isProcessingRunTerminal('RUNNING')).toBe(false); });
});
