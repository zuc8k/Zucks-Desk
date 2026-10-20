import { createHashRouter, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import CapturePage from './pages/Capture'
import RecorderPage from './pages/Recorder'
import OcrPage from './pages/Ocr'
import ClipboardHistoryPage from './pages/ClipboardHistory'
import NotesPage from './pages/Notes'
import SystemInfoPage from './pages/SystemInfo'

export const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'capture', element: <CapturePage /> },
      { path: 'recorder', element: <RecorderPage /> },
      { path: 'ocr', element: <OcrPage /> },
      { path: 'clipboard', element: <ClipboardHistoryPage /> },
      { path: 'notes', element: <NotesPage /> },
      { path: 'system', element: <SystemInfoPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
])