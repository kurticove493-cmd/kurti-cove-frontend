'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Search } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const toLocalInput = d => {
  if (!d) return ''
  const dt = new Date(d), pad = n => String(n).padStart(2,'0')
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

const ADM_CSS = `
  .adm-btn-primary{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;background:${INK};color:${WHT};border:none;cursor:pointer;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;transition:background 0.15s;}
  .adm-btn-primary:hover{background:#333;}
  .adm-btn-primary:disabled{background:#aaa;cursor:not-allowed;}
  .adm-btn-ghost{display:inline-flex;align-items:center;gap:7px;padding:9px 20px;background:none;color:${INK};border:1px solid ${RULE};cursor:pointer;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;transition:border-color 0.15s;}
  .adm-btn-ghost:hover{border-color:${INK};}
  .adm-table{width:100%;border-collapse:collapse;font-family:Poppins,sans-serif;font-size:13px;}
  .adm-table th{text-align:left;padding:11px 14px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${MUTE};background:#fafafa;border-bottom:1px solid ${RULE};}
  .adm-table td{padding:12px 14px;border-bottom:1px solid ${RULE};color:${INK};vertical-align:middle;}
  .adm-table tr:last-child td{border-bottom:none;}
  .adm-table tr:hover td{background:#fafafa;}
  .adm-icon-btn{width:32px;height:32px;border:none;background:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background 0.15s;}
  .adm-icon-btn:hover{background:${RULE};}
  .adm-input{width:100%;padding:10px 14px;border:1px solid ${RULE};background:${WHT};font-family:Poppins,sans-serif;font-size:13px;color:${INK};outline:none;border-radius:0;box-sizing:border-box;transition:border-color 0.15s;}
  .adm-input:focus{border-color:${INK};}
  .adm-label{display:block;font-family:Poppins,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${MUTE};margin-bottom:6px;}
  .adm-page-title{font-family:"Playfair Display",Georgia,serif;font-size:24px;font-weight:700;color:${INK};margin:0;}
  .adm-sub{font-family:Poppins,sans-serif;font-size:12px;color:${MUTE};margin:4px 0 0;}
  .adm-back{font-family:Poppins,sans-serif;font-size:12px;color:${MUTE};background:none;border:none;cursor:pointer;text-decoration:underline;}
  .adm-back:hover{color:${INK};}
  .adm-card{background:${WHT};border:1px solid ${RULE};}
  .adm-badge{display:inline-block;padding:2px 8px;font-family:Poppins,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;}
`

