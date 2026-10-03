'use client'
import { useState, useEffect, useCallback } from 'react'
import API from '../../../utils/Helper'
import ProductForm from '../../../components/admin/ProductForm'
import toast from 'react-hot-toast'
import { Package, Pencil, Trash2, Plus } from 'lucide-react'

/* ── Admin theme ── */
const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const WHT  = '#ffffff'

const ADM_CSS = `
  .adm-btn-primary {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 20px; background:${INK}; color:${WHT};
    border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.12em; text-transform:uppercase; transition:background 0.15s;
  }
  .adm-btn-primary:hover { background:#333; }
  .adm-btn-ghost {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 20px; background:none; color:${INK};
    border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:12px; font-weight:600;
    letter-spacing:0.12em; text-transform:uppercase; transition:border-color 0.15s;
  }
  .adm-btn-ghost:hover { border-color:${INK}; }
  .adm-table { width:100%; border-collapse:collapse; font-family:Poppins,sans-serif; font-size:13px; }
  .adm-table th {
    text-align:left; padding:11px 14px;
    font-size:10px; font-weight:600; letter-spacing:0.14em; text-transform:uppercase;
    color:${MUTE}; background:#fafafa; border-bottom:1px solid ${RULE};
  }
  .adm-table td { padding:12px 14px; border-bottom:1px solid ${RULE}; color:${INK}; vertical-align:middle; }
  .adm-table tr:last-child td { border-bottom:none; }
  .adm-table tr:hover td { background:#fafafa; }
  .adm-icon-btn {
    width:32px; height:32px; border:none; background:none;
    cursor:pointer; display:inline-flex; align-items:center; justify-content:center;
    transition:background 0.15s; border-radius:0;
  }
  .adm-icon-btn:hover { background:${RULE}; }
  .adm-page-title {
    font-family:"Playfair Display",Georgia,serif;
    font-size:24px; font-weight:700; color:${INK}; margin:0;
  }
  .adm-sub { font-family:Poppins,sans-serif; font-size:12px; color:${MUTE}; margin:4px 0 0; }
  .adm-card { background:${WHT}; border:1px solid ${RULE}; }
  .adm-back {
    font-family:Poppins,sans-serif; font-size:12px; color:${MUTE};
    background:none; border:none; cursor:pointer; text-decoration:underline;
    letter-spacing:0.04em;
  }
  .adm-back:hover { color:${INK}; }
  .adm-badge {
    display:inline-block; padding:2px 8px;
    font-family:Poppins,sans-serif; font-size:10px; font-weight:600;
    letter-spacing:0.08em; text-transform:uppercase;
  }
  .adm-pgbtn {
    padding:7px 18px; background:none; color:${INK};
    border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:11px; font-weight:500;
    letter-spacing:0.08em; text-transform:uppercase; transition:border-color 0.15s;
  }
  .adm-pgbtn:hover:not(:disabled) { border-color:${INK}; }
  .adm-pgbtn:disabled { opacity:0.35; cursor:not-allowed; }
`

