import { useEffect, useId, useState } from 'react'
import { m } from 'framer-motion'
import { clamp, fmtNum, round1 } from '../../lib/format'
import { DIM_STEP } from '../../config/products'
import { CheckIcon } from '../ui/Icons'

export function StepTitle({ title, text }: { title: string; text?: string }) {
  return (
    <div className="mb-6">
      <h2 className="display text-[1.7rem] md:text-3xl">{title}</h2>
      {text && <p className="mt-2 text-ink-soft">{text}</p>}
    </div>
  )
}

/** Kartica za izbor (radio) */
export function ChoiceCard({
  selected,
  onSelect,
  title,
  text,
  icon,
  name,
  value,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  text?: string
  icon?: React.ReactNode
  name: string
  value: string
}) {
  return (
    <label
      className={`relative flex cursor-pointer gap-4 border-2 bg-white p-4 transition-colors md:p-5 ${
        selected ? 'border-navy' : 'border-line hover:border-navy/40'
      }`}
    >
      <input type="radio" className="sr-only" name={name} value={value} checked={selected} onChange={onSelect} />
      {icon && <span className="shrink-0 text-navy">{icon}</span>}
      <span className="flex-1">
        <span className="block text-lg font-bold">{title}</span>
        {text && <span className="mt-1 block text-[0.95rem] leading-snug text-ink-soft">{text}</span>}
      </span>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 ${selected ? 'border-navy bg-navy text-white' : 'border-line'}`}
        aria-hidden="true"
      >
        {selected && <CheckIcon className="h-4 w-4" />}
      </span>
    </label>
  )
}

/** Čip (preset) */
export function Chip({ active, onClick, children, label }: { active: boolean; onClick: () => void; children: React.ReactNode; label?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`min-h-12 border-2 px-4 text-base font-bold transition-colors ${
        active ? 'border-navy bg-navy text-white' : 'border-line bg-white text-steel hover:border-navy/50'
      }`}
    >
      {children}
    </button>
  )
}

/** Slajder + numeričko polje (korak 0,1 m) */
export function DimInput({
  label,
  value,
  min,
  max,
  onChange,
  step = DIM_STEP,
  unit = 'm',
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
  step?: number
  unit?: string
}) {
  const id = useId()
  const [text, setText] = useState(fmtNum(value, 1))
  const [focused, setFocused] = useState(false)
  useEffect(() => {
    if (!focused) setText(fmtNum(value, 1))
  }, [value, focused])

  const commit = (raw: string) => {
    const n = Number(raw.replace(',', '.').replace(/[^\d.]/g, ''))
    if (!raw.trim() || isNaN(n)) {
      setText(fmtNum(value, 1))
      return
    }
    const v = round1(clamp(n, min, max))
    onChange(v)
    setText(fmtNum(v, 1))
  }

  return (
    <div className="border-b border-line pb-4">
      <div className="flex items-end justify-between gap-4">
        <label htmlFor={`${id}-n`} className="font-bold">
          {label}
        </label>
        <div className="flex items-center border-2 border-line bg-white focus-within:border-navy">
          <input
            id={`${id}-n`}
            type="text"
            inputMode="decimal"
            className="h-11 w-20 bg-transparent px-2 text-right text-lg font-bold tabular-nums outline-none"
            value={text}
            onFocus={() => setFocused(true)}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => {
              setFocused(false)
              commit(e.target.value)
            }}
            onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
            aria-describedby={`${id}-h`}
          />
          <span className="pr-3 text-ink-soft">{unit}</span>
        </div>
      </div>
      <input
        type="range"
        className="range mt-2"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(round1(Number(e.target.value)))}
        aria-label={label}
        aria-valuetext={`${fmtNum(value, 1)} ${unit === 'm' ? 'metara' : unit}`}
      />
      <p id={`${id}-h`} className="flex justify-between text-xs text-ink-soft">
        <span>min {fmtNum(min, 1)} {unit}</span>
        <span>max {fmtNum(max, 1)} {unit}</span>
      </p>
    </div>
  )
}

/** Prekidač uključi/isključi */
export function Toggle({
  checked,
  onChange,
  title,
  text,
  children,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  text?: string
  children?: React.ReactNode
}) {
  const id = useId()
  return (
    <div className={`border-2 bg-white transition-colors ${checked ? 'border-navy' : 'border-line'}`}>
      <div className="flex items-center gap-4 p-4 md:p-5">
        <div className="flex-1">
          <label htmlFor={id} className="block cursor-pointer text-lg font-bold">
            {title}
          </label>
          {text && <p className="mt-0.5 text-[0.95rem] text-ink-soft">{text}</p>}
        </div>
        <button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-8 w-14 shrink-0 border-2 transition-colors ${checked ? 'border-navy bg-navy' : 'border-line bg-paper'}`}
        >
          <m.span
            className={`absolute top-1/2 block h-5 w-5 -translate-y-1/2 ${checked ? 'bg-white' : 'bg-steel/40'}`}
            animate={{ left: checked ? 28 : 4 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
          <span className="sr-only">{checked ? 'Uključeno' : 'Isključeno'}</span>
        </button>
      </div>
      {checked && children && <div className="border-t border-line px-4 pb-2 pt-4 md:px-5">{children}</div>}
    </div>
  )
}
