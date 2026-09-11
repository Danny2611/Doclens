import type { JSX } from 'react';

import { useHealthQuery } from '../api/health.query';

export function BackendConnectionStatus(): JSX.Element {
  const healthQuery = useHealthQuery();

  if (healthQuery.isPending) {
    return <p role="status">Đang kiểm tra kết nối backend…</p>;
  }

  if (healthQuery.isError) {
    return (
      <p role="alert">
        Không thể kết nối đến backend. Hãy đảm bảo API DocLens đang chạy rồi thử tải lại trang.
      </p>
    );
  }

  return <p role="status">Backend đã kết nối: {healthQuery.data.service}.</p>;
}