export default function AdminProductsPage() {
  const [products,   setProducts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [view,       setView]       = useState('table')
  const [editProduct,setEditProduct]= useState(null)
  const [page,       setPage]       = useState(1)
  const [pagination, setPagination] = useState({ total:0, pages:1 })
  const LIMIT = 15

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get(`/product?page=${page}&limit=${LIMIT}`)
      if (res.data.success) { setProducts(res.data.data); setPagination(res.data.pagination) }
    } catch { toast.error('Failed to load products.') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await API.delete(`/product/${id}`)
      toast.success('Product deleted.')
      setProducts(prev => prev.filter(p => p._id !== id))
      fetchProducts()
    } catch { toast.error('Failed to delete product.') }
  }

  const openAdd  = () => { setEditProduct(null); setView('form') }
  const openEdit = p  => { setEditProduct(p);    setView('form') }
  const onSuccess = () => { setView('table'); setEditProduct(null); fetchProducts() }
  const onCancel  = () => { setView('table'); setEditProduct(null) }

  return (
    <>
      <style>{ADM_CSS}</style>

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
        <div>
          <h1 className="adm-page-title">
            {view === 'form' ? (editProduct ? 'Edit Product' : 'Add Product') : 'Products'}
          </h1>
          {view === 'table' && (
            <p className="adm-sub">{pagination.total} products</p>
          )}
        </div>
        {view === 'table' && (
          <button className="adm-btn-primary" onClick={openAdd}>
            <Plus size={14} strokeWidth={2.5} /> Add Product
          </button>
        )}
        {view === 'form' && (
          <button className="adm-back" onClick={onCancel}>← Back to Products</button>
        )}
      </div>

      {/* Form */}
      {view === 'form' && (
        <div className="adm-card" style={{ padding:28, maxWidth:720 }}>
          <ProductForm product={editProduct} onSuccess={onSuccess} onCancel={onCancel} />
        </div>
      )}

      {/* Table */}
      {view === 'table' && (
        loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}>
            <div style={{ width:28, height:28, borderRadius:'50%',
              border:`2.5px solid ${INK}`, borderTopColor:'transparent',
              animation:'spin .7s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : products.length === 0 ? (
          <div className="adm-card" style={{ padding:64, textAlign:'center' }}>
            <Package size={44} color={RULE} style={{ margin:'0 auto 16px' }} />
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:14, color:INK, marginBottom:20 }}>
              No products yet
            </p>
            <button className="adm-btn-primary" onClick={openAdd}>
              <Plus size={14} /> Add First Product
            </button>
          </div>
        ) : (
          <>
            <div className="adm-card" style={{ overflow:'hidden' }}>
              <div style={{ overflowX:'auto' }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      {['Image','Name','Category','Price','Discount','Stock','Flags','Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id}>
                        <td>
                          <div style={{ width:44, height:52, background:'#f5f5f5', overflow:'hidden', flexShrink:0 }}>
                            {p.images?.[0]
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={p.images[0]} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                              : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>👗</div>}
                          </div>
                        </td>
                        <td>
                          <p style={{ fontWeight:500, margin:'0 0 3px', maxWidth:180,
                            overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                            {p.name}
                          </p>
                          <p style={{ fontSize:11, color:MUTE, margin:0 }}>
                            {p.sizes?.slice(0,3).join(' · ')}{p.sizes?.length > 3 ? ` +${p.sizes.length-3}` : ''}
                          </p>
                        </td>
                        <td>
                          {p.category
                            ? <span className="adm-badge" style={{ background:'#f0f0f0', color:INK }}>{p.category}</span>
                            : <span style={{ color:RULE }}>—</span>}
                        </td>
                        <td style={{ fontWeight:600 }}>₹{p.price?.toLocaleString()}</td>
                        <td style={{ color:MUTE }}>
                          {p.discountPrice ? `₹${p.discountPrice.toLocaleString()}` : '—'}
                        </td>
                        <td>
                          <span className="adm-badge" style={{
                            background: p.stock > 0 ? '#dcfce7' : '#fee2e2',
                            color:      p.stock > 0 ? '#166534' : '#991b1b',
                          }}>
                            {p.stock}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                            {p.isFeatured   && <span className="adm-badge" style={{ background:'#f0f0f0', color:INK }}>F</span>}
                            {p.isNewArrival && <span className="adm-badge" style={{ background:'#f0f0f0', color:INK }}>N</span>}
                            {p.isBestSeller && <span className="adm-badge" style={{ background:'#fef9c3', color:'#854d0e' }}>B</span>}
                            {p.onSale       && <span className="adm-badge" style={{ background:'#fce7f3', color:'#9d174d' }}>S</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display:'flex', gap:4 }}>
                            <button className="adm-icon-btn" onClick={() => openEdit(p)} title="Edit">
                              <Pencil size={14} color={MUTE} strokeWidth={1.8} />
                            </button>
                            <button className="adm-icon-btn" onClick={() => handleDelete(p._id, p.name)} title="Delete">
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

            {pagination.pages > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:24 }}>
                <button className="adm-pgbtn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}>
                  ← Prev
                </button>
                <span style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:MUTE, padding:'0 8px' }}>
                  {page} / {pagination.pages}
                </span>
                <button className="adm-pgbtn" onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages}>
                  Next →
                </button>
              </div>
            )}
          </>
        )
      )}
    </>
  )
}
