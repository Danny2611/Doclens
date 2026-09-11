import type { JSX } from 'react';

const statuses: Record<string, { label: string; className: string }> = {
  UPLOADED: { label: 'Đã tải lên', className: 'bg-blue-100 text-blue-800' },
  QUEUED: { label: 'Đang chờ xử lý', className: 'bg-amber-100 text-amber-800' },
  PROCESSING: { label: 'Đang xử lý', className: 'bg-amber-100 text-amber-800' },
  COMPLETED: { label: 'Hoàn tất', className: 'bg-green-100 text-green-800' },
  FAILED: { label: 'Thất bại', className: 'bg-red-100 text-red-800' },
};

export function DocumentStatusBadge({ status }: { status: string }): JSX.Element {
  const value = statuses[status] ?? { label: status, className: 'bg-slate-100 text-slate-800' };
  return <span className={`rounded-full px-2 py-1 text-xs font-medium ${value.className}`}>{value.label}</span>;
}
