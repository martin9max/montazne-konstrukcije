import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { changeType, initialState, sanitize, type ConfigState } from './configState'
import { clearLocal, fromQuery, loadLocal, saveLocal, toQuery } from './urlState'
import { isBuildType, type ProductType } from '../config/products'
import { validateDims } from './validation'
import { CUSTOM_COLOR_ID } from '../config/options'
import { useSketch } from './useSketch'

export type StepId = 'tip' | 'dimenzije' | 'spajanje' | 'boja' | 'dodaci' | 'namena' | 'pregled'

export const ALL_STEPS: { id: StepId; label: string; short: string }[] = [
  { id: 'tip', label: 'Tip konstrukcije', short: 'Tip' },
  { id: 'dimenzije', label: 'Dimenzije', short: 'Mere' },
  { id: 'spajanje', label: 'Spajanje', short: 'Spoj' },
  { id: 'boja', label: 'Boja', short: 'Boja' },
  { id: 'dodaci', label: 'Dodaci', short: 'Dodaci' },
  { id: 'namena', label: 'Namena i napomena', short: 'Namena' },
  { id: 'pregled', label: 'Pregled i porudžbina', short: 'Pregled' },
]

export function stepsFor(type: ProductType) {
  if (isBuildType(type)) return ALL_STEPS
  return ALL_STEPS.filter((s) => s.id === 'tip' || s.id === 'namena' || s.id === 'pregled').map((s) =>
    s.id === 'namena' ? { ...s, label: 'Skica i napomena', short: 'Skica' } : s,
  )
}

function init(): { state: ConfigState; step: number; maxStep: number } {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const local = loadLocal()
  const q = new URLSearchParams(search)
  const tip = q.get('tip') as ProductType | null
  if (tip) {
    const onlyType = [...q.keys()].every((k) => k === 'tip')
    if (onlyType) {
      // došli smo sa kartice proizvoda: tip je izabran, krećemo od sledećeg koraka
      if (local && local.state.type === tip) return local
      const st = fromQuery(search)
      if (st) return { state: st, step: 1, maxStep: 1 }
    } else {
      const st = fromQuery(search, local?.state)
      if (st) {
        const sameAsLocal = local && toQuery(local.state) === toQuery(st)
        const steps = stepsFor(st.type).length
        return sameAsLocal ? { ...local, state: st } : { state: st, step: 0, maxStep: steps - 1 }
      }
    }
  }
  return local ?? { state: initialState('aframe'), step: 0, maxStep: 0 }
}

export function useConfigurator() {
  const first = useRef(init())
  const [state, setState] = useState<ConfigState>(first.current.state)
  const [step, setStepRaw] = useState(first.current.step)
  const [maxStep, setMaxStep] = useState(first.current.maxStep)
  const [files, setFiles] = useState<File[]>([])
  const sketch = useSketch()

  const steps = useMemo(() => stepsFor(state.type), [state.type])
  const safeStep = Math.min(step, steps.length - 1)
  const current = steps[safeStep]

  // sinhronizacija sa URL-om i localStorage
  useEffect(() => {
    const qs = toQuery(state)
    const url = `${window.location.pathname}?${qs}`
    if (url !== window.location.pathname + window.location.search) history.replaceState(history.state, '', url)
    saveLocal({ state, step: safeStep, maxStep })
  }, [state, safeStep, maxStep])

  const update = useCallback((patch: Partial<ConfigState>) => {
    setState((s) => sanitize({ ...s, ...patch }))
  }, [])

  const setType = useCallback(
    (t: ProductType) => {
      if (state.type === t) return
      setMaxStep(0)
      setState((s) => changeType(s, t))
    },
    [state.type],
  )

  const stepError = useMemo((): string | null => {
    if (current.id === 'dimenzije') return validateDims(state.type, state.length, state.width, state.height)
    if (current.id === 'boja' && state.colorId === CUSTOM_COLOR_ID && !state.customRal.trim())
      return 'Upišite željenu boju ili RAL oznaku.'
    if (current.id === 'namena' && state.type === 'skica') {
      if (!sketch.hasSketch && files.length === 0 && state.note.trim().length < 10)
        return 'Slikajte skicu, dodajte fajl ili ukratko opišite šta Vam treba.'
      if (sketch.missingValues) return 'Upišite meru za svaku kotu na skici (ili obrišite praznu kotu).'
    }
    return null
  }, [current.id, state, sketch.hasSketch, sketch.missingValues, files.length])

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, steps.length - 1))
      setStepRaw(clamped)
      setMaxStep((m) => Math.max(m, clamped))
    },
    [steps.length],
  )

  const next = useCallback(() => {
    if (stepError) return false
    goTo(safeStep + 1)
    return true
  }, [goTo, safeStep, stepError])

  const back = useCallback(() => goTo(safeStep - 1), [goTo, safeStep])

  const reset = useCallback(() => {
    clearLocal()
    setState(initialState('aframe'))
    setFiles([])
    sketch.clear()
    setStepRaw(0)
    setMaxStep(0)
  }, [sketch])

  return {
    state,
    update,
    setType,
    steps,
    step: safeStep,
    current,
    maxStep: Math.min(maxStep, steps.length - 1),
    goTo,
    next,
    back,
    reset,
    stepError,
    files,
    setFiles,
    sketch,
  }
}

export type Configurator = ReturnType<typeof useConfigurator>
