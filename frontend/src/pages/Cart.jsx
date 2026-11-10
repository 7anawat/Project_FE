import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/AuthContext';
import { useOrders } from '../context/OrderContext';

function Cart() {
  const { items, removeFromCart, clearCart, totalPrice, totalCount } = useCart();
  const { member } = useAuth();
  const { createOrder } = useOrders();

  const [step, setStep] = useState('cart'); // 'cart' | 'payment' | 'success'
  const [slipUrl, setSlipUrl] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [slipNote, setSlipNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferBank, setTransferBank] = useState('ธนาคารกสิกรไทย');
  const [errorMsg, setErrorMsg] = useState(null);
  const [submittedOrder, setSubmittedOrder] = useState(null);

  // อัปโหลดและแปลงสลิปเป็น Data URL
  function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    setErrorMsg('รองรับเฉพาะไฟล์ JPG, PNG และ WEBP เท่านั้น');
    setSlipFile(null);
    setSlipUrl(null);
    e.target.value = '';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setErrorMsg('ขนาดรูปภาพต้องไม่เกิน 5MB');
    setSlipFile(null);
    setSlipUrl(null);
    e.target.value = '';
    return;
  }

  setErrorMsg(null);
  setSlipFile(file);

  const reader = new FileReader();

  reader.onload = () => {
    setSlipUrl(reader.result);
  };

  reader.onerror = () => {
    setErrorMsg('ไม่สามารถอ่านไฟล์รูปภาพได้');
    setSlipFile(null);
    setSlipUrl(null);
  };

  reader.readAsDataURL(file);
}

 async function handleSubmitOrder(e) {
  e.preventDefault();

  if (!items.length) {
    setErrorMsg('ไม่มีสินค้าในตะกร้า');
    return;
  }

  if (!slipFile) {
    setErrorMsg('กรุณาแนบรูปภาพสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ');
    return;
  }

  if (isSubmitting) return;

  setIsSubmitting(true);
  setErrorMsg(null);

  try {
    const order = await createOrder({
      items,
      slipFile,
      slipNote,
      transferBank,
    });

    setSubmittedOrder(order);
    clearCart();
    setStep('success');
  } catch (err) {
    console.error('Create order failed:', err);
    setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ');
  } finally {
    setIsSubmitting(false);
  }
}

  // หน้าสำเร็จ (Order Success)
  if (step === 'success') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-8">
        <div className="rounded-3xl border border-[#EDE5D6] bg-white p-8 md:p-12 shadow-sm space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#FAF5EC] border border-[#E8DEC9] text-3xl">
            ✨
          </div>
          <span className="inline-block rounded-full bg-[#F3EDE2] px-3.5 py-1 text-xs font-mono font-bold text-[#2D2A26]">
            คำสั่งซื้อเลขที่: {submittedOrder?.id}
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2825]">
            สั่งซื้อ E-Book และส่งสลิปเรียบร้อยแล้ว!
          </h2>
          <p className="text-xs md:text-sm text-[#736C61] max-w-md mx-auto leading-relaxed">
            ขอบคุณสำหรับการสั่งซื้อครับ คุณ {member?.displayName} ระบบได้ส่งข้อมูลให้แอดมินตรวจสอบแล้ว
            เมื่อแอดมินยืนยันยอดเงิน E-Book จะถูกนำเข้าสู่ชั้นหนังสือของคุณทันที
          </p>

          <div className="my-6 rounded-2xl bg-[#FAF6F0] p-5 text-left border border-[#EDE5D6] space-y-2 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#EAE1D1]">
              <span className="text-[#8C8375]">สถานะคำสั่งซื้อ</span>
              <span className="font-bold text-[#8C5D23] bg-[#F7EEDF] px-2.5 py-0.5 rounded-full">
                ⏳ รอแอดมินตรวจสอบสลิป
              </span>
            </div>
            <div className="pt-1 flex justify-between items-center text-sm">
              <span className="text-[#696256]">ยอดชำระสุทธิ</span>
              <span className="font-serif font-bold text-base text-[#2B2825]">
                ฿{Number(submittedOrder?.totalAmount).toLocaleString('th-TH')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/me/orders"
              className="rounded-full bg-[#2D2A26] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#433F3A] transition"
            >
              📋 ติดตามสถานะคำสั่งซื้อ
            </Link>
            <Link
              to="/me/library"
              className="rounded-full border border-[#D5C9B5] bg-white px-5 py-2.5 text-xs font-semibold text-[#5C554A] hover:bg-[#F6F1E6] transition shadow-2xs"
            >
              📚 ไปที่ชั้นหนังสือ
            </Link>
            <Link
              to="/books"
              className="rounded-full border border-[#D5C9B5] px-5 py-2.5 text-xs font-semibold text-[#5C554A] hover:bg-[#F6F1E6] transition"
            >
              เลือกดูหนังสือเพิ่ม
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // หน้าชำระเงินและแนบสลิป (Matching Prototype Screen 5)
  if (step === 'payment') {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 space-y-6">
        <button
          onClick={() => setStep('cart')}
          className="text-xs font-semibold text-[#736B5F] hover:text-[#2B2825] flex items-center gap-1"
        >
          <span>←</span>
          <span>กลับไปตรวจสอบตะกร้าสินค้า</span>
        </button>

        <div className="border-b border-[#EAE3D5] pb-4">
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2825]">
            ข้อมูลการชำระเงิน
          </h1>
          <p className="text-xs text-[#827A6E] mt-1">
            เลือกช่องทางการชำระเงิน และแนบหลักฐานสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: ข้อมูลผู้สั่งซื้อ & ที่อยู่ดิจิทัล */}
          <div className="lg:col-span-7 space-y-5">
            <div className="rounded-3xl border border-[#EDE5D6] bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-serif font-bold text-base text-[#2B2825]">
                ข้อมูลบัญชีผู้สั่งซื้อ
              </h2>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[#696256] font-medium mb-1">ชื่อ-นามสกุล / ชื่อที่แสดง</label>
                  <input
                    type="text"
                    readOnly
                    value={member?.displayName || ''}
                    className="w-full rounded-xl border border-[#DFD6C7] bg-[#FAF7F2] p-2.5 text-xs text-[#2D2A26] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[#696256] font-medium mb-1">อีเมลผู้รับสิทธิ์ E-Book</label>
                  <input
                    type="email"
                    readOnly
                    value={member?.email || ''}
                    className="w-full rounded-xl border border-[#DFD6C7] bg-[#FAF7F2] p-2.5 text-xs text-[#2D2A26] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[#696256] font-medium mb-1">หมายเหตุเพิ่มเติม / วันเวลาที่โอน (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น โอนวันที่ 9 เวลา 14:30 น."
                    value={slipNote}
                    onChange={(e) => setSlipNote(e.target.value)}
                    className="w-full rounded-xl border border-[#DFD6C7] bg-white p-2.5 text-xs text-[#2D2A26] focus:border-[#2D2A26] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* ข้อมูลบัญชีรับโอน */}
            <div className="rounded-3xl border border-[#EDE5D6] bg-[#FAF6F0] p-6 shadow-xs space-y-3">
              <span className="rounded-full bg-[#EAE2D2] px-3 py-1 text-[11px] font-bold text-[#574F44]">
                ช่องทางรับโอนเงิน
              </span>
              <h3 className="font-serif text-lg font-bold text-[#2B2825]">
                ธนาคารกสิกรไทย (KBANK)
              </h3>
              <div className="space-y-1 text-xs text-[#615A4F]">
                <p>เลขที่บัญชี: <strong className="font-mono text-base text-[#2B2825]">098-2-34567-8</strong></p>
                <p>ชื่อบัญชี: <strong>บจก. บุ๊คเวิร์ส ดิจิทัล (NangSuKub Co., Ltd.)</strong></p>
                <p>หรือ พร้อมเพย์ (PromptPay): <strong className="font-mono">089-999-9999</strong></p>
              </div>
            </div>
          </div>

          {/* Right Column: วิธีการชำระเงิน + แนบสลิป + ยอดรวม (Matching Prototype Screen 5) */}
          <div className="lg:col-span-5 space-y-5">
            <form onSubmit={handleSubmitOrder} className="rounded-3xl border border-[#EDE5D6] bg-white p-6 shadow-xs space-y-5">
              <h2 className="font-serif font-bold text-base text-[#2B2825]">
                วิธีการชำระเงิน
              </h2>

              <div className="space-y-2 text-xs">
                {/* Radio options styled like prototype */}
                <label className="flex items-center justify-between rounded-2xl border border-[#2D2A26] bg-[#FAF7F2] p-3.5 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={transferBank === 'ธนาคารกสิกรไทย'}
                      onChange={() => setTransferBank('ธนาคารกสิกรไทย')}
                      className="accent-[#2D2A26]"
                    />
                    <span className="font-semibold text-[#2D2A26]">โอนผ่านธนาคาร (แนบสลิป)</span>
                  </div>
                  <span className="text-base">🏦</span>
                </label>

                <label className="flex items-center justify-between rounded-2xl border border-[#E5DC CD] p-3.5 cursor-pointer hover:bg-[#FAF7F2]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={transferBank === 'พร้อมเพย์ (PromptPay)'}
                      onChange={() => setTransferBank('พร้อมเพย์ (PromptPay)')}
                      className="accent-[#2D2A26]"
                    />
                    <span className="font-medium text-[#574F44]">พร้อมเพย์ (QR PromptPay)</span>
                  </div>
                  <span className="text-base">📱</span>
                </label>
              </div>

              {/* Upload Slip Input */}
              <div className="space-y-2 pt-2 border-t border-[#F0EAE0]">
                <label className="block text-xs font-bold text-[#2D2A26]">
                  แนบหลักฐานสลิปการโอนเงิน *
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  required
                  className="w-full text-xs text-[#736B5F] file:mr-2 file:rounded-full file:border-0 file:bg-[#2D2A26] file:px-4 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#433F3A] cursor-pointer"
                />

                {slipUrl && (
                  <div className="rounded-xl border border-[#EDE5D6] bg-[#FAF6F0] p-2 mt-2">
                    <p className="text-[10px] font-bold text-[#827A6E] mb-1">ตัวอย่างสลิปที่แนบ:</p>
                    <img src={slipUrl} alt="สลิป" className="max-h-36 mx-auto rounded-lg object-contain border border-[#E2D8C7]" />
                  </div>
                )}
              </div>

              {errorMsg && (
                <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                  {errorMsg}
                </p>
              )}

              {/* ยอดรวมสุทธิ */}
              <div className="border-t border-[#F0EAE0] pt-4 flex items-baseline justify-between">
                <span className="text-xs text-[#736B5F]">ยอดรวมทั้งสิ้น</span>
                <span className="font-serif text-2xl font-bold text-[#2D2A26]">
                  ฿{totalPrice.toLocaleString('th-TH')}
                </span>
              </div>

              <button
                type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-full bg-[#2D2A26] py-3 text-xs md:text-sm font-bold text-white shadow-md hover:bg-[#433F3A] transition active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
>
                      {isSubmitting
                      ? 'กำลังส่งคำสั่งซื้อ...'
                      : 'ยืนยันการสั่งซื้อและส่งสลิป'}
                </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // หน้าแสดงรายการตะกร้า (Matching Prototype Screen 4)
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#EAE3D5] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2825]">
            ตะกร้าสินค้า
          </h1>
          <p className="text-xs text-[#827A6E] mt-1">
            ตรวจสอบรายการสินค้าของคุณ ({totalCount} รายการ)
          </p>
        </div>
        {totalCount > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-[#A14732] hover:underline self-start"
          >
            ล้างตะกร้าทั้งหมด
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#DDD2C0] bg-white py-16 text-center space-y-3">
          <p className="text-5xl">🛒</p>
          <h2 className="font-serif text-lg font-bold text-[#2D2A26]">ตะกร้าของคุณยังว่างอยู่</h2>
          <p className="text-xs text-[#827A6E]">เลือกดูหนังสือที่น่าสนใจแล้วเพิ่มเข้าตะกร้าได้เลยครับ</p>
          <Link
            to="/books"
            className="inline-block rounded-full bg-[#2D2A26] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#433F3A] transition shadow-xs"
          >
            เลือกซื้อหนังสือ →
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: รายการหนังสือในตะกร้า (Matching Table in Prototype Screen 4) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="overflow-hidden rounded-3xl border border-[#EDE5D6] bg-white shadow-xs">
              <div className="divide-y divide-[#F0EAE0]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 md:p-5 flex items-center justify-between gap-4 transition hover:bg-[#FAF7F2]"
                  >
                    {/* Cover & Details */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {item.coverUrl ? (
                        <img
                          src={item.coverUrl}
                          alt={item.title}
                          className="h-20 w-15 shrink-0 rounded-xl object-cover border border-[#E5DDCF]"
                        />
                      ) : (
                        <div className="grid h-20 w-15 shrink-0 place-items-center rounded-xl bg-[#F6F0E4] text-xl">
                          📖
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/books/${item.id}`}
                          className="font-serif font-bold text-sm text-[#2B2825] hover:text-amber-800 truncate block"
                        >
                          {item.title}
                        </Link>
                        <p className="text-xs text-[#827A6E] truncate">{item.author}</p>
                        <span className="inline-block rounded-md bg-[#FAF4EA] border border-[#E8DFC8] px-2 py-0.5 text-[10px] font-medium text-[#7D7364] mt-1">
                          E-Book
                        </span>
                      </div>
                    </div>

                    {/* Price & Quantity & Remove */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="font-serif font-bold text-sm text-[#2B2825]">
                          ฿{Number(item.priceTHB).toLocaleString('th-TH')}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-[#998F80] hover:bg-[#F4ECE0] hover:text-red-600 transition text-sm"
                        title="ลบออกจากตะกร้า"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Back Button */}
            <Link
              to="/books"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#665F54] hover:text-[#2B2825] transition"
            >
              <span>←</span>
              <span>เลือกซื้อสินค้าต่อ</span>
            </Link>
          </div>

          {/* Right Column: สรุปคำสั่งซื้อ (Matching Prototype Screen 4) */}
          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-[#EDE5D6] bg-white p-6 shadow-xs space-y-4">
              <h2 className="font-serif font-bold text-base text-[#2B2825] pb-3 border-b border-[#F0EAE0]">
                สรุปคำสั่งซื้อ
              </h2>

              <div className="space-y-3 text-xs text-[#635C52]">
                <div className="flex justify-between">
                  <span>ยอดรวม ({totalCount} รายการ)</span>
                  <span className="font-semibold text-[#2D2A26]">฿{totalPrice.toLocaleString('th-TH')}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง (ดิจิทัล)</span>
                  <span className="font-semibold text-emerald-700">ฟรี</span>
                </div>

                <div className="border-t border-[#F0EAE0] pt-3 flex items-baseline justify-between text-sm">
                  <span className="font-bold text-[#2D2A26]">รวมทั้งสิ้น</span>
                  <span className="font-serif text-2xl font-bold text-[#2D2A26]">
                    ฿{totalPrice.toLocaleString('th-TH')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('payment')}
                className="w-full rounded-full bg-[#2D2A26] py-3 text-xs md:text-sm font-bold text-white shadow-md hover:bg-[#433F3A] transition active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>ไปที่การชำระเงิน</span>
                <span>→</span>
              </button>

              <p className="text-[10px] text-center text-[#998F80]">
                🔒 ชำระเงินปลอดภัยด้วยระบบตรวจสลิปผ่านแอดมิน
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
