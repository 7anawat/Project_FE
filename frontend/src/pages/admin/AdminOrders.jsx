import { useState } from 'react';
import { useOrders } from '../../context/OrderContext';

function AdminOrders() {
  const {
    orders,
    approveOrder,
    rejectOrder,
    pendingCount,
    loading,
    error,
    refreshOrders,
  } = useOrders();

  const [filter, setFilter] = useState('pending');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('ยอดเงินในสลิปไม่ตรงกับยอดสั่งซื้อ');
  const [notification, setNotification] = useState(null);
  const [processingOrderId, setProcessingOrderId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const shown = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status === filter;
  });

    async function handleApprove(order) {
    if (processingOrderId !== null) return;

    setProcessingOrderId(order.id);
    setActionError(null);

    try {
      await approveOrder(order.id);

      setNotification(
        `✓ ยืนยันการชำระเงินของ ${order.memberName} สำเร็จ! E-Book ถูกส่งเข้าคลังของสมาชิกแล้ว`
      );

      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Approve order failed:', err);

      if (err.status === 409) {
        setActionError('คำสั่งซื้อนี้ได้รับการตรวจสอบจากแอดมินคนอื่นแล้ว');
      } else {
        setActionError(err.message || 'ไม่สามารถอนุมัติคำสั่งซื้อได้');
      }
    } finally {
      setProcessingOrderId(null);
    }
  }

  async function handleRejectSubmit(e) {
    e.preventDefault();

    if (!rejectingOrder || processingOrderId !== null) return;

    const order = rejectingOrder;

    setProcessingOrderId(order.id);
    setActionError(null);

    try {
      await rejectOrder(order.id, rejectReason);

      setRejectingOrder(null);
      setNotification(`✕ ปฏิเสธคำสั่งซื้อ ${order.id} เรียบร้อยแล้ว`);

      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error('Reject order failed:', err);

      if (err.status === 409) {
        setActionError('คำสั่งซื้อนี้ได้รับการตรวจสอบจากแอดมินคนอื่นแล้ว');
        setRejectingOrder(null);
      } else {
        setActionError(err.message || 'ไม่สามารถปฏิเสธคำสั่งซื้อได้');
      }
    } finally {
      setProcessingOrderId(null);
    }
  }
  

  const tabClass = (f) =>
    `rounded-full px-4 py-1.5 text-xs font-semibold transition ${
      filter === f
        ? 'bg-amber-500 text-white shadow-xs'
        : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
    }`;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">ตรวจสอบการชำระเงินและคำสั่งซื้อ</h2>
          <p className="text-xs text-slate-500">
            ตรวจสอบสลิปโอนเงินจากสมาชิก และกดยืนยันเพื่อส่งมอบ E-Book เข้าสู่ชั้นหนังสือของสมาชิก
          </p>
        </div>

        {/* ฟิลเตอร์สถานะ */}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setFilter('pending')} className={tabClass('pending')}>
            รอตรวจสอบ {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={() => setFilter('approved')} className={tabClass('approved')}>
            อนุมัติแล้ว ({orders.filter((o) => o.status === 'approved').length})
          </button>
          <button onClick={() => setFilter('rejected')} className={tabClass('rejected')}>
            ปฏิเสธ ({orders.filter((o) => o.status === 'rejected').length})
          </button>
          <button onClick={() => setFilter('all')} className={tabClass('all')}>
            ทั้งหมด ({orders.length})
          </button>
        </div>
      </div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => refreshOrders().catch(console.error)}
          disabled={loading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'กำลังโหลด...' : '↻ รีเฟรชรายการ'}
        </button>
      </div>

      {(error || actionError) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {actionError || error}
        </div>
      )}
      
      
      

      {notification && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-sm animate-fadeIn">
          {notification}
        </div>
      )}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-400">
          <p className="text-4xl">📄</p>
          <p className="mt-2 text-sm font-medium">ไม่มีคำสั่งซื้อในสถานะนี้</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((order) => (
            <div
              key={order.id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                order.status === 'pending'
                  ? 'border-amber-300 ring-2 ring-amber-100'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {order.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    👤 {order.memberName}
                  </span>
                  {order.memberEmail && (
                    <span className="text-xs text-slate-400">({order.memberEmail})</span>
                  )}
                  <span className="text-xs text-slate-400">
                    • {new Date(order.createdAt).toLocaleString('th-TH')}
                  </span>
                </div>

                <div>
                  {order.status === 'pending' && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 animate-pulse">
                      ⏳ รอการตรวจสอบสลิป
                    </span>
                  )}
                  {order.status === 'approved' && (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ✓ อนุมัติแล้ว (ส่ง E-Book สำเร็จ)
                    </span>
                  )}
                  {order.status === 'rejected' && (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      ✕ ปฏิเสธ: {order.rejectReason}
                    </span>
                  )}
                </div>
              </div>

              {/* ข้อมูลหนังสือและสลิป */}
              <div className="my-4 grid gap-4 md:grid-cols-3">
                {/* รายการหนังสือ */}
                <div className="md:col-span-2 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    รายการหนังสือที่สั่งซื้อ ({order.items.length} เล่ม)
                  </p>
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-2">
                        {item.coverUrl ? (
                          <img src={item.coverUrl} alt="" className="h-12 w-9 rounded object-cover" />
                        ) : (
                          <div className="grid h-12 w-9 place-items-center rounded bg-amber-100 text-xs">📖</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate text-xs">{item.title}</p>
                          <p className="text-[11px] text-slate-500">{item.author}</p>
                        </div>
                        <span className="font-bold text-slate-700 text-xs">
                          ฿{Number(item.priceTHB).toLocaleString('th-TH')}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">ช่องทางการชำระ: {order.transferBank}</span>
                    <div>
                      <span className="text-slate-500">ยอดที่ต้องชำระ: </span>
                      <span className="text-sm font-bold text-slate-900">
                        ฿{Number(order.totalAmount).toLocaleString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* สลิปหลักฐานการโอน */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 flex flex-col justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      หลักฐานการโอนเงิน (สลิป)
                    </p>
                    {order.slipUrl ? (
                      <div
                        onClick={() => setSelectedSlip(order.slipUrl)}
                        className="group relative cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <img
                          src={order.slipUrl}
                          alt="สลิป"
                          className="h-32 w-full object-cover transition group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                          <span className="rounded bg-white/90 px-2 py-1 text-xs font-bold text-slate-800 shadow">
                            🔍 คลิกดูภาพเต็ม
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid h-28 place-items-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-400">
                        ไม่ได้แนบสลิป
                      </div>
                    )}

                    {order.slipNote && (
                      <p className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border border-slate-200 italic">
                        💬 "{order.slipNote}"
                      </p>
                    )}
                  </div>

                  {/* ปุ่มดำเนินการ (เฉพาะ pending) */}
                  {order.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                           <button
                        onClick={() => handleApprove(order)}
                        disabled={processingOrderId !== null}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-center text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingOrderId === order.id
                          ? 'กำลังดำเนินการ...'
                          : '✓ ยืนยันการโอนเงิน'}
                      </button>
                           <button
                        onClick={() => setRejectingOrder(order)}
                        disabled={processingOrderId !== null}
                        className="rounded-lg border border-red-300 px-3 py-2 text-center text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ปฏิเสธ
                      </button>
                    </div>
                  )}

                  {order.status === 'approved' && (
                    <p className="mt-3 text-[11px] text-emerald-700 text-center font-medium">
                      อนุมัติแล้วโดย Admin ID: {order.reviewedBy ?? '-'}
                      {order.reviewedAt &&
                              ` เมื่อ ${new Date(order.reviewedAt).toLocaleString('th-TH')}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal ดูสลิปขนาดเต็ม */}
      {selectedSlip && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSlip(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-md overflow-hidden rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">ตรวจสลิปการโอนเงิน</h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="my-3 max-h-[70vh] overflow-y-auto">
              <img src={selectedSlip} alt="สลิปการโอนเงิน" className="w-full rounded-lg object-contain" />
            </div>
            <div className="text-center">
              <button
                onClick={() => setSelectedSlip(null)}
                className="rounded-lg bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ปฏิเสธคำสั่งซื้อ */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleRejectSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">ระบุเหตุผลในการปฏิเสธ #{rejectingOrder.id}</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">เหตุผล</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs"
              >
                <option value="ยอดเงินในสลิปไม่ตรงกับยอดสั่งซื้อ">ยอดเงินในสลิปไม่ตรงกับยอดสั่งซื้อ</option>
                <option value="สลิปไม่ชัดเจนหรือไม่สามารถตรวจสอบได้">สลิปไม่ชัดเจนหรือไม่สามารถตรวจสอบได้</option>
                <option value="ไม่พบยอดเงินเข้าบัญชี">ไม่พบยอดเงินเข้าบัญชี</option>
                <option value="สลิปซ้ำหรือเคยใช้งานแล้ว">สลิปซ้ำหรือเคยใช้งานแล้ว</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="rounded-lg border px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;

