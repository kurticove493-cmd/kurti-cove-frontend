'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import API from '../../../utils/Helper'
import toast from 'react-hot-toast'
import { Star, Pencil, Trash2, Plus, Upload, X } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const emptyForm = { productId:'', customerName:'', location:'', rating:5, title:'', comment:'', verifiedBuyer:false }

const ADM_CSS = `
  .adm-btn-primary { display:inline-flex;align-items:center;gap:7px;padding:9px 20px;background:${INK};color:${WHT};border:none;cursor:pointer;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;transition:background 0.15s; }
  .adm-btn-primary:hover { background:#333; }
  .adm-btn-ghost { display:inline-flex;align-items:center;gap:7px;padding:9px 20px;background:none;color:${INK};border:1px solid ${RULE};cursor:pointer;font-family:Poppins,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;transition:border-color 0.15s; }
  .adm-btn-ghost:hover { border-color:${INK}; }
  .adm-table { width:100%;border-collapse:collapse;font-family:Poppins,sans-serif;font-size:13px; }
  .adm-table th { text-align:left;padding:11px 14px;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:${MUTE};background:#fafafa;border-bottom:1px solid ${RULE}; }
  .adm-table td { padding:11px 14px;border-bottom:1px solid ${RULE};color:${INK};vertical-align:middle; }
  .adm-table tr:last-child td { border-bottom:none; }
  .adm-table tr:hover td { background:#fafafa; }
  .adm-icon-btn { width:32px;height:32px;border:none;background:none;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background 0.15s; }
  .adm-icon-btn:hover { background:${RULE}; }
  .adm-input { width:100%;padding:10px 14px;border:1px solid ${RULE};background:${WHT};font-family:Poppins,sans-serif;font-size:13px;color:${INK};outline:none;border-radius:0;box-sizing:border-box;transition:border-color 0.15s; }
  .adm-input:focus { border-color:${INK}; }
  .adm-select { width:100%;padding:10px 14px;border:1px solid ${RULE};background:${WHT};font-family:Poppins,sans-serif;font-size:13px;color:${INK};outline:none;border-radius:0;box-sizing:border-box;cursor:pointer; }
  .adm-label { display:block;font-family:Poppins,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${MUTE};margin-bottom:6px; }
  .adm-page-title { font-family:"Playfair Display",Georgia,serif;font-size:24px;font-weight:700;color:${INK};margin:0; }
  .adm-sub { font-family:Poppins,sans-serif;font-size:12px;color:${MUTE};margin:4px 0 0; }
  .adm-back { font-family:Poppins,sans-serif;font-size:12px;color:${MUTE};background:none;border:none;cursor:pointer;text-decoration:underline; }
  .adm-back:hover { color:${INK}; }
  .adm-card { background:${WHT};border:1px solid ${RULE}; }
`

function StarPicker({ value, onChange }) {
  return (
    <div style={{ display:'flex', gap:4 }}>
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)}
          style={{ background:'none', border:'none', cursor:'pointer', padding:2 }}>
          <Star size={22} strokeWidth={1.5}
            fill={n <= value ? '#fbbf24' : 'none'}
            color={n <= value ? '#fbbf24' : '#ccc'} />
        </button>
      ))}
    </div>
  )
}

