import { useId, useRef, useState } from 'react'
import { uploadLimits } from '../../config/options'
import { checkFile } from '../../lib/files'
import { CloseIcon, UploadIcon } from '../ui/Icons'

export function FileUpload({ files, onChange, title = 'Slika ili skica' }: { files: File[]; onChange: (f: File[]) => void; title?: string }) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)

  const add = (list: FileList | null) => {
    if (!list) return
    const errs: string[] = []
    const next = [...files]
    for (const f of Array.from(list)) {
      if (next.length >= uploadLimits.maxFiles) {
        errs.push(`Najviše ${uploadLimits.maxFiles} fajla.`)
        break
      }
      const e = checkFile(f)
      if (e) errs.push(e)
      else if (!next.some((x) => x.name === f.name && x.size === f.size)) next.push(f)
    }
    setError(errs.length ? errs.join(' ') : null)
    onChange(next)
    if (input.current) input.current.value = ''
  }

  const full = files.length >= uploadLimits.maxFiles

  return (
    <div>
      <p className="label" id={`${id}-l`}>
        {title} <span className="font-normal text-ink-soft">(do {uploadLimits.maxFiles} fajla, JPG, PNG ili PDF, najviše {uploadLimits.maxFileMB} MB)</span>
      </p>
      {!full && (
        <label
          htmlFor={id}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            add(e.dataTransfer.files)
          }}
          className={`flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed p-5 text-center transition-colors ${
            drag ? 'border-navy bg-navy/5' : 'border-navy/30 bg-white hover:border-navy'
          }`}
        >
          <UploadIcon className="h-7 w-7 text-navy" />
          <span className="font-bold text-navy">Dodajte fajl</span>
          <span className="text-sm text-ink-soft">Fotografišite skicu telefonom ili izaberite fajl</span>
          <input
            ref={input}
            id={id}
            type="file"
            className="sr-only"
            accept={uploadLimits.acceptAttr}
            multiple
            onChange={(e) => add(e.target.files)}
            aria-labelledby={`${id}-l`}
          />
        </label>
      )}
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      )}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li key={f.name + i} className="flex items-center justify-between gap-3 border border-line bg-white px-3 py-2">
              <span className="min-w-0 truncate text-sm font-semibold">{f.name}</span>
              <span className="shrink-0 text-xs text-ink-soft">{(f.size / 1024 / 1024).toFixed(1)} MB</span>
              <button
                type="button"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft hover:text-red-700"
                aria-label={`Ukloni ${f.name}`}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
