import { useEffect, useMemo, useState } from 'react'
import { CATEGORY_MAP, CURRENCIES } from '../constants.js'
import { deleteExpense } from '../db.js'
import { fetchEurRates, toEUR } from '../utils/fx.js'

function monthLabel(d) {
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

export default function ExpenseList({ expenses, onChanged }) {
  const [cursor, setCursor] = useState(() => new Date())
  const [rates, setRates] = useState({ EUR: 1, USD: null, AED: null })

  useEffect(() => {
    fetchEurRates().then(r => setRates(r.rates))
  }, [])

  const monthKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`

  const monthExpenses = useMemo(
    () => expenses.filter(e => e.date.startsWith(monthKey)),
    [expenses, monthKey]
  )

  const totals = useMemo(() => {
    const t = {}
    for (const c of CURRENCIES) t[c] = 0
    for (const e of monthExpenses) t[e.currency] = (t[e.currency] || 0) + e.amount
    return t
  }, [monthExpenses])

  const totalEUR = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + (toEUR(e.amount, e.currency, rates) || 0), 0),
    [monthExpenses, rates]
  )

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return
    await deleteExpense(id)
    onChanged?.()
  }

  return (
    <div>
      <div className="month-nav">
        <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>←</button>
        <strong style={{ textTransform: 'capitalize' }}>{monthLabel(cursor)}</strong>
        <button onClick={() => setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>→</button>
      </div>

      <div className="totals-grid">
        {CURRENCIES.map(c => (
          <div className="total-chip" key={c}>
            <div className="v">{totals[c].toFixed(2)}</div>
            <div className="l">{c}</div>
          </div>
        ))}
      </div>
      <div className="total-chip" style={{ marginBottom: 14 }}>
        <div className="v">≈ {totalEUR.toFixed(2)} EUR</div>
        <div className="l">Estimated total (converted)</div>
      </div>

      <div className="card">
        {monthExpenses.length === 0 && (
          <div className="empty-state">No expenses recorded for this month.</div>
        )}
        {monthExpenses.map(e => (
          <div className="expense-item" key={e.id}>
            <div className="expense-left">
              <span className="expense-cat">{CATEGORY_MAP[e.category] || e.category}</span>
              <span className="expense-meta">
                {new Date(e.date).toLocaleDateString('en-GB')}
                {e.note ? ` · ${e.note}` : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="expense-amount">{e.amount.toFixed(2)} {e.currency}</span>
              <button className="expense-del" onClick={() => handleDelete(e.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
