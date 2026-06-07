import { useState, useEffect, useCallback } from 'react'
import './App.css'

const OPERATORS = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => (b === 0 ? NaN : a / b),
}

function format(value) {
  if (value === 'Error') return 'Error'
  const num = Number(value)
  if (!isFinite(num)) return 'Error'
  const rounded = Math.round((num + Number.EPSILON) * 1e10) / 1e10
  return String(rounded)
}

export default function App() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)        
  const [operator, setOperator] = useState(null)
  const [overwrite, setOverwrite] = useState(true) 

  const inputDigit = useCallback((digit) => {
    setDisplay((d) => {
      if (overwrite) return digit
      if (d === '0') return digit
      if (d.replace('-', '').replace('.', '').length >= 15) return d 
      return d + digit
    })
    setOverwrite(false)
  }, [overwrite])

  const inputDot = useCallback(() => {
    setDisplay((d) => {
      if (overwrite) return '0.'
      if (d.includes('.')) return d
      return d + '.'
    })
    setOverwrite(false)
  }, [overwrite])

  const clearAll = useCallback(() => {
    setDisplay('0')
    setPrev(null)
    setOperator(null)
    setOverwrite(true)
  }, [])

  const toggleSign = useCallback(() => {
    setDisplay((d) => (d === '0' || d === 'Error' ? d : format(-Number(d))))
  }, [])

  const percent = useCallback(() => {
    setDisplay((d) => (d === 'Error' ? d : format(Number(d) / 100)))
    setOverwrite(true)
  }, [])

  const compute = useCallback(() => {
    if (operator == null || prev == null) return Number(display)
    const result = OPERATORS[operator](prev, Number(display))
    return result
  }, [operator, prev, display])

  const chooseOperator = useCallback((op) => {
    if (display === 'Error') return
    if (operator != null && !overwrite) {
      const result = compute()
      const formatted = format(result)
      setDisplay(formatted)
      setPrev(formatted === 'Error' ? null : Number(formatted))
    } else {
      setPrev(Number(display))
    }
    setOperator(op)
    setOverwrite(true)
  }, [display, operator, overwrite, compute])

  const equals = useCallback(() => {
    if (operator == null || prev == null) return
    const formatted = format(compute())
    setDisplay(formatted)
    setPrev(null)
    setOperator(null)
    setOverwrite(true)
  }, [operator, prev, compute])

  const backspace = useCallback(() => {
    if (overwrite) return
    setDisplay((d) => {
      if (d.length <= 1 || (d.length === 2 && d.startsWith('-'))) return '0'
      return d.slice(0, -1)
    })
  }, [overwrite])

  
  useEffect(() => {
    const onKey = (e) => {
      const { key } = e
      if (key >= '0' && key <= '9') inputDigit(key)
      else if (key === '.') inputDot()
      else if (key === '+') chooseOperator('+')
      else if (key === '-') chooseOperator('-')
      else if (key === '*') chooseOperator('×')
      else if (key === '/') { e.preventDefault(); chooseOperator('÷') }
      else if (key === 'Enter' || key === '=') { e.preventDefault(); equals() }
      else if (key === 'Backspace') backspace()
      else if (key === 'Escape') clearAll()
      else if (key === '%') percent()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [inputDigit, inputDot, chooseOperator, equals, backspace, clearAll, percent])

  const Btn = ({ label, onClick, className = '' }) => (
    <button className={`btn ${className}`} onClick={onClick}>
      {label}
    </button>
  )

  return (
    <div className="calculator">
      <div className="display">
        <div className="expression">
          {prev != null ? `${format(prev)} ${operator ?? ''}` : ' '}
        </div>
        <div className="current">{display}</div>
      </div>
      <div className="keys">
        <Btn label="AC" className="fn" onClick={clearAll} />
        <Btn label="±" className="fn" onClick={toggleSign} />
        <Btn label="%" className="fn" onClick={percent} />
        <Btn label="÷" className="op" onClick={() => chooseOperator('÷')} />

        <Btn label="7" onClick={() => inputDigit('7')} />
        <Btn label="8" onClick={() => inputDigit('8')} />
        <Btn label="9" onClick={() => inputDigit('9')} />
        <Btn label="×" className="op" onClick={() => chooseOperator('×')} />

        <Btn label="4" onClick={() => inputDigit('4')} />
        <Btn label="5" onClick={() => inputDigit('5')} />
        <Btn label="6" onClick={() => inputDigit('6')} />
        <Btn label="-" className="op" onClick={() => chooseOperator('-')} />

        <Btn label="1" onClick={() => inputDigit('1')} />
        <Btn label="2" onClick={() => inputDigit('2')} />
        <Btn label="3" onClick={() => inputDigit('3')} />
        <Btn label="+" className="op" onClick={() => chooseOperator('+')} />

        <Btn label="0" className="zero" onClick={() => inputDigit('0')} />
        <Btn label="." onClick={inputDot} />
        <Btn label="=" className="op equals" onClick={equals} />
      </div>
    </div>
  )
}
