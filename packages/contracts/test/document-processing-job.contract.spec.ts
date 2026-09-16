import {
  DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION,
  parseDocumentProcessingJobPayload,
} from '../src';

const valid = {
  version: DOCUMENT_PROCESSING_JOB_CONTRACT_VERSION,
  documentId: '00000000-0000-4000-8000-000000000001',
  processingRunId: '00000000-0000-4000-8000-000000000002',
};
describe('DocumentProcessingJobPayload', () => {
  it('serializes and parses a valid payload', () =>
    expect(parseDocumentProcessingJobPayload(JSON.parse(JSON.stringify(valid)))).toEqual(valid));
  it.each([
    { ...valid, version: 2 },
    { ...valid, documentId: 'not-a-uuid' },
    { ...valid, processingRunId: 'not-a-uuid' },
    { version: 1, documentId: valid.documentId },
    { ...valid, extra: true },
  ])('rejects invalid runtime payloads', (payload) =>
    expect(() => parseDocumentProcessingJobPayload(payload)).toThrow(),
  );
});
