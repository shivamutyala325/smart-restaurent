import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export default function Login() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/sessions/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, tableNumber })
      })
      if (!res.ok) throw new Error('Login failed')
      const session = await res.json()
      navigate(`/customer/${session._id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: 520, margin: '60px auto' }}>
        <h2 style={{ marginTop: 0 }}>Start Session</h2>
        <p className="pill">Simulated OTP: enter phone + table number</p>
        <form onSubmit={handleSubmit} className="space-y">
          <div className="row">
            <input className="input" value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="Phone (e.g. 9876543210)" required />
            <input className="input" value={tableNumber} onChange={(e)=>setTableNumber(e.target.value)} placeholder="Table Number (e.g. T12)" required />
          </div>
          <div className="row">
            <button className="primary" disabled={loading}>{loading ? 'Starting...' : 'Start Session'}</button>
          </div>
          {error && <p style={{ color: 'salmon' }}>{error}</p>}
        </form>
      </div>
    </div>
  )
}
