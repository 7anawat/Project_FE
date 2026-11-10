import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import { getBook, getReviews, postReview, addToWishlist, removeFromWishlist } from '../api/backend';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [inWishlist, setInWishlist] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [qty, setQty] = useState(1);

  const { isLoggedIn, token, member } = useAuth();
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    if (!member?.id || !book?.id) {
      setIsOwned(false);
      return;
    }
    function checkOwnership() {
      try {
        const lib = JSON.parse(localStorage.getItem(`bookhub_library_${member.id}`) || '[]');
        setIsOwned(lib.some((b) => String(b.id) === String(book.id)));
      } catch {
        setIsOwned(false);
      }
    }
    checkOwnership();
    window.addEventListener('bookhub_library_updated', checkOwnership);
    return () => window.removeEventListener('bookhub_library_updated', checkOwnership);
  }, [member?.id, book?.id]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const b = await getBook(id);
        if (!ignore) {
          setBook(b);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    let ignore = false;
    getReviews(id)
      .then((data) => {
        if (!ignore) setReviews(data.items);
      })
      .catch(() => {
        if (!ignore) setReviews([]);
      });
    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleReviewSubmit(text) {
    const saved = await postReview(id, text, token);
    setReviews([
      { ...saved, member: { id: member.id, displayName: member.displayName }, score: null },
      ...reviews,
    ]);
  }

  async function toggleWishlist() {
    if (!token) return;
    setWishlistBusy(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(id, token);
        setInWishlist(false);
      } else {
        await addToWishlist(id, token);
        setInWishlist(true);
      }
    } catch {}
    setWishlistBusy(false);
  }

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-5xl animate-pulse px-4 py-12 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row">
          <div className="aspect-[3/4] w-72 shrink-0 rounded-3xl bg-[#EDE4D4]" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-2/3 rounded-xl bg-[#EDE4D4]" />
            <div className="h-4 w-1/3 rounded-xl bg-[#EDE4D4]" />
            <div className="h-32 w-full rounded-2xl bg-[#EDE4D4]" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-xl font-bold text-[#2B2825]">ไม่พบหนังสือเล่มนี้ 😢</p>
        <p className="text-sm text-[#827A6E] mt-1">{error?.message}</p>
        <Link
          to="/books"
          className="mt-6 inline-block rounded-full bg-[#2D2A26] px-6 py-2.5 text-xs font-semibold text-white shadow-xs"
        >
          กลับไปหน้าหนังสือทั้งหมด
        </Link>
      </div>
    );
  }

  const priceNum = Number(book.priceTHB) || 0;
  const originalPriceNum = Math.round(priceNum * 1.15);
  const inCart = isInCart(book.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="text-xs text-[#827A6E] flex items-center gap-2">
        <Link to="/" className="hover:text-[#2B2825]">หน้าหลัก</Link>
        <span>/</span>
        <Link to="/books" className="hover:text-[#2B2825]">หมวดหมู่</Link>
        <span>/</span>
        <span className="text-[#2B2825] font-semibold truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Product Layout (Matching Prototype Screen 3) */}
      <div className="grid gap-10 md:grid-cols-12 items-start">
        {/* Left Column: Big Book Cover + Thumbnails */}
        <div className="md:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl border border-[#EDE5D6] bg-white p-3 shadow-md">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-full w-full rounded-2xl object-cover shadow-2xs"
              />
            ) : (
              <div className="grid h-full place-items-center rounded-2xl bg-[#F6F0E4] text-6xl">
                📖
              </div>
            )}
            <span className="absolute top-5 left-5 rounded-md bg-[#2D2A26]/80 px-2.5 py-1 text-xs font-bold text-white shadow-xs backdrop-blur-xs">
              E-Book
            </span>
          </div>

          {/* Small Thumbnails Row */}
          <div className="flex gap-2.5 justify-center">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-16 w-12 rounded-xl border overflow-hidden cursor-pointer p-0.5 transition ${
                  idx === 1 ? 'border-[#2D2A26] ring-1 ring-[#2D2A26]' : 'border-[#E2D8C7] hover:border-[#2D2A26]'
                }`}
              >
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-[#F6F0E4] text-xs">📖</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Title, Rating, Price, Cart & Description */}
        <div className="md:col-span-7 space-y-6">
          <div>
            <span className="rounded-full bg-[#EFE8DC] px-3 py-1 text-xs font-semibold text-[#665F55]">
              {book.category || 'ทั่วไป'}
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2825] mt-2 leading-snug">
              {book.title}
            </h1>
            <p className="text-sm font-medium text-[#7A7165] mt-1">ผู้แต่ง: {book.author}</p>

            {/* Rating Stars & Reviews */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-amber-500 font-bold">⭐⭐⭐⭐⭐</span>
              <span className="font-bold text-[#2B2825]">4.9</span>
              <span className="text-[#8C8375]">({reviews.length} รีวิวจากสมาชิก)</span>
            </div>
          </div>

          {/* Price Tag with Discount Strike */}
          <div className="flex items-baseline gap-3 border-y border-[#EDE5D6] py-4">
            <span className="font-serif text-3xl font-bold text-[#2B2825]">
              ฿{priceNum.toLocaleString('th-TH')}
            </span>
            {priceNum > 0 && (
              <span className="text-sm text-[#9C9283] line-through font-medium">
                ฿{originalPriceNum.toLocaleString('th-TH')}
              </span>
            )}
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              E-Book ลด 15%
            </span>
          </div>

          {/* Cart & Quantity Row (Prototype Screen 3) */}
          {isOwned ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-bold text-emerald-950 text-sm">คุณเป็นเจ้าของ E-Book เล่มนี้แล้ว</p>
                  <p className="text-xs text-emerald-800">เปิดอ่านฉบับเต็มได้ทันทีในชั้นหนังสือของคุณ</p>
                </div>
              </div>
              <Link
                to="/me/library"
                className="rounded-full bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-800 transition"
              >
                📖 เปิดอ่านในชั้นหนังสือ
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Quantity Selector */}
                <div className="flex items-center rounded-full border border-[#DED4C3] bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-[#2D2A26] hover:bg-[#F4EDE2] disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-[#2D2A26]">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-[#2D2A26] hover:bg-[#F4EDE2]"
                  >
                    +
                  </button>
                </div>

                {/* Big Dark "ใส่ตะกร้า" Button */}
                <button
                  onClick={() => {
                    addToCart(book);
                    setAddedNotice(true);
                    setTimeout(() => setAddedNotice(false), 3000);
                  }}
                  className={`flex-1 min-w-[160px] rounded-full py-3 px-6 text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition active:scale-[0.99] ${
                    inCart
                      ? 'bg-[#EAE2D2] text-[#2D2A26] border border-[#DDD3C1]'
                      : 'bg-[#2D2A26] text-white hover:bg-[#433F3A]'
                  }`}
                >
                  <span>{inCart ? '✓' : '🛒'}</span>
                  <span>{inCart ? 'อยู่ในตะกร้าแล้ว' : 'ใส่ตะกร้า'}</span>
                </button>

                {/* Wishlist Heart Button */}
                {isLoggedIn && (
                  <button
                    onClick={toggleWishlist}
                    disabled={wishlistBusy}
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-2xs transition ${
                      inWishlist
                        ? 'border-red-300 bg-red-50 text-red-600'
                        : 'border-[#DED4C3] bg-white text-[#6E6659] hover:border-red-300 hover:text-red-500'
                    }`}
                    title="บันทึกในรายการโปรด"
                  >
                    <span className="text-base">{inWishlist ? '❤️' : '♡'}</span>
                  </button>
                )}
              </div>

              {/* Direct Buy & Sample Buttons */}
              <div className="flex flex-wrap gap-2.5">
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      addToCart(book);
                      navigate('/cart');
                    }}
                    className="rounded-full bg-[#C28236] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#A96D29] transition"
                  >
                    ⚡ สั่งซื้อทันที
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="rounded-full bg-[#C28236] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#A96D29] transition"
                  >
                    🔒 เข้าสู่ระบบเพื่อสั่งซื้อ
                  </Link>
                )}

                <button
                  onClick={() => setShowSampleModal(true)}
                  className="rounded-full border border-[#D5C9B5] bg-white px-5 py-2.5 text-xs font-semibold text-[#574F44] hover:bg-[#F6F1E6] transition shadow-2xs"
                >
                  📖 ทดลองอ่านตัวอย่าง
                </button>
              </div>

              {addedNotice && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 flex items-center justify-between animate-fadeIn">
                  <span>✓ เพิ่มหนังสือเล่มนี้เข้าตะกร้าเรียบร้อยแล้ว</span>
                  <Link to="/cart" className="underline font-bold text-emerald-950">
                    ไปที่ตะกร้า →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Book Metadata Info */}
          <div className="rounded-2xl border border-[#EDE5D6] bg-white p-4 grid grid-cols-2 gap-2 text-xs text-[#635C52]">
            <div>• <strong className="text-[#2B2825]">ผู้แต่ง:</strong> {book.author}</div>
            <div>• <strong className="text-[#2B2825]">รูปแบบ:</strong> E-Book (PDF/ePub)</div>
            <div>• <strong className="text-[#2B2825]">สำนักพิมพ์:</strong> {book.publisher || 'ไม่ระบุ'}</div>
            <div>• <strong className="text-[#2B2825]">ISBN:</strong> {book.isbn || 'ไม่ระบุ'}</div>
          </div>

          {/* Description Section */}
          <div className="space-y-2 pt-2">
            <h2 className="font-serif text-lg font-bold text-[#2B2825]">รายละเอียดสินค้า</h2>
            <p className="text-xs md:text-sm text-[#5C554A] leading-relaxed whitespace-pre-line">
              {book.description || 'ยังไม่มีคำอธิบายสำหรับหนังสือเล่มนี้'}
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="border-t border-[#EDE5D6] pt-8 space-y-6">
        <h2 className="font-serif text-xl font-bold text-[#2B2825]">
          รีวิวจากสมาชิก ({reviews.length})
        </h2>
        <ReviewList items={reviews} />

        <div className="rounded-2xl border border-[#EDE5D6] bg-white p-6 shadow-xs">
          {isLoggedIn ? (
            <ReviewForm key={book.id} bookTitle={book.title} onSubmit={handleReviewSubmit} />
          ) : (
            <p className="text-xs text-[#7A7165]">
              <Link to="/login" className="font-bold text-[#2D2A26] underline">เข้าสู่ระบบ</Link> เพื่อร่วมเขียนรีวิวหนังสือเล่มนี้
            </p>
          )}
        </div>
      </section>

      {/* Sample Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-[#E8DEC9]">
            <div className="flex items-start justify-between border-b border-[#F0EAE0] pb-3">
              <div>
                <span className="rounded-full bg-[#EFE8DC] px-2.5 py-0.5 text-[10px] font-bold text-[#5C554A]">
                  ทดลองอ่าน E-Book
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2B2825] mt-1">{book.title}</h3>
                <p className="text-xs text-[#8C8375]">โดย {book.author}</p>
              </div>
              <button
                onClick={() => setShowSampleModal(false)}
                className="rounded-full p-1.5 text-[#8C8375] hover:bg-[#F6F1E6] text-sm"
              >
                ✕
              </button>
            </div>

            <div className="my-5 space-y-4 text-xs md:text-sm leading-relaxed text-[#5C554A]">
              <div className="rounded-2xl bg-[#FAF6F0] p-4 border border-[#ECE2D2] italic text-[#4A443B]">
                "{book.description || 'ไม่มีคำอธิบายเพิ่มเติม'}"
              </div>
              <h4 className="font-serif font-bold text-sm text-[#2B2825]">ตัวอย่างบทที่ 1</h4>
              <p>
                ยินดีต้อนรับสู่หนังสือฉบับตัวอย่างสำหรับทดลองอ่านก่อนตัดสินใจซื้อ E-Book ฉบับเต็ม 
                เมื่อสั่งซื้อเรียบร้อย คุณจะสามารถเปิดอ่านได้ทันทีบนทุกอุปกรณ์และดาวน์โหลดไฟล์เก็บไว้ได้ตลอดไป
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-[#F0EAE0] pt-4">
              <span className="font-serif text-xl font-bold text-[#2B2825]">
                ฿{priceNum.toLocaleString('th-TH')}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSampleModal(false)}
                  className="rounded-full border border-[#D5C9B5] px-4 py-2 text-xs font-semibold text-[#5C554A]"
                >
                  ปิดหน้าต่าง
                </button>
                <button
                  onClick={() => {
                    addToCart(book);
                    setShowSampleModal(false);
                    navigate('/cart');
                  }}
                  className="rounded-full bg-[#2D2A26] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#433F3A]"
                >
                  สั่งซื้อทันที
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookDetail;
