import React, { useState } from 'react'
import api from '../api'


export default function TransferForm({ onTransfer }){
const [to, setTo] = useState('')
const [amount, setAmount] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
const [success, setSuccess] = useState(null)


const submit = async (e) =>{
e.preventDefault()
setError(null)
setSuccess(null)
setLoading(true)
try{
const res = await api.post('/api/wallet/transfer', { to, amount: Number(amount) })
setSuccess('Transfer successful')
setTo('')
setAmount('')
onTransfer && onTransfer(res.data)
}catch(err){
setError(err?.response?.data?.msg || 'Transfer failed')
}
setLoading(false)
}


return (
<form className="card transfer" onSubmit={submit}>
<h3>Send money</h3>
<input placeholder="Recipient (email or id)" value={to} onChange={e=>setTo(e.target.value)} required />
<input placeholder="Amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)} required />
<button className="btn-primary" type="submit" disabled={loading}>{loading? 'Sending...' : 'Send'}</button>
{error && <div className="error">{error}</div>}
{success && <div className="success">{success}</div>}
</form>
)
}