import { useCallback, useEffect, useRef, useState } from 'react'
import {
  composeSketch,
  dataUrlToFile,
  dimLabel,
  prepareSource,
  processSketch,
  rotateDim,
  rotateSource,
  SKETCH_DEFAULT_THRESHOLD,
  type SketchDim,
  type SketchSource,
} from './sketch'

const LS_KEY = 'mk-skica-v1'

export function clearSketchStorage() {
  try {
    localStorage.removeItem(LS_KEY)
  } catch {
    /* ignore */
  }
}

interface Persisted {
  source: SketchSource
  threshold: number
  dims: SketchDim[]
}

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Persisted
    return p?.source?.dataUrl ? p : null
  } catch {
    return null
  }
}

export function useSketch() {
  const initial = useRef(loadPersisted())
  const [source, setSource] = useState<SketchSource | null>(initial.current?.source ?? null)
  const [threshold, setThreshold] = useState(initial.current?.threshold ?? SKETCH_DEFAULT_THRESHOLD)
  const [dims, setDims] = useState<SketchDim[]>(initial.current?.dims ?? [])
  const [processed, setProcessed] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const processedOnce = useRef(false)

  // obrada (sa malim zastojem dok se pomera klizač)
  useEffect(() => {
    if (!source) {
      setProcessed(null)
      return
    }
    let cancelled = false
    setBusy(true)
    const t = setTimeout(() => {
      processSketch(source.dataUrl, threshold)
        .then((p) => !cancelled && setProcessed(p))
        .catch(() => !cancelled && setError('Skica ne može da se obradi. Pokušajte sa drugom slikom.'))
        .finally(() => !cancelled && setBusy(false))
    }, processedOnce.current ? 140 : 0)
    processedOnce.current = true
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [source, threshold])

  // čuvanje u pregledaču
  useEffect(() => {
    try {
      if (!source) localStorage.removeItem(LS_KEY)
      else localStorage.setItem(LS_KEY, JSON.stringify({ source, threshold, dims } satisfies Persisted))
    } catch {
      /* pun storage – skica ostaje samo u ovoj sesiji */
    }
  }, [source, threshold, dims])

  const load = useCallback(async (file: File | undefined | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Izaberite fotografiju (JPG ili PNG).')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const s = await prepareSource(file)
      processedOnce.current = false
      setDims([])
      setSelected(null)
      setThreshold(SKETCH_DEFAULT_THRESHOLD)
      setSource(s)
    } catch {
      setBusy(false)
      setError('Fotografija ne može da se otvori. Pokušajte ponovo.')
    }
  }, [])

  const rotate = useCallback(async () => {
    if (!source) return
    setBusy(true)
    const s = await rotateSource(source)
    setDims((d) => d.map(rotateDim))
    setSource(s)
  }, [source])

  const clear = useCallback(() => {
    setSource(null)
    setDims([])
    setSelected(null)
    setError(null)
  }, [])

  const addDim = useCallback((d: SketchDim) => setDims((all) => [...all, d]), [])
  const updateDim = useCallback((id: string, patch: Partial<SketchDim>) => setDims((all) => all.map((d) => (d.id === id ? { ...d, ...patch } : d))), [])
  const removeDim = useCallback((id: string) => {
    setDims((all) => all.filter((d) => d.id !== id))
    setSelected((s) => (s === id ? null : s))
  }, [])

  /** Fajlovi za porudžbinu: obrađena skica sa kotama + originalna fotografija */
  const exportFiles = useCallback(async (): Promise<File[]> => {
    if (!source) return []
    const p = processed ?? (await processSketch(source.dataUrl, threshold))
    const blob = await composeSketch(p, source.w, source.h, dims)
    const sketch = new File([blob], 'skica-sa-merama.jpg', { type: 'image/jpeg' })
    const original = await dataUrlToFile(source.dataUrl, 'skica-original.jpg')
    return [sketch, original]
  }, [source, processed, threshold, dims])

  const dimTexts = dims.map((d, i) => `Kota ${i + 1}: ${dimLabel(d.value)}`)
  const missingValues = dims.some((d) => !d.value.trim())

  return {
    source,
    processed,
    threshold,
    setThreshold,
    dims,
    addDim,
    updateDim,
    removeDim,
    selected,
    setSelected,
    busy,
    error,
    load,
    rotate,
    clear,
    exportFiles,
    dimTexts,
    missingValues,
    hasSketch: !!source,
  }
}

export type Sketch = ReturnType<typeof useSketch>
