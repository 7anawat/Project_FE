
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../auth/AuthContext';

function MyOrders() {
  const { myOrders, loading, error, refreshOrders } = useOrders();
  const { member } = useAuth();
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshOrders();
    } catch (err) {
      console.error('Refresh orders failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            ✓ อนุมัติแล้ว (ได้รับ E-Book แล้ว)
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
            ✕ ไม่อนุมัติ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            ⏳ รอแอดมินตรวจสอบการโอนเงิน
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
            📋 ประวัติคำสั่งซื้อของฉัน
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            ติดตามสถานะการตรวจสอบสลิปโอนเงินและการรับสิทธิ์อ่าน E-Book ของคุณ {member?.displayName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            {refreshing ? 'กำลังโหลด...' : '↻ รีเฟรช'}
          </button>

          <Link
            to="/me/library"
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs w-fit"
          >
            <span>📚</span>
            <span>ไปที่ชั้นหนังสือของฉัน</span>
          </Link>
        </div>
      </div>

      {loading && myOrders.length === 0 ? (
        <div className="rounded-2xl border border-amber-100 bg-white py-16 text-center">
          <p className="text-4xl">⏳</p>
          <p className="mt-4 text-sm text-slate-500">กำลังโหลดประวัติคำสั่งซื้อ...</p>
        </div>
      ) : error && myOrders.length === 0 ? (
        <div className="rounded-2xl border border-red-200 bg-white py-12 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            ไม่สามารถโหลดประวัติคำสั่งซื้อได้
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-5 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
          >
            ลองอีกครั้ง
          </button>
        </div>
      ) : myOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white py-16 text-center">
          <p className="text-5xl">🧾</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            ยังไม่มีประวัติคำสั่งซื้อ
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            เลือก E-Book ที่สนใจแล้วสั่งซื้อพร้อมแนบสลิปได้เลย
          </p>
          <Link
            to="/books"
            className="mt-6 inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition shadow-sm"
          >
            เลือกดูหนังสือ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1">
                    {order.id}
                  </span>
                  <span className="text-xs text-slate-400">
                    สั่งซื้อเมื่อ:{' '}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString('th-TH')
                      : '-'}
                  </span>
                </div>
                <div>{statusBadge(order.status)}</div>
              </div>

              <div className="my-4 space-y-3">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="grid h-14 w-10 shrink-0 place-items-center rounded bg-amber-50 text-base">
                        📖
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.author}
                      </p>
                    </div>

                    <span className="font-semibold text-slate-800 text-sm">
                      ฿{Number(item.priceTHB || 0).toLocaleString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-3">
                  {order.slipUrl && (
                    <button
                      onClick={() => setSelectedSlip(order.slipUrl)}
                      className="flex items-center gap-1 rounded border border-slate-300 bg-slate-50 px-2.5 py-1 text-slate-700 hover:bg-slate-100 transition"
                    >
                      <span>📎</span>
                      <span>ดูสลิปที่แนบ</span>
                    </button>
                  )}

                  {order.slipNote && (
                    <span className="text-slate-500 italic">
                      "{order.slipNote}"
                    </span>
                  )}

                  {order.status === 'rejected' && order.rejectReason && (
                    <span className="text-red-600 font-medium">
                      เหตุผล: {order.rejectReason}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-slate-500">ยอดชำระสุทธิ: </span>
                    <span className="text-base font-bold text-slate-900">
                      ฿{Number(order.totalAmount || 0).toLocaleString('th-TH')}
                    </span>
                  </div>

                  {order.status === 'approved' && (
                    <Link
                      to="/me/library"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      📖 เปิดอ่านในชั้นหนังสือ
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
              <h3 className="text-sm font-bold text-slate-900">
                หลักฐานการโอนเงิน (สลิป)
              </h3>
              <button
                onClick={() => setSelectedSlip(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-3 max-h-[70vh] overflow-y-auto">
              <img
                src={selectedSlip}
                alt="สลิปการโอนเงิน"
                className="w-full rounded-lg object-contain"
              />
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
    </div>
  );
}

export default MyOrders;
