import { Navigate, type RouteObject } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './features/dashboard/DashboardPage'
import LibraryPage from './features/library/LibraryPage'
import BoardPage from './features/board/BoardPage'
import CalendarPage from './features/calendar/CalendarPage'
import EditorPage from './features/editor/EditorPage'
import DataPage from './features/data/DataPage'
import ActivityPage from './features/activity/ActivityPage'

export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'board', element: <BoardPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'editor/:id', element: <EditorPage /> },
      { path: 'data', element: <DataPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]