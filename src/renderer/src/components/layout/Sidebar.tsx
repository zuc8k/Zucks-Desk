import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Camera,
  Video,
  ScanText,
  ClipboardList,
  StickyNote,
  MonitorCog,
  Settings
} from 'lucide-react'
import { useSettingsStore } from '../../stores/settings.store'
import { t } from '../../lib/i18n'

const items = [
  { to: '/', labelKey: 'nav.dashboard', icon: LayoutDashboard, end: true },
  { to: '/capture', labelKey: 'nav.capture', icon: Camera },
  { to: '/recorder', labelKey: 'nav.recorder', icon: Video },
  { to: '/ocr', labelKey: 'nav.ocr', icon: ScanText },
  { to: '/clipboard', labelKey: 'nav.clipboard', icon: ClipboardList },
  { to: '/notes', labelKey: 'nav.notes', icon: StickyNote },
  { to: '/system', labelKey: 'nav.system', icon: MonitorCog },
  { to: '/settings', labelKey: 'nav.settings', icon: Settings }
]

export default function Sidebar(): React.JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)

  return (
    <aside className="flex w-[var(--sidebar-width)] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] text-xs font-bold text-white">
          Z
        </div>
        <span className="text-sm font-semibold text-[var(--color-text)]">ZUCKS DESK</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{t(language, item.labelKey)}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}