import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { App } from './app';
import { DocumentLibraryPage } from '../pages/document-library.page';

export const appRoutes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <DocumentLibraryPage />,
      },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
