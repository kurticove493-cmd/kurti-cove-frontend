'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import API from '../../utils/Helper'
import toast from 'react-hot-toast'
import { User, MapPin, Lock, Trash2, Plus, Package, ChevronRight } from 'lucide-react'

const INK  = '#141414'
const MUTE = '#888'
const RULE = '#e8e8e8'
const ROSE = '#E05C88'
const WHT  = '#ffffff'
const PLUM = '#7B1153'

const emptyAddr = { fullName:'', mobile:'', pincode:'', addressLine:'', city:'', state:'' }

const PAGE_CSS = `
  .prf { background:#fafafa; min-height:100vh; }
  .prf *, .prf *::before, .prf *::after { box-sizing:border-box; }
  .prf-card { background:#fff; border:1px solid ${RULE}; }
  .prf-tab-btn {
    display:flex; align-items:center; gap:8px;
    padding:10px 0; width:100%;
    background:none; border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:13px; font-weight:400;
    color:${MUTE}; text-align:left; transition:color 0.15s;
    border-bottom:1px solid ${RULE};
  }
  .prf-tab-btn:last-child { border-bottom:none; }
  .prf-tab-btn.active { color:${INK}; font-weight:600; }
  .prf-tab-btn:hover  { color:${INK}; }
  .prf-input {
    width:100%; padding:10px 14px;
    font-family:Poppins,sans-serif; font-size:13px; color:${INK};
    border:1px solid ${RULE}; background:${WHT};
    outline:none; border-radius:0;
  }
  .prf-input:focus { border-color:${INK}; }
  .prf-input:disabled { background:#f5f5f5; color:${MUTE}; cursor:not-allowed; }
  .prf-label {
    display:block; font-family:Poppins,sans-serif;
    font-size:10px; font-weight:600; letter-spacing:0.12em;
    text-transform:uppercase; color:${MUTE}; margin-bottom:5px;
  }
  .prf-btn-primary {
    padding:11px 28px; background:${INK}; color:${WHT};
    border:none; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    transition:background 0.18s;
  }
  .prf-btn-primary:disabled { background:#aaa; cursor:not-allowed; }
  .prf-btn-ghost {
    padding:11px 28px; background:none; color:${INK};
    border:1px solid ${RULE}; cursor:pointer;
    font-family:Poppins,sans-serif; font-size:11px; font-weight:600;
    letter-spacing:0.14em; text-transform:uppercase;
    transition:border-color 0.18s;
  }
  .prf-btn-ghost:hover { border-color:${INK}; }
  @media(min-width:768px){
    .prf-layout { display:flex; gap:32px; align-items:flex-start; }
    .prf-sidebar { width:200px; flex-shrink:0; position:sticky; top:90px; }
    .prf-main { flex:1; min-width:0; }
    .prf-tab-btn { font-size:13px; }
  }
`

function InputRow({ label, name, value, onChange, disabled, type = 'text', placeholder }) {
  return (
    <div>
      <label className="prf-label">{label}</label>
      <input className="prf-input" type={type} name={name} value={value}
        onChange={onChange} disabled={disabled} placeholder={placeholder}
        onFocus={e => { if (!disabled) e.target.style.borderColor = INK }}
        onBlur={e  => e.target.style.borderColor = RULE}
      />
    </div>
  )
}

