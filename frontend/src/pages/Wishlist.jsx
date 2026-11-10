import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { getWishlist, removeFromWishlist } from '../api/backend';

function Wishlist() {
  const { member, token } = useAuth();
  const { addToCart, isInCart } = useCart();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const data = await getWishlist(token);
        if (!ignore) {
          setItems(data.items);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token]);

  async function handleRemove(bookId) {
    await removeFromWishlist(bookId, token);
    setItems(items.filter(i => i.bookId !== bookId));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">รายการอยากอ่านของ {member?.displayName}</h1>
      <p className="mb-6 text-sm text-slate-500">กดปุ่มหัวใจในหน้าหนังสือเพื่อเพิ่มเข้ามาที่นี่</p>

      {status === 'loading' && <p className="py-12 text-center text-slate-400">กำลังโหลด...</p>}
      {status === 'error' && <p className="py-12 text-center text-red-500">{error?.message}</p>}
      {status === 'success' && items.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-4xl">📚</p>
          <p className="mt-3 text-slate-500">ยังไม่มีหนังสือในรายการ</p>
          <Link to="/books" className="mt-4 inline-block text-sm text-amber-600 hover:underline">เลือกหนังสือเลย</Link>
        </div>
      )}
      {status === 'success' && items.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map(item => (
            <div key={item.bookId} className="flex gap-4 rounded-xl border border-amber-100 bg-white p-4">
              {item.coverUrl ? (
                <img src={item.coverUrl} alt={item.title} className="h-24 w-16 shrink-0 rounded object-cover" />
              ) : (
                <div className="grid h-24 w-16 shrink-0 place-items-center rounded bg-amber-50 text-2xl">📖</div>
              )}
              <div className="flex-1 min-w-0">
                <Link to={`/books/${item.bookId}`} className="font-medium text-slate-900 hover:text-amber-600 block truncate">
                  {item.title}
                </Link>
                <p className="text-sm text-slate-500 truncate">{item.author}</p>
                {item.priceTHB && <p className="text-sm font-semibold text-slate-800">฿{Number(item.priceTHB).toLocaleString('th-TH')}</p>}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
                  <button
                    onClick={() =>
                      addToCart({
                        id: item.bookId,
                        title: item.title,
                        author: item.author,
                        priceTHB: item.priceTHB,
                        coverUrl: item.coverUrl,
                      })
                    }
                    className={`rounded-lg px-3 py-1 text-xs font-semibold shadow-xs transition ${
                      isInCart(item.bookId)
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                        : 'bg-amber-500 text-white hover:bg-amber-600'
                    }`}
                  >
                    {isInCart(item.bookId) ? '✓ อยู่ในตะกร้าแล้ว' : '🛒 เพิ่มเข้าตะกร้า'}
                  </button>
                  <button onClick={() => handleRemove(item.bookId)}
                          className="text-xs text-red-500 hover:underline">
                    ลบออกจากรายการ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;

