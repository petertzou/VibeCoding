import { useState, useCallback } from 'react'
import './App.css'

type Operator = '+' | '-' | '×' | '÷'

const DIV_ZERO_ERROR = 'Div 0 error'
const MAX_DECIMAL_PLACES = 8

type CalcResult = { ok: true; value: number } | { ok: false; error: typeof DIV_ZERO_ERROR }

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a))
  let y = Math.abs(Math.round(b))
  while (y !== 0) {
    const temp = y
    y = x % y
    x = temp
  }
  return x || 1
}

/** 判斷 a÷b 是否為除不盡（小數無限循環） */
function isNonTerminatingDivision(a: number, b: number): boolean {
  if (b === 0) return false

  const scale = 1e9
  let numerator = Math.round(a * scale)
  let denominator = Math.round(b * scale)
  const divisor = gcd(numerator, denominator)
  numerator = Math.trunc(numerator / divisor)
  denominator = Math.trunc(denominator / divisor)

  while (denominator % 2 === 0) denominator /= 2
  while (denominator % 5 === 0) denominator /= 5

  return denominator !== 1
}

function calculate(a: number, b: number, op: Operator): CalcResult {
  switch (op) {
    case '+':
      return { ok: true, value: a + b }
    case '-':
      return { ok: true, value: a - b }
    case '×':
      return { ok: true, value: a * b }
    case '÷':
      if (b === 0) return { ok: false, error: DIV_ZERO_ERROR }
      return { ok: true, value: a / b }
  }
}

function trimTrailingZeros(value: string): string {
  return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

function formatDivisionResult(a: number, b: number, result: number): string {
  if (isNonTerminatingDivision(a, b)) {
    return `${trimTrailingZeros(result.toFixed(MAX_DECIMAL_PLACES))}…`
  }
  return trimTrailingZeros(String(result))
}

function formatResult(
  result: CalcResult,
  op: Operator,
  a: number,
  b: number,
): string {
  if (!result.ok) return result.error
  if (op === '÷') return formatDivisionResult(a, b, result.value)
  return trimTrailingZeros(String(result.value))
}

function formatDisplay(value: string): string {
  if (value === DIV_ZERO_ERROR) return value
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  if (value.endsWith('…')) return value
  if (value.length > 12) return num.toExponential(6)
  return value
}

function isErrorDisplay(value: string): boolean {
  return value === DIV_ZERO_ERROR
}

export default function App() {
  const [display, setDisplay] = useState('0')
  const [previousValue, setPreviousValue] = useState<number | null>(null)
  const [operator, setOperator] = useState<Operator | null>(null)
  const [waitingForOperand, setWaitingForOperand] = useState(false)

  const handleNumber = useCallback(
    (digit: string) => {
      setDisplay((current) => {
        if (isErrorDisplay(current)) return digit
        if (waitingForOperand) {
          setWaitingForOperand(false)
          return digit
        }
        if (current === '0' && digit !== '.') return digit
        if (digit === '.' && current.includes('.')) return current
        return current + digit
      })
    },
    [waitingForOperand],
  )

  const handleOperator = useCallback(
    (nextOp: Operator) => {
      const currentValue = parseFloat(display)

      if (previousValue !== null && operator && !waitingForOperand) {
        const result = calculate(previousValue, currentValue, operator)
        if (!result.ok) {
          setDisplay(result.error)
          setPreviousValue(null)
          setOperator(null)
          setWaitingForOperand(true)
          return
        }
        const resultStr = formatResult(result, operator, previousValue, currentValue)
        setDisplay(resultStr)
        setPreviousValue(result.value)
      } else {
        setPreviousValue(currentValue)
      }

      setOperator(nextOp)
      setWaitingForOperand(true)
    },
    [display, previousValue, operator, waitingForOperand],
  )

  const handleEquals = useCallback(() => {
    if (operator === null || previousValue === null) return

    const currentValue = parseFloat(display)
    const result = calculate(previousValue, currentValue, operator)
    setDisplay(formatResult(result, operator, previousValue, currentValue))

    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(true)
  }, [display, previousValue, operator])

  const handleClear = useCallback(() => {
    setDisplay('0')
    setPreviousValue(null)
    setOperator(null)
    setWaitingForOperand(false)
  }, [])

  type ButtonDef = {
    label: string
    type: 'number' | 'operator' | 'equals' | 'clear'
    col: number
    row: number
    colSpan?: number
  }

  const digitButtons: ButtonDef[] = [
    { label: '7', type: 'number', col: 1, row: 2 },
    { label: '8', type: 'number', col: 2, row: 2 },
    { label: '9', type: 'number', col: 3, row: 2 },
    { label: '4', type: 'number', col: 1, row: 3 },
    { label: '5', type: 'number', col: 2, row: 3 },
    { label: '6', type: 'number', col: 3, row: 3 },
    { label: '1', type: 'number', col: 1, row: 4 },
    { label: '2', type: 'number', col: 2, row: 4 },
    { label: '3', type: 'number', col: 3, row: 4 },
    { label: '0', type: 'number', col: 1, row: 5, colSpan: 2 },
    { label: '.', type: 'number', col: 3, row: 5 },
  ]

  const actionButtons: ButtonDef[] = [
    { label: 'C', type: 'clear', col: 1, row: 1, colSpan: 3 },
    { label: '÷', type: 'operator', col: 4, row: 1 },
    { label: '×', type: 'operator', col: 4, row: 2 },
    { label: '-', type: 'operator', col: 4, row: 3 },
    { label: '+', type: 'operator', col: 4, row: 4 },
    { label: '=', type: 'equals', col: 4, row: 5 },
  ]

  const buttons = [...digitButtons, ...actionButtons]

  const gridStyle = (btn: ButtonDef) => ({
    gridColumn: btn.colSpan ? `${btn.col} / span ${btn.colSpan}` : btn.col,
    gridRow: btn.row,
  })

  const expression =
    previousValue !== null && operator && !isErrorDisplay(display)
      ? `${trimTrailingZeros(String(previousValue))} ${operator}`
      : ''

  const displayText = formatDisplay(display)
  const isError = isErrorDisplay(display)
  const isCompact = displayText.length > 10

  const handleClick = (btn: ButtonDef) => {
    switch (btn.type) {
      case 'number':
        handleNumber(btn.label)
        break
      case 'operator':
        handleOperator(btn.label as Operator)
        break
      case 'equals':
        handleEquals()
        break
      case 'clear':
        handleClear()
        break
    }
  }

  return (
    <div className="app-shell">
      <div className="calculator">
        <header className="calc-header">
          <div className="calc-brand">
            <span className="calc-icon" aria-hidden="true">
              ÷
            </span>
            <h1 className="calc-title">計算機</h1>
          </div>
        </header>

        <section className="display-panel" aria-label="顯示區">
          <p className="expression" aria-live="polite">
            {expression || '\u00a0'}
          </p>
          <p
            className={[
              'display-value',
              isError && 'display-value--error',
              isCompact && 'display-value--compact',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-live="polite"
          >
            {displayText}
          </p>
        </section>

        <div className="keypad">
          {buttons.map((btn) => {
            const isActiveOp = btn.type === 'operator' && operator === btn.label
            return (
              <button
                key={btn.label + btn.type}
                type="button"
                className={[
                  'btn',
                  `btn-${btn.type}`,
                  btn.col === 4 && 'btn-action-col',
                  isActiveOp && 'btn-active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={gridStyle(btn)}
                onClick={() => handleClick(btn)}
              >
                {btn.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
