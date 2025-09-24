import { useEffect, useState } from 'react'
import { Link, Routes, Route, useParams, useNavigate, Navigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export default function Customer(){
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [menu, setMenu] = useState([])
  const [error, setError] = useState('')

  const load = async () => {
    try{
      setError('')
      const [sRes, mRes] = await Promise.all([
        fetch(`${API_BASE}/sessions/${sessionId}`),
        fetch(`${API_BASE}/menu`)
      ])
      if(!sRes.ok){ navigate('/login'); return }
      setSession(await sRes.json())
      setMenu(await mRes.json())
    }catch(e){
      setError('Failed to load data')
    }
  }

  useEffect(()=>{ load() },[sessionId])

  const addToCart = async (menuItemId) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/cart`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ menuItemId, quantity: 1 }) })
    load()
  }

  const moveToKeep = async (menuItemId) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/keep`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ menuItemId }) })
    load()
  }

  const moveKeepToCart = async (menuItemId) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/keep-to-cart`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ menuItemId }) })
    load()
  }

  const updateQty = async (menuItemId, quantity) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/cart/quantity`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ menuItemId, quantity }) })
    load()
  }

  const placeOrder = async () => {
    await fetch(`${API_BASE}/sessions/${sessionId}/order`, { method:'POST' })
    load()
  }

  const cancelOrder = async (orderId) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/order/${orderId}/cancel`, { method:'POST' })
    load()
  }

  const serveOrder = async (orderId) => {
    await fetch(`${API_BASE}/sessions/${sessionId}/order/${orderId}/served`, { method:'POST' })
    load()
  }

  const pay = async () => {
    const res = await fetch(`${API_BASE}/sessions/${sessionId}/pay`, { method:'POST' })
    if(res.ok){ navigate('/login') }
  }

  if(!session) return <div className="container">Loading...</div>

  return (
    <div className="container">
      <nav className="nav">
        <Link className="tab" to={`/customer/${sessionId}/menu`}>Menu</Link>
        <Link className="tab" to={`/customer/${sessionId}/cart`}>Cart</Link>
        <Link className="tab" to={`/customer/${sessionId}/orders`}>Orders</Link>
        <span style={{ marginLeft:'auto' }} className="pill">
          <b>Total:</b> ₹{session.totalAmount?.toFixed(2)} • <b>Items:</b> {session.totalItemsOrdered}
        </span>
      </nav>
      {error && <div style={{ color:'salmon' }}>{error}</div>}
      <Routes>
        <Route path="menu" element={<MenuPage menu={menu} onAdd={addToCart} />} />
        <Route path="cart" element={<CartPage session={session} onKeep={moveToKeep} onQty={updateQty} onOrder={placeOrder} onKeepToCart={moveKeepToCart} />} />
        <Route path="orders" element={<OrdersPage session={session} onCancel={cancelOrder} onServed={serveOrder} onPay={pay} />} />
        <Route path="*" element={<Navigate to={`/customer/${sessionId}/menu`} replace />} />
      </Routes>
    </div>
  )
}

function MenuPage({ menu, onAdd }){
  return (
    <div className="space-y">
      <h3>Menu</h3>
      <ul className="list space-y">
        {menu.map(m => (
          <li className="item row" key={m._id}>
            <div style={{ flex:1 }}>
              <div><b>{m.name}</b> <i style={{ color:'#9ca3af' }}>({m.category})</i></div>
              <div style={{ color:'#9ca3af' }}>{m.description}</div>
            </div>
            <div className="pill">₹{m.price}</div>
            <button className="primary" onClick={()=>onAdd(m._id)} disabled={!m.isAvailable}>Add to cart</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function CartPage({ session, onKeep, onQty, onOrder, onKeepToCart }){
  return (
    <div className="space-y">
      <h3>Cart</h3>
      {session.cart?.length ? (
        <>
          <ul className="list space-y">
            {session.cart.map(ci => (
              <li className="item row" key={ci.menuItem}>
                <div style={{ flex:1 }}>{ci.menuItem?.name || ci.menuItem}</div>
                <div className="row">
                  <button className="ghost" onClick={()=>onQty(ci.menuItem?._id || ci.menuItem, (ci.quantity||1)-1)}>-</button>
                  <div className="pill">{ci.quantity}</div>
                  <button className="ghost" onClick={()=>onQty(ci.menuItem?._id || ci.menuItem, (ci.quantity||1)+1)}>+</button>
                </div>
                <button className="ghost" onClick={()=>onKeep(ci.menuItem?._id || ci.menuItem)}>Keep for later</button>
              </li>
            ))}
          </ul>
          <button className="primary" onClick={onOrder}>Place Order</button>
        </>
      ) : <p className="pill">No items in cart</p>}

      <h4>Keep for later</h4>
      <ul className="list space-y">
        {session.keepForLater?.map(ki => (
          <li className="item row" key={ki.menuItem}>
            <div style={{ flex:1 }}>{ki.menuItem?.name || ki.menuItem} × {ki.quantity}</div>
            <button className="primary" onClick={()=>onKeepToCart(ki.menuItem?._id || ki.menuItem)}>Move to cart</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OrdersPage({ session, onCancel, onServed, onPay }){
  return (
    <div className="space-y">
      <h3>Orders</h3>
      {session.orders?.length ? (
        <ul className="list space-y">
          {session.orders.map(o => (
            <li className="item" key={o._id}>
              <div className="row">
                <div className="pill"><b>Status:</b> {o.status}</div>
                <div className="pill"><b>Total:</b> ₹{o.totalAmount?.toFixed(2)}</div>
                {['Pending'].includes(o.status) && (
                  <button className="danger" onClick={()=>onCancel(o._id)}>Cancel</button>
                )}
                {['Pending','In-Progress','Ready'].includes(o.status) && (
                  <button className="success" onClick={()=>onServed(o._id)}>Mark Served</button>
                )}
              </div>
              <ul className="list space-y" style={{ marginTop:8 }}>
                {o.items.map((it, idx) => (
                  <li className="item row" key={idx}>
                    <div style={{ flex:1 }}>{it.name} × {it.quantity}</div>
                    <div className="pill">₹{it.price}</div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : <p className="pill">No orders yet</p>}

      <button className="success" onClick={onPay}>Pay and Close Session</button>
    </div>
  )
}
