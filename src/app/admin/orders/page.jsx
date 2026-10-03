'use client'
import OrderTable from '../../../components/admin/OrderTable'

export default function AdminOrdersPage() {
  return (
    <>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'"Playfair Display",Georgia,serif', fontSize:24,
          fontWeight:700, color:'#141414', margin:0 }}>
          Orders
        </h1>
        <p style={{ fontFamily:'Poppins,sans-serif', fontSize:12, color:'#888', marginTop:4 }}>
          View and update all customer orders
        </p>
      </div>
      <OrderTable />
    </>
  )
}
