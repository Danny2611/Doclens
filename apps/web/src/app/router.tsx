import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { App } from './app';
import { DocumentLibraryPage } from '../pages/document-library.page';
import { DocumentDetailPage } from '../pages/document-detail.page';

export const appRoutes: RouteObject[] = [
  {
    element: <App />,
    children: [
      {
        index: true,
        element: <DocumentLibraryPage />,
      },
      { path: 'documents/:documentId', element: <DocumentDetailPage /> },
    ],
  },
];

export const router = createBrowserRouter(appRoutes);
