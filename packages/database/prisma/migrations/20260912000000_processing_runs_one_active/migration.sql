-- At most one PENDING (queued) or RUNNING (processing) execution may exist per document.
-- Terminal COMPLETED and FAILED history remains unrestricted by this index.
CREATE UNIQUE INDEX "processing_runs_one_active_per_document_idx"
ON "processing_runs"("document_id")
WHERE "status" IN ('PENDING', 'RUNNING');
