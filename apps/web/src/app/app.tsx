import type { JSX } from 'react';
import { Outlet } from 'react-router-dom';

export function App(): JSX.Element {
  return <Outlet />;
}
