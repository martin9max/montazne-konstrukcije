/** 6 -> "6", 2.4 -> "2,4", 7.55 -> "7,55" */
export function fmtNum(n: number, maxDecimals = 2): string {
  const r = Math.round(n * 10 ** maxDecimals) / 10 ** maxDecimals
  return r.toLocaleString('sr-Latn-RS', { maximumFractionDigits: maxDecimals })
}
export const fmtM = (n: number) => `${fmtNum(n, 1)} m`
export const fmtM2 = (n: number) => `${fmtNum(n, 1)} m²`
export const round1 = (n: number) => Math.round(n * 10) / 10
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
export function fmtMoney(n: number, currency = 'EUR') {
  return n.toLocaleString('sr-Latn-RS', { style: 'currency', currency, maximumFractionDigits: 0 })
}