function PwdRow({ label, name, value, onChange, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="prf-label">{label}</label>
      <div style={{ position:'relative' }}>
        <input className="prf-input" type={show ? 'text' : 'password'} name={name}
          value={value} onChange={onChange} placeholder={placeholder}
          style={{ paddingRight:42 }}
          onFocus={e => e.target.style.borderColor = INK}
          onBlur={e  => e.target.style.borderColor = RULE}
        />
        <button type="button" onClick={() => setShow(v=>!v)}
          style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
            background:'none', border:'none', cursor:'pointer', color:MUTE, display:'flex', padding:0, fontSize:13 }}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const [user,          setUser]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [tab,           setTab]           = useState('profile')
  const [profileForm,   setProfileForm]   = useState({ name:'', mobile:'' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [pwdForm,       setPwdForm]       = useState({ currentPassword:'', newPassword:'', confirmPassword:'' })
  const [savingPwd,     setSavingPwd]     = useState(false)
  const [showAddrForm,  setShowAddrForm]  = useState(false)
  const [newAddr,       setNewAddr]       = useState(emptyAddr)
  const [savingAddr,    setSavingAddr]    = useState(false)

  useEffect(() => {
    API.get('/user/get').then(res => {
      if (res.data.success) {
        setUser(res.data.data)
        setProfileForm({ name: res.data.data.name, mobile: res.data.data.mobile || '' })
      }
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name) { toast.error('Name is required.'); return }
    setSavingProfile(true)
    try {
      const res = await API.put('/user/update-profile', profileForm)
      if (res.data.success) {
        setUser(res.data.data)
        localStorage.setItem('kc_user', JSON.stringify(res.data.data))
        toast.success('Profile updated.')
      }
    } catch {/* silent */} finally { setSavingProfile(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match.'); return }
    if (pwdForm.newPassword.length < 6) { toast.error('Min 6 characters.'); return }
    setSavingPwd(true)
    try {
      await API.patch('/user/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword })
      toast.success('Password changed.')
      setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' })
    } catch {/* silent */} finally { setSavingPwd(false) }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    const { fullName, mobile, pincode, addressLine, city, state } = newAddr
    if (!fullName||!mobile||!pincode||!addressLine||!city||!state) { toast.error('All fields required.'); return }
    setSavingAddr(true)
    try {
      const res = await API.post('/user/addaddresses', newAddr)
      if (res.data.success) {
        setUser(p => ({ ...p, addresses: res.data.data }))
        setNewAddr(emptyAddr); setShowAddrForm(false); toast.success('Address added.')
      }
    } catch {/* silent */} finally { setSavingAddr(false) }
  }

  const handleDeleteAddress = async (index) => {
    if (!confirm('Delete this address?')) return
    try {
      const res = await API.put('/user/deleteaddress', { index })
      if (res.data.success) setUser(p => ({ ...p, addresses: res.data.data }))
    } catch {/* silent */}
  }

  const TABS = [
    { key:'profile',   label:'My Profile', Icon:User   },
    { key:'addresses', label:'Addresses',  Icon:MapPin  },
    { key:'password',  label:'Password',   Icon:Lock    },
    { key:'orders',    label:'My Orders',  Icon:Package, link:'/orders' },
  ]

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#fafafa' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:`2.5px solid ${INK}`, borderTopColor:'transparent', animation:'spin .7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{PAGE_CSS}</style>
      <main className="prf">
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 16px 64px' }}>

          {/* Page title */}
          <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:28,
            fontWeight:700, color:INK, marginBottom:28 }}>
            My Account
          </h1>

          <div className="prf-layout">

            {/* ── SIDEBAR ── */}
            <aside className="prf-sidebar">
              {/* Avatar */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20,
                paddingBottom:20, borderBottom:`1px solid ${RULE}` }}>
                <div style={{
                  width:44, height:44, borderRadius:'50%',
                  background:INK, display:'flex', alignItems:'center',
                  justifyContent:'center', flexShrink:0,
                }}>
                  <span style={{ fontFamily:'"Playfair Display",serif', fontSize:18,
                    fontWeight:700, color:WHT }}>
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, fontWeight:600,
                    color:INK, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.name}
                  </p>
                  <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE,
                    margin:'2px 0 0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Nav */}
              <nav>
                {TABS.map(({ key, label, Icon, link }) =>
                  link ? (
                    <Link key={key} href={link}
                      style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 0',
                        fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE,
                        textDecoration:'none', borderBottom:`1px solid ${RULE}`,
                        transition:'color 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = INK}
                      onMouseLeave={e => e.currentTarget.style.color = MUTE}>
                      <Icon size={14} strokeWidth={1.8} />
                      {label}
                      <ChevronRight size={12} style={{ marginLeft:'auto', opacity:0.4 }} />
                    </Link>
                  ) : (
                    <button key={key} onClick={() => setTab(key)}
                      className={`prf-tab-btn${tab===key?' active':''}`}>
                      <Icon size={14} strokeWidth={tab===key ? 2.2 : 1.8} />
                      {label}
                      {tab===key && <span style={{ marginLeft:'auto', width:4, height:4, borderRadius:'50%', background:INK, flexShrink:0 }} />}
                    </button>
                  )
                )}
              </nav>
            </aside>

            {/* ── MAIN CONTENT ── */}
            <div className="prf-main">
              <div className="prf-card" style={{ padding:28 }}>

                {/* PROFILE TAB */}
                {tab === 'profile' && (
                  <form onSubmit={handleProfileSave} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                    <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600,
                      letterSpacing:'0.10em', textTransform:'uppercase', color:INK, margin:'0 0 4px' }}>
                      Profile Details
                    </h2>
                    <InputRow label="Full Name" name="name" value={profileForm.name}
                      onChange={e => setProfileForm(p=>({...p, name:e.target.value}))} />
                    <InputRow label="Mobile" name="mobile" value={profileForm.mobile}
                      placeholder="9876543210"
                      onChange={e => setProfileForm(p=>({...p, mobile:e.target.value}))} />
                    <InputRow label="Email" value={user?.email||''} disabled onChange={()=>{}} />
                    <p style={{ fontFamily:'Poppins,sans-serif', fontSize:11, color:MUTE, marginTop:-8 }}>
                      Email cannot be changed
                    </p>
                    <div>
                      <button type="submit" className="prf-btn-primary" disabled={savingProfile}>
                        {savingProfile ? 'Saving…' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ADDRESSES TAB */}
                {tab === 'addresses' && (
                  <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600,
                      letterSpacing:'0.10em', textTransform:'uppercase', color:INK, margin:0 }}>
                      Saved Addresses
                    </h2>

                    {(!user?.addresses?.length && !showAddrForm) && (
                      <p style={{ fontFamily:'Poppins,sans-serif', fontSize:13, color:MUTE, padding:'24px 0' }}>
                        No saved addresses yet.
                      </p>
                    )}

                    {user?.addresses?.map((addr, i) => (
                      <div key={i} style={{ border:`1px solid ${RULE}`, padding:'14px 16px',
                        display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                        <div style={{ fontFamily:'Poppins,sans-serif', fontSize:13, lineHeight:1.6 }}>
                          <p style={{ fontWeight:600, color:INK, margin:'0 0 2px' }}>{addr.fullName}</p>
                          <p style={{ color:MUTE, margin:0, fontSize:12 }}>{addr.mobile}</p>
                          <p style={{ color:MUTE, margin:0, fontSize:12 }}>
                            {addr.addressLine}, {addr.city}, {addr.state} — {addr.pincode}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteAddress(i)}
                          style={{ background:'none', border:'none', cursor:'pointer',
                            color:'#ccc', padding:4, flexShrink:0, transition:'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color='#ccc'}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}

                    {showAddrForm && (
                      <form onSubmit={handleAddAddress}
                        style={{ border:`1px solid ${RULE}`, padding:20,
                          display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                        {Object.keys(emptyAddr).map(key => (
                          <div key={key} style={{ gridColumn: key==='addressLine' ? 'span 2' : undefined }}>
                            <label className="prf-label">
                              {key.replace(/([A-Z])/g,' $1').trim()}
                            </label>
                            <input className="prf-input" value={newAddr[key]} required
                              onChange={e => setNewAddr(p=>({...p,[key]:e.target.value}))}
                              onFocus={e => e.target.style.borderColor=INK}
                              onBlur={e  => e.target.style.borderColor=RULE}
                            />
                          </div>
                        ))}
                        <div style={{ gridColumn:'span 2', display:'flex', gap:10 }}>
                          <button type="submit" className="prf-btn-primary" disabled={savingAddr}>
                            {savingAddr ? 'Saving…' : 'Add Address'}
                          </button>
                          <button type="button" className="prf-btn-ghost"
                            onClick={() => setShowAddrForm(false)}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {!showAddrForm && (
                      <button onClick={() => setShowAddrForm(true)}
                        style={{ display:'inline-flex', alignItems:'center', gap:6,
                          fontFamily:'Poppins,sans-serif', fontSize:12, fontWeight:500,
                          color:INK, background:'none', border:'none', cursor:'pointer',
                          textDecoration:'underline', padding:0 }}>
                        <Plus size={13} /> Add New Address
                      </button>
                    )}
                  </div>
                )}

                {/* PASSWORD TAB */}
                {tab === 'password' && (
                  <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:18 }}>
                    <h2 style={{ fontFamily:'Poppins,sans-serif', fontSize:14, fontWeight:600,
                      letterSpacing:'0.10em', textTransform:'uppercase', color:INK, margin:'0 0 4px' }}>
                      Change Password
                    </h2>
                    {[
                      { key:'currentPassword', label:'Current Password', ph:'Enter current password' },
                      { key:'newPassword',     label:'New Password',     ph:'Min 6 characters'       },
                      { key:'confirmPassword', label:'Confirm Password', ph:'Re-enter new password'  },
                    ].map(f => (
                      <PwdRow key={f.key} label={f.label} name={f.key}
                        value={pwdForm[f.key]} placeholder={f.ph}
                        onChange={e => setPwdForm(p=>({...p,[f.key]:e.target.value}))} />
                    ))}
                    <div>
                      <button type="submit" className="prf-btn-primary" disabled={savingPwd}>
                        {savingPwd ? 'Changing…' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                )}

              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
