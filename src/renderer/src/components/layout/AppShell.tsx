import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TitleBar from './TitleBar'
import ToastContainer from '../ui/Toast'

export default function AppShell(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col bg-[var(--color-bg)]">
      <TitleBar />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}