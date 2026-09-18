import { useCallback, useEffect, useState } from 'react'
import Header from './components/Header.jsx'
import ExpenseForm from './components/ExpenseForm.jsx'
import ExpenseList from './components/ExpenseList.jsx'
import ReportView from './components/ReportView.jsx'
import { getAllExpenses } from './db.js'

export default function App() {
  const [tab, setTab] = useState('new')
  const [expenses, setExpenses] = useState([])

  const reload = useCallback(async () => {
    const rows = await getAllExpenses()
    setExpenses(rows)
  }, [])

  useEffect(() => { reload() }, [reload])

  return (
    <>
      <Header />
      <nav className="tabs">
        <button className={tab === 'new' ? 'active' : ''} onClick={() => setTab('new')}>+ Expense</button>
        <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>List</button>
        <button className={tab === 'report' ? 'active' : ''} onClick={() => setTab('report')}>Report</button>
      </nav>
      <main>
        {tab === 'new' && (
          <ExpenseForm onSaved={() => { reload(); setTab('list') }} />
        )}
        {tab === 'list' && (
          <ExpenseList expenses={expenses} onChanged={reload} />
        )}
        {tab === 'report' && (
          <ReportView expenses={expenses} />
        )}
      </main>
    </>
  )
}
