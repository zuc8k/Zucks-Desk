import type { JSX } from 'react'
import { useRef, useState } from 'react'
import { FileImage, Play } from 'lucide-react'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useSettingsStore } from '../stores/settings.store'
import { useUiStore } from '../stores/ui.store'
import { t } from '../lib/i18n'
import type { OcrLang, OcrResult } from '@shared/api-contract'

export default function OcrPage(): JSX.Element {
  const language = useSettingsStore((s) => s.settings.language)
  const pushToast = useUiStore((s) => s.pushToast)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [ocrLang, setOcrLang] = useState<OcrLang>('ara+eng')
  const [result, setResult] = useState<OcrResult | null>(null)
  const [busy, setBusy] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const value = reader.result
      if (typeof value === 'string') {
        setImageDataUrl(value)
        setResult(null)
        setErrorMsg(null)
      }
    }
    reader.readAsDataURL(file)
  }

  const run = async (): Promise<void> => {
    if (!imageDataUrl) return
    setBusy(true)
    setErrorMsg(null)
    const res = await window.zucks.ocr.recognize(imageDataUrl, ocrLang)
    setBusy(false)
    if (res.ok) {
      setResult(res.data)
    } else {
      setErrorMsg(
        res.error.code === 'NOT_AVAILABLE'
          ? t(language, 'error.notAvailable')
          : res.error.message
      )
    }
  }

  const copy = async (): Promise<void> => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result.text)
      pushToast('success', t(language, 'common.copied'))
    } catch {
      pushToast('error', t(language, 'common.error'))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title={t(language, 'ocr.title')} description={t(language, 'ocr.subtitle')}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage size={16} />
              {t(language, 'ocr.chooseImage')}
            </Button>

            <select
              value={ocrLang}
              onChange={(e) => setOcrLang(e.target.value as OcrLang)}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm text-[var(--color-text)]"
            >
              <option value="ara">{t(language, 'ocr.lang.ara')}</option>
              <option value="eng">{t(language, 'ocr.lang.eng')}</option>
              <option value="ara+eng">{t(language, 'ocr.lang.araeng')}</option>
            </select>

            <Button onClick={run} disabled={busy || !imageDataUrl}>
              <Play size={16} />
              {busy ? t(language, 'ocr.running') : t(language, 'ocr.run')}
            </Button>
          </div>

          {imageDataUrl && (
            <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <img src={imageDataUrl} alt="" className="max-h-72 w-auto" />
            </div>
          )}

          {errorMsg && (
            <p className="text-sm text-[var(--color-danger)]">{errorMsg}</p>
          )}
        </div>
      </Card>

      <Card
        title={t(language, 'ocr.result')}
        description={result ? `${(result.confidence * 100).toFixed(1)}%` : undefined}
      >
        <textarea
          value={result?.text ?? ''}
          readOnly
          placeholder={t(language, 'ocr.resultEmpty')}
          className="h-48 w-full resize-none rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-text)]"
        />
        {result && (
          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={copy}>
              {t(language, 'ocr.copy')}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}