import { useId } from 'react'
import type { Sketch } from '../../../lib/useSketch'

const CameraIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 7h4l2-3h6l2 3h4v13H3z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)
const ImageIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M3 4h18v16H3z" />
    <path d="M3 16l5-5 4 4 3-3 6 6" />
    <circle cx="16" cy="8.5" r="1.5" />
  </svg>
)

/** Dugmad „Slikaj skicu“ (kamera na telefonu) i „Izaberi sliku“ */
export function SketchCapture({ sketch, compact = false, light = false }: { sketch: Sketch; compact?: boolean; light?: boolean }) {
  const id = useId()
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    sketch.load(e.target.files?.[0])
    e.target.value = ''
  }
  const primary = light ? 'btn btn-primary' : 'btn btn-primary'
  return (
    <div className={`flex ${compact ? 'flex-row flex-wrap gap-2' : 'flex-col gap-3 sm:flex-row'}`}>
      <label htmlFor={`${id}-cam`} className={`${primary} ${compact ? 'h-11 min-h-11 px-4 text-sm' : 'h-14 flex-1 text-lg'} cursor-pointer`}>
        <CameraIcon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        {sketch.hasSketch ? 'Slikaj ponovo' : 'Slikaj skicu'}
      </label>
      <input id={`${id}-cam`} type="file" accept="image/*" capture="environment" className="sr-only" onChange={onFile} />
      <label htmlFor={`${id}-file`} className={`btn btn-outline-dark ${compact ? 'h-11 min-h-11 px-4 text-sm' : 'h-14 flex-1'} cursor-pointer bg-white`}>
        <ImageIcon className={compact ? 'h-5 w-5' : 'h-6 w-6'} />
        Izaberi sliku
      </label>
      <input id={`${id}-file`} type="file" accept="image/jpeg,image/png,image/webp,image/heic" className="sr-only" onChange={onFile} />
    </div>
  )
}
