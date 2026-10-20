import type { JSX } from 'react'
import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import { useSettingsStore } from '../stores/settings.store'
import { t } from '../lib/i18n'
import type { ResourceSnapshot, SystemInfo } from '@shared/api-contract'

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let idx = 0
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024
    idx += 1
  }
  return `${value.toFixed(1)} ${units[idx] ?? 'B'}`
}

export default function SystemInfoPage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [resources, setResources] = useState<ResourceSnapshot | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadInfo = async (): Promise<void> => {
      const result = await window.zucks.system.info()
      if (cancelled) return
      if (result.ok) {
        setInfo(result.data)
      } else {
        setErrorMsg(
          result.error.code === 'NOT_AVAILABLE'
            ? t(language, 'error.notAvailable')
            : result.error.message
        )
      }
    }

    void loadInfo()

    const interval = window.setInterval(() => {
      void (async () => {
        const result = await window.zucks.system.resources()
        if (cancelled) return
        if (result.ok) setResources(result.data)
      })()
    }, 2000)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [language])

  const memPercent =
    resources && resources.totalMemoryBytes > 0
      ? Math.round((resources.usedMemoryBytes / resources.totalMemoryBytes) * 100)
      : 0

  return (
    <div className="flex flex-col gap-6">
      <Card
        title={t(language, 'system.title')}
        description={t(language, 'system.subtitle')}
      >
        {errorMsg ? (
          <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
        ) : !info ? (
          <p className="text-sm text-[var(--color-text-muted)]">
            {t(language, 'system.loading')}
          </p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">
                {t(language, 'system.os')}
              </dt>
              <dd className="text-sm font-medium text-[var(--color-text)]">{info.os}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">
                {t(language, 'system.arch')}
              </dt>
              <dd className="text-sm font-medium text-[var(--color-text)]">{info.arch}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">
                {t(language, 'system.cpu')}
              </dt>
              <dd className="text-sm font-medium text-[var(--color-text)]">
                {info.cpuModel} ({info.cpuCores} {t(language, 'system.cores')})
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--color-text-muted)]">
                {t(language, 'system.appVersion')}
              </dt>
              <dd className="text-sm font-medium text-[var(--color-text)]">
                {info.appVersion}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title={t(language, 'system.cpu')}>
          <p className="text-3xl font-bold text-[var(--color-text)]">
            {resources ? `${resources.cpuPercent.toFixed(0)}%` : '—'}
          </p>
        </Card>
        <Card title={t(language, 'system.memory')}>
          <p className="text-3xl font-bold text-[var(--color-text)]">{memPercent}%</p>
          {resources && (
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              {formatBytes(resources.usedMemoryBytes)} /{' '}
              {formatBytes(resources.totalMemoryBytes)}
            </p>
          )}
        </Card>
        <Card title={t(language, 'system.disk')}>
          {info ? (
            <p className="text-sm text-[var(--color-text)]">
              {formatBytes(info.diskFreeBytes)} / {formatBytes(info.diskTotalBytes)}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">—</p>
          )}
        </Card>
      </div>
    </div>
  )
}