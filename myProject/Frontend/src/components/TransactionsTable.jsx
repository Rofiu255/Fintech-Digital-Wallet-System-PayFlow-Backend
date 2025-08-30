import React from 'react'

export default function TransactionsTable({ items = [] }){
  return (
    <div className="card transactions">
      <h3>Recent transactions</h3>
      {items.length === 0 ? (
        <p className="muted">No transactions yet — make a transfer to see history</p>
      ) : (
        <table className="tx-table">
          <thead>
            <tr><th>To</th><th>Amount</th><th>Date</th></tr>
          </thead>
          <tbody>
            {items.map((t, i) => (
              <tr key={i}>
                <td>{t.to}</td>
                <td>₦{t.amount}</td>
                <td>{new Date(t.createdAt || t.date || Date.now()).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
