import type { JSX } from 'react'
import { Link } from 'react-router-dom'
import {
  Camera,
  Video,
  ScanText,
  ClipboardList,
  StickyNote,
  MonitorCog
} from 'lucide-react'
import Card from '../components/ui/Card'
import { useSettingsStore } from '../stores/settings.store'
import { t } from '../lib/i18n'

interface Tile {
  to: string
  labelKey: string
  descKey: string
  Icon: typeof Camera
}

const tiles: readonly Tile[] = [
  { to: '/capture', labelKey: 'nav.capture', descKey: 'dashboard.tile.capture', Icon: Camera },
  { to: '/recorder', labelKey: 'nav.recorder', descKey: 'dashboard.tile.recorder', Icon: Video },
  { to: '/ocr', labelKey: 'nav.ocr', descKey: 'dashboard.tile.ocr', Icon: ScanText },
  { to: '/clipboard', labelKey: 'nav.clipboard', descKey: 'dashboard.tile.clipboard', Icon: ClipboardList },
  { to: '/notes', labelKey: 'nav.notes', descKey: 'dashboard.tile.notes', Icon: StickyNote },
  { to: '/system', labelKey: 'nav.system', descKey: 'dashboard.tile.system', Icon: MonitorCog }
]

export default function Dashboard(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          {t(language, 'dashboard.title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {t(language, 'dashboard.subtitle')}
        </p>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tiles.map(({ to, labelKey, descKey, Icon }) => (
          <Link
            key={to}
            to={to}
            className="group rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-primary)]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-muted)] text-[var(--color-primary)] transition-colors group-hover:bg-[var(--color-primary)] group-hover:text-white">
              <Icon size={20} />
            </div>
            <h2 className="text-sm font-semibold text-[var(--color-text)]">
              {t(language, labelKey)}
            </h2>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {t(language, descKey)}
            </p>
          </Link>
        ))}
      </div>

      <Card
        title={t(language, 'dashboard.recentTitle')}
        description={t(language, 'dashboard.recentDesc')}
      >
        <p className="text-sm text-[var(--color-text-muted)]">
          {t(language, 'common.empty')}
        </p>
      </Card>
    </div>
  )
}