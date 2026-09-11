-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'QUEUED', 'EXTRACTING', 'CHUNKING', 'SUMMARIZING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingRunStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ProcessingStage" AS ENUM ('QUEUED', 'EXTRACTING', 'CHUNKING', 'SUMMARIZING', 'COMPLETED');

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" BIGINT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'UPLOADED',
    "page_count" INTEGER,
    "language" TEXT,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processing_runs" (
    "id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "status" "ProcessingRunStatus" NOT NULL DEFAULT 'PENDING',
    "stage" "ProcessingStage" NOT NULL DEFAULT 'QUEUED',
    "started_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "duration_ms" INTEGER,
    "error_code" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "processing_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "documents_storage_key_key" ON "documents"("storage_key");

-- CreateIndex
CREATE INDEX "documents_status_created_at_idx" ON "documents"("status", "created_at");

-- CreateIndex
CREATE INDEX "documents_created_at_idx" ON "documents"("created_at");

-- CreateIndex
CREATE INDEX "processing_runs_document_id_status_idx" ON "processing_runs"("document_id", "status");

-- CreateIndex
CREATE INDEX "processing_runs_status_created_at_idx" ON "processing_runs"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "processing_runs_document_id_attempt_key" ON "processing_runs"("document_id", "attempt");

-- AddForeignKey
ALTER TABLE "processing_runs" ADD CONSTRAINT "processing_runs_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