function ProductSearch({ onSelect }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])
  const [busy,    setBusy]    = useState(false)
  const tmr = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    clearTimeout(tmr.current)
    tmr.current = setTimeout(async () => {
      setBusy(true)
      try {
        const r = await API.get(`/product?search=${encodeURIComponent(query)}&limit=8`)
        if (r.data.success) setResults(r.data.data)
      } catch {} finally { setBusy(false) }
    }, 300)
    return () => clearTimeout(tmr.current)
  }, [query])

  return (
    <div style={{ position:'relative' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, border:`1px solid ${RULE}`, padding:'9px 14px', background:WHT }}>
        <Search size={14} color={MUTE} strokeWidth={1.8} style={{ flexShrink:0 }} />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search products to add…"
          style={{ flex:1, fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
            background:'transparent', border:'none', outline:'none' }} />
        {busy && <div style={{ width:14, height:14, borderRadius:'50%', border:`2px solid ${MUTE}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />}
      </div>
      {results.length > 0 && (
        <div style={{ position:'absolute', top:'100%', left:0, right:0, background:WHT,
          border:`1px solid ${RULE}`, zIndex:50, maxHeight:240, overflowY:'auto',
          boxShadow:'0 4px 16px rgba(0,0,0,0.08)' }}>
          {results.map(p => (
            <button key={p._id} type="button" onClick={() => { onSelect(p); setQuery(''); setResults([]) }}
              style={{ display:'flex', alignItems:'center', gap:12, width:'100%',
                padding:'10px 14px', background:'none', border:'none', cursor:'pointer',
                textAlign:'left', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background='none'}>
              <div style={{ width:36, height:44, background:'#f5f5f5', overflow:'hidden', flexShrink:0 }}>
                {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
              </div>
              <div style={{ minWidth:0 }}>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500, color:INK, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>₹{p.price?.toLocaleString()}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminSalePage() {
  const [view,    setView]    = useState('list')
  const [sales,   setSales]   = useState([])
  const [loading, setLoading] = useState(true)
  const [editSale,setEditSale]= useState(null)
  const [saving,  setSaving]  = useState(false)
  const [form,    setForm]    = useState({ title:'', subtitle:'', startTime:'', endTime:'', isActive:false })
  const [selProd, setSelProd] = useState([])

  const fetchSales = useCallback(async () => {
    setLoading(true)
    try { const r = await API.get('/sale/all'); if (r.data.success) setSales(r.data.data) }
    catch { toast.error('Failed to load sales.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchSales() }, [fetchSales])

  const openCreate = () => { setEditSale(null); setForm({ title:'',subtitle:'',startTime:'',endTime:'',isActive:false }); setSelProd([]); setView('form') }
  const openEdit   = s  => {
    setEditSale(s)
    setForm({ title:s.title, subtitle:s.subtitle||'', startTime:toLocalInput(s.startTime), endTime:toLocalInput(s.endTime), isActive:s.isActive })
    setSelProd((s.products||[]).filter(i=>i.productId).map(i=>({ product:i.productId, salePrice:i.salePrice })))
    setView('form')
  }
  const handleDelete = async id => { if(!confirm('Delete this sale?')) return; try { await API.delete(`/sale/delete/${id}`); toast.success('Deleted.'); fetchSales() } catch { toast.error('Failed.') } }
  const handleToggle = async id => { try { await API.patch(`/sale/toggle/${id}`); toast.success('Status updated.'); fetchSales() } catch { toast.error('Failed.') } }
  const addProduct   = p  => { if(selProd.find(s=>s.product._id===p._id)) return; setSelProd(prev=>[...prev,{product:p,salePrice:''}]) }
  const updPrice     = (id,v)=> setSelProd(prev=>prev.map(s=>s.product._id===id?{...s,salePrice:v}:s))
  const remProduct   = id  => setSelProd(prev=>prev.filter(s=>s.product._id!==id))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.title||!form.startTime||!form.endTime) { toast.error('Title, start and end time required.'); return }
    if (new Date(form.endTime)<=new Date(form.startTime)) { toast.error('End must be after start.'); return }
    if (selProd.length===0) { toast.error('Add at least one product.'); return }
    for (const sp of selProd) {
      const n=Number(sp.salePrice)
      if (!n||n<=0) { toast.error(`Set valid price for "${sp.product.name}".`); return }
      if (n>=sp.product.price) { toast.error(`Sale price for "${sp.product.name}" must be < ₹${sp.product.price}.`); return }
    }
    const payload = { ...form, products:selProd.map(sp=>({ productId:sp.product._id, salePrice:Number(sp.salePrice) })) }
    setSaving(true)
    try {
      if (editSale) { await API.put(`/sale/update/${editSale._id}`,payload); toast.success('Sale updated.') }
      else          { await API.post('/sale/create',payload); toast.success('Sale created.') }
      setView('list'); fetchSales()
    } catch (err) { toast.error(err.response?.data?.msg||'Failed to save.') }
    finally { setSaving(false) }
  }

  const fmtDt = d => d ? new Date(d).toLocaleString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'

  if (view === 'list') return (
    <>
      <style>{ADM_CSS}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="adm-page-title">Festival Sale</h1>
          <p className="adm-sub">Manage limited-time sale events</p>
        </div>
        <button className="adm-btn-primary" onClick={openCreate}><Plus size={14} strokeWidth={2.5} /> Create Sale</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:`2.5px solid ${INK}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : sales.length === 0 ? (
        <div className="adm-card" style={{ padding:64, textAlign:'center' }}>
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:MUTE, marginBottom:20 }}>No sales yet</p>
          <button className="adm-btn-primary" onClick={openCreate}><Plus size={14} /> Create First Sale</button>
        </div>
      ) : (
        <div className="adm-card" style={{ overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>{['Title','Start','End','Products','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {sales.map(s => (
                  <tr key={s._id}>
                    <td>
                      <p style={{ fontWeight:600, margin:'0 0 2px' }}>{s.title}</p>
                      {s.subtitle && <p style={{ fontSize:11, color:MUTE, margin:0 }}>{s.subtitle}</p>}
                    </td>
                    <td style={{ color:MUTE, fontSize:12, whiteSpace:'nowrap' }}>{fmtDt(s.startTime)}</td>
                    <td style={{ color:MUTE, fontSize:12, whiteSpace:'nowrap' }}>{fmtDt(s.endTime)}</td>
                    <td style={{ fontWeight:600 }}>{s.products?.length||0}</td>
                    <td>
                      <span className="adm-badge" style={{ background:s.isActive?'#dcfce7':'#f0f0f0', color:s.isActive?'#166534':MUTE }}>
                        {s.isActive?'ACTIVE':'INACTIVE'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="adm-icon-btn" onClick={() => openEdit(s)} title="Edit"><Pencil size={14} color={MUTE} strokeWidth={1.8} /></button>
                        <button className="adm-icon-btn" onClick={() => handleToggle(s._id)} title="Toggle">
                          {s.isActive ? <ToggleRight size={18} color="#22c55e" /> : <ToggleLeft size={18} color={MUTE} />}
                        </button>
                        <button className="adm-icon-btn" onClick={() => handleDelete(s._id)} title="Delete"><Trash2 size={14} color="#ef4444" strokeWidth={1.8} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )

  return (
    <>
      <style>{ADM_CSS}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <h1 className="adm-page-title">{editSale ? 'Edit Sale' : 'Create Sale'}</h1>
        <button className="adm-back" onClick={() => setView('list')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="adm-card" style={{ padding:28, maxWidth:720, display:'flex', flexDirection:'column', gap:18 }}>
        <div>
          <label className="adm-label">Sale Title *</label>
          <input className="adm-input" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Diwali Mega Sale" required />
        </div>
        <div>
          <label className="adm-label">Subtitle</label>
          <input className="adm-input" value={form.subtitle} onChange={e=>setForm(p=>({...p,subtitle:e.target.value}))} placeholder="Up to 60% off on selected kurtis" />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label className="adm-label">Start Date & Time *</label>
            <input type="datetime-local" className="adm-input" value={form.startTime} onChange={e=>setForm(p=>({...p,startTime:e.target.value}))} required />
          </div>
          <div>
            <label className="adm-label">End Date & Time *</label>
            <input type="datetime-local" className="adm-input" value={form.endTime} onChange={e=>setForm(p=>({...p,endTime:e.target.value}))} required />
          </div>
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <input type="checkbox" checked={form.isActive} onChange={e=>setForm(p=>({...p,isActive:e.target.checked}))} style={{ width:15, height:15 }} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>Activate this sale immediately</span>
        </label>

        <div>
          <label className="adm-label">Add Products *</label>
          <ProductSearch onSelect={addProduct} />
        </div>

        {selProd.length > 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:MUTE, margin:0 }}>
              Selected ({selProd.length})
            </p>
            {selProd.map(({ product, salePrice }) => (
              <div key={product._id} style={{ display:'flex', alignItems:'center', gap:12,
                border:`1px solid ${RULE}`, padding:'10px 14px', background:'#fafafa' }}>
                <div style={{ width:40, height:48, background:'#f0f0f0', overflow:'hidden', flexShrink:0 }}>
                  {product.images?.[0] && <img src={product.images[0]} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:500, color:INK, margin:'0 0 2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{product.name}</p>
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, margin:0 }}>Original: ₹{product.price?.toLocaleString()}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>₹</span>
                  <input type="number" value={salePrice} onChange={e=>updPrice(product._id,e.target.value)}
                    placeholder="Sale price" min="1" max={product.price-1}
                    style={{ width:110, padding:'6px 10px', border:`1px solid ${RULE}`,
                      fontFamily:'Poppins,sans-serif', fontSize:13, color:INK,
                      background:WHT, outline:'none', borderRadius:0 }} />
                </div>
                <button type="button" onClick={() => remProduct(product._id)}
                  style={{ background:'none', border:'none', cursor:'pointer', color:'#ef4444', display:'flex', padding:2 }}>
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:10 }}>
          <button type="submit" className="adm-btn-primary" disabled={saving} style={{ flex:1 }}>
            {saving ? 'Saving…' : editSale ? 'Update Sale' : 'Create Sale'}
          </button>
          <button type="button" className="adm-btn-ghost" onClick={() => setView('list')} style={{ flex:1 }}>
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
