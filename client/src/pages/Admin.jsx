import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export default function Admin(){
  const [creds, setCreds] = useState({ name:'admin', password:'admin123' })
  const [authed, setAuthed] = useState(false)
  const [activeTab, setActiveTab] = useState('menu')

  const [menu, setMenu] = useState([])
  const [dash, setDash] = useState(null)

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState({ name:'', price:'', description:'', category:'' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name:'', price:'', description:'', category:'' })
  const [error, setError] = useState('')

  const adminHeaders = { 'x-admin-name': creds.name, 'x-admin-password': creds.password, 'Content-Type':'application/json' }

  const login = async () => {
    setError('')
    const res = await fetch(`${API_BASE}/admin/login`, { method:'POST', headers: adminHeaders, body: JSON.stringify({}) })
    if(res.ok){ setAuthed(true); loadAll() } else { setError('Login failed') }
  }

  const loadAll = async () => {
    try{
      setError('')
      const mRes = await fetch(`${API_BASE}/menu`)
      if(!mRes.ok) throw new Error('Failed to load menu')
      setMenu(await mRes.json())
      const dRes = await fetch(`${API_BASE}/admin/dashboard`, { headers: adminHeaders })
      if(dRes.ok) setDash(await dRes.json())
    }catch(e){ setError(e.message) }
  }

  const createItem = async () => {
    setError('')
    const p = Number(addForm.price)
    if(!addForm.name || isNaN(p) || p < 0 || !addForm.category){
      setError('Please provide name, category, and a valid non-negative price')
      return
    }
    try{
      const res = await fetch(`${API_BASE}/menu`, { method:'POST', headers: adminHeaders, body: JSON.stringify({ ...addForm, price: p }) })
      if(!res.ok){
        const t = await res.text(); throw new Error(t || 'Create failed')
      }
      setAddForm({ name:'', price:'', description:'', category:'' })
      setShowAddForm(false)
      loadAll()
    }catch(e){ setError(e.message) }
  }

  const startEdit = (item) => {
    setEditingId(item._id)
    setEditForm({ name:item.name, price:String(item.price), description:item.description || '', category:item.category || '' })
  }

  const saveEdit = async (id) => {
    setError('')
    const p = Number(editForm.price)
    if(!editForm.name || isNaN(p) || p < 0 || !editForm.category){
      setError('Please provide name, category, and a valid non-negative price')
      return
    }
    try{
      const res = await fetch(`${API_BASE}/menu/${id}`, { method:'PUT', headers: adminHeaders, body: JSON.stringify({ ...editForm, price: p }) })
      if(!res.ok){ const t = await res.text(); throw new Error(t || 'Update failed') }
      setEditingId(null)
      loadAll()
    }catch(e){ setError(e.message) }
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const deleteItem = async (id) => {
    setError('')
    try{
      const res = await fetch(`${API_BASE}/menu/${id}`, { method:'DELETE', headers: adminHeaders })
      if(!res.ok){ const t = await res.text(); throw new Error(t || 'Delete failed') }
      loadAll()
    }catch(e){ setError(e.message) }
  }

  useEffect(()=>{ if(authed) loadAll() },[authed])
  useEffect(()=>{ if(authed) loadAll() },[activeTab])

  if(!authed){
    return (
      <div className="container">
        <div className="card" style={{ maxWidth: 520, margin:'60px auto' }}>
          <h3>Admin Login</h3>
          <div className="row">
            <input className="input" placeholder="Name" value={creds.name} onChange={e=>setCreds({...creds, name:e.target.value})} />
            <input className="input" placeholder="Password" type="password" value={creds.password} onChange={e=>setCreds({...creds, password:e.target.value})} />
            <button className="primary" onClick={login}>Login</button>
          </div>
          {error && <div style={{ color:'salmon', marginTop:8 }}>{error}</div>}
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="header">
        <h2 style={{ margin: 0 }}>Admin</h2>
        {dash && <span className="pill"><b>Active Tables:</b> {dash.activeTables} • <b>Pending:</b> {dash.pendingOrders?.length}</span>}
      </div>

      <div className="nav">
        <button onClick={()=>setActiveTab('menu')} className={activeTab==='menu'?'tab active':'tab'}>Menu</button>
        <button onClick={()=>setActiveTab('sessions')} className={activeTab==='sessions'?'tab active':'tab'}>Active Sessions</button>
      </div>

      {error && <div style={{ color:'salmon', marginBottom:12 }}>{error}</div>}

      {activeTab === 'menu' && (
        <div className="space-y">
          <h3>Menu Items</h3>
          <ul className="list space-y">
            {menu.map(mi => (
              <li className="item" key={mi._id}>
                {editingId === mi._id ? (
                  <div className="row">
                    <input className="input" placeholder="Name" value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})} />
                    <input className="input" placeholder="Price" value={editForm.price} onChange={e=>setEditForm({...editForm, price:e.target.value})} />
                    <input className="input" placeholder="Category" value={editForm.category} onChange={e=>setEditForm({...editForm, category:e.target.value})} />
                    <input className="input" placeholder="Description" value={editForm.description} onChange={e=>setEditForm({...editForm, description:e.target.value})} />
                    <button className="success" onClick={()=>saveEdit(mi._id)}>Save</button>
                    <button className="ghost" onClick={cancelEdit}>Cancel</button>
                  </div>
                ) : (
                  <div className="row">
                    <div style={{ flex:1 }}>
                      <div><b>{mi.name}</b> <i style={{ color:'#9ca3af' }}>({mi.category})</i></div>
                      <div style={{ color:'#9ca3af' }}>{mi.description}</div>
                    </div>
                    <div className="pill">₹{mi.price}</div>
                    <button className="ghost" onClick={()=>startEdit(mi)}>Edit</button>
                    <button className="danger" onClick={()=>deleteItem(mi._id)}>Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {!showAddForm && (
            <button className="primary" onClick={()=>setShowAddForm(true)} style={{ marginTop:16 }}>Add New Item</button>
          )}

          {showAddForm && (
            <div className="card" style={{ marginTop:12 }}>
              <div className="row">
                <input className="input" placeholder="Name" value={addForm.name} onChange={e=>setAddForm({...addForm, name:e.target.value})} />
                <input className="input" placeholder="Price" value={addForm.price} onChange={e=>setAddForm({...addForm, price:e.target.value})} />
                <input className="input" placeholder="Category" value={addForm.category} onChange={e=>setAddForm({...addForm, category:e.target.value})} />
                <input className="input" placeholder="Description" value={addForm.description} onChange={e=>setAddForm({...addForm, description:e.target.value})} />
                <button className="success" onClick={createItem}>Create</button>
                <button className="ghost" onClick={()=>{ setShowAddForm(false); setAddForm({ name:'', price:'', description:'', category:'' }) }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div>
          <h3>Active Sessions</h3>
          <ul className="list space-y">
            {dash?.activeSessions?.map(s => (
              <li className="item" key={s._id}>Table {s.tableNumber} • Phone {s.phone} • Total ₹{s.totalAmount} • Items {s.totalItemsOrdered}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