export default function AdminReviewsPage() {
  const [view,        setView]        = useState('list')
  const [reviews,     setReviews]     = useState([])
  const [products,    setProducts]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [editReview,  setEditReview]  = useState(null)
  const [form,        setForm]        = useState(emptyForm)
  const [imageFile,   setImageFile]   = useState(null)
  const [imagePreview,setImagePreview]= useState(null)
  const fileRef = useRef()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [rv, pr] = await Promise.all([API.get('/review/all'), API.get('/product?limit=200')])
      if (rv.data.success) setReviews(rv.data.data)
      if (pr.data.success) setProducts(pr.data.data)
    } catch { toast.error('Failed to load data.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditReview(null); setForm(emptyForm); setImageFile(null); setImagePreview(null); setView('form') }
  const openEdit   = r  => {
    setEditReview(r)
    setForm({ productId:r.productId?._id||r.productId||'', customerName:r.customerName,
      location:r.location||'', rating:r.rating, title:r.title||'',
      comment:r.comment, verifiedBuyer:r.verifiedBuyer })
    setImageFile(null); setImagePreview(r.imageUrl||null); setView('form')
  }

  const handleDelete = async id => {
    if (!confirm('Delete this review?')) return
    try { await API.delete(`/review/${id}`); toast.success('Deleted.'); fetchData() }
    catch { toast.error('Failed to delete.') }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.productId || !form.customerName || !form.comment) { toast.error('Product, name and comment required.'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => fd.append(k,v))
      if (imageFile) fd.append('image', imageFile)
      const opts = { headers:{ 'Content-Type':'multipart/form-data' } }
      if (editReview) { await API.patch(`/review/${editReview._id}`, fd, opts); toast.success('Updated.') }
      else            { await API.post('/review', fd, opts); toast.success('Created.') }
      setView('list'); fetchData()
    } catch (err) { toast.error(err.response?.data?.msg || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })

  if (view === 'list') return (
    <>
      <style>{ADM_CSS}</style>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="adm-page-title">Reviews</h1>
          <p className="adm-sub">{reviews.length} total</p>
        </div>
        <button className="adm-btn-primary" onClick={openCreate}>
          <Plus size={14} strokeWidth={2.5} /> Add Review
        </button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
          <div style={{ width:28, height:28, borderRadius:'50%', border:`2.5px solid ${INK}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : reviews.length === 0 ? (
        <div className="adm-card" style={{ padding:64, textAlign:'center' }}>
          <Star size={44} color={RULE} style={{ margin:'0 auto 16px' }} />
          <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:INK, marginBottom:20 }}>No reviews yet</p>
          <button className="adm-btn-primary" onClick={openCreate}><Plus size={14} /> Add Review</button>
        </div>
      ) : (
        <div className="adm-card" style={{ overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {['Product','Customer','Rating','Title','Verified','Date','Actions'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {reviews.map(r => (
                  <tr key={r._id}>
                    <td style={{ maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {r.productId?.name || '—'}
                    </td>
                    <td>
                      <p style={{ fontWeight:500, margin:'0 0 2px' }}>{r.customerName}</p>
                      {r.location && <p style={{ fontSize:11, color:MUTE, margin:0 }}>{r.location}</p>}
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:2 }}>
                        {[1,2,3,4,5].map(n => (
                          <Star key={n} size={12} fill={n<=r.rating?'#fbbf24':'none'} color={n<=r.rating?'#fbbf24':'#ccc'} strokeWidth={1.5} />
                        ))}
                      </div>
                    </td>
                    <td style={{ maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color:MUTE }}>
                      {r.title || '—'}
                    </td>
                    <td>
                      <span style={{ display:'inline-block', padding:'2px 8px',
                        fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:600,
                        letterSpacing:'0.08em', textTransform:'uppercase',
                        background: r.verifiedBuyer ? '#dcfce7' : '#f0f0f0',
                        color:      r.verifiedBuyer ? '#166534' : MUTE }}>
                        {r.verifiedBuyer ? 'YES' : 'NO'}
                      </span>
                    </td>
                    <td style={{ color:MUTE, whiteSpace:'nowrap' }}>{fmtDate(r.createdAt)}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="adm-icon-btn" onClick={() => openEdit(r)} title="Edit">
                          <Pencil size={14} color={MUTE} strokeWidth={1.8} />
                        </button>
                        <button className="adm-icon-btn" onClick={() => handleDelete(r._id)} title="Delete">
                          <Trash2 size={14} color="#ef4444" strokeWidth={1.8} />
                        </button>
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
        <h1 className="adm-page-title">{editReview ? 'Edit Review' : 'Add Review'}</h1>
        <button className="adm-back" onClick={() => setView('list')}>← Back</button>
      </div>

      <form onSubmit={handleSubmit} className="adm-card" style={{ padding:28, maxWidth:640, display:'flex', flexDirection:'column', gap:18 }}>
        <div>
          <label className="adm-label">Product *</label>
          <select className="adm-select" value={form.productId} onChange={e => setForm(p=>({...p,productId:e.target.value}))} required>
            <option value="">— Select a product —</option>
            {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label className="adm-label">Customer Name *</label>
            <input className="adm-input" value={form.customerName} onChange={e => setForm(p=>({...p,customerName:e.target.value}))} placeholder="Priya Sharma" required />
          </div>
          <div>
            <label className="adm-label">City / Location</label>
            <input className="adm-input" value={form.location} onChange={e => setForm(p=>({...p,location:e.target.value}))} placeholder="Mumbai" />
          </div>
        </div>
        <div>
          <label className="adm-label">Rating *</label>
          <StarPicker value={form.rating} onChange={v => setForm(p=>({...p,rating:v}))} />
        </div>
        <div>
          <label className="adm-label">Review Title</label>
          <input className="adm-input" value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} placeholder="Absolutely loved this kurti!" />
        </div>
        <div>
          <label className="adm-label">Comment *</label>
          <textarea className="adm-input" rows={4} style={{ resize:'vertical' }}
            value={form.comment} onChange={e => setForm(p=>({...p,comment:e.target.value}))}
            placeholder="The fabric quality is amazing…" required />
        </div>
        <label style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }}>
          <input type="checkbox" checked={form.verifiedBuyer} onChange={e => setForm(p=>({...p,verifiedBuyer:e.target.checked}))}
            style={{ width:15, height:15 }} />
          <span style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:INK }}>Verified Buyer</span>
        </label>
        <div>
          <label className="adm-label">Review Photo (optional)</label>
          <div onClick={() => fileRef.current?.click()} style={{
            border:`1px dashed ${RULE}`, padding:'20px 16px', textAlign:'center',
            cursor:'pointer', transition:'border-color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = INK}
            onMouseLeave={e => e.currentTarget.style.borderColor = RULE}>
            <Upload size={20} color={MUTE} style={{ margin:'0 auto 6px' }} />
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE }}>Click to upload</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f=e.target.files[0]; if(f){setImageFile(f);setImagePreview(URL.createObjectURL(f))} }} style={{ display:'none' }} />
          {imagePreview && (
            <div style={{ position:'relative', display:'inline-block', marginTop:10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imagePreview} alt="preview" style={{ width:80, height:80, objectFit:'cover', display:'block' }} />
              <button type="button" onClick={() => { setImageFile(null); setImagePreview(null) }}
                style={{ position:'absolute', top:-6, right:-6, width:20, height:20, borderRadius:'50%',
                  background:WHT, border:`1px solid ${RULE}`, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={10} color="#ef4444" />
              </button>
            </div>
          )}
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button type="submit" className="adm-btn-primary" disabled={saving} style={{ flex:1 }}>
            {saving ? 'Saving…' : editReview ? 'Update Review' : 'Save Review'}
          </button>
          <button type="button" className="adm-btn-ghost" onClick={() => setView('list')} style={{ flex:1 }}>
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
