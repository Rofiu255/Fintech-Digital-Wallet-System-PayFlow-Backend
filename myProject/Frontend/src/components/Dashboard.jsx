import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import Sidebar from './Sidebar'
import TransferForm from './TransferForm'
import TransactionsTable from './TransactionsTable'
import api from '../api'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const [tx, setTx] = useState([])
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // try to fetch transactions if backend supports it
    const load = async () => {
      try {
        const res = await api.get('/api/wallet/transactions')
        setTx(res.data || [])
      } catch (e) {
        // ignore if endpoint missing
      }
      // if backend returns user balance via profile, fetch it
      try {
        const res = await api.get('/api/auth/me')
        setBalance(res.data?.balance ?? 0)
      } catch (e) {}
    }
    load()
  }, [])

  const onTransfer = (newTx) => {
    setTx([newTx, ...tx])
  }

  return (
    <div className="dashboard-root">
      <Sidebar onLogout={logout} />
      <main className="dashboard-main">
        <header className="dash-header">
          <div>
            <h1>Welcome, {user?.name || user?.email || 'User'}</h1>
            <p className="muted">Balance: <strong>₦{balance}</strong></p>
          </div>
        </header>

        <section className="grid">
          <TransferForm onTransfer={onTransfer} />
          <TransactionsTable items={tx} />
        </section>
      </main>
    </div>
  )
}
