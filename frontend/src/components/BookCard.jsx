import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../auth/AuthContext';
import { addToWishlist, removeFromWishlist } from '../api/backend';

function BookCard({ book, initialInWishlist = false }) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [inWishlist, setInWishlist] = useState(initialInWishlist);
  const { addToCart, isInCart } = useCart();
  const { isLoggedIn, token } = useAuth();

  const price = book.priceTHB ? `฿${Number(book.priceTHB).toLocaleString('th-TH')}` : null;

  useEffect(() => {
    setCoverFailed(false);
  }, [book.id, book.coverUrl]);

  const coverSrc = book.coverUrl && !coverFailed
    ? book.coverUrl
    : '/book-cover-placeholder.svg';

  async function handleToggleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn || !token) {
      alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มในรายการโปรด');
      return;
    }
    try {
      if (inWishlist) {
        await removeFromWishlist(book.id, token);
        setInWishlist(false);
      } else {
        await addToWishlist(book.id, token);
        setInWishlist(true);
      }
    } catch {}
  }

  function handleAddToCartClick(e) {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book);
  }

  const inCart = isInCart(book.id);

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#EDE5D6] bg-white p-3 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#D8CCBA] hover:shadow-md">
      <Link to={`/books/${book.id}`} className="block">
        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F5EFE6]">
          <img
            src={coverSrc}
            alt={book.title}
            loading="lazy"
            onError={() => setCoverFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* E-Book Badge */}
          <span className="absolute top-2 left-2 rounded-md bg-[#2D2A26]/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs">
            E-Book
          </span>

          {/* Wishlist Heart Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-xs transition hover:scale-110 ${
              inWishlist ? 'text-red-500' : 'text-[#8A8275] hover:text-red-500'
            }`}
            title="เพิ่มในรายการโปรด"
          >
            {inWishlist ? '❤️' : '♡'}
          </button>
        </div>

        {/* Book Details */}
        <div className="mt-3">
          <h3
            className="line-clamp-1 font-sans text-sm font-semibold text-[#2B2825] group-hover:text-amber-800 transition"
            title={book.title}
          >
            {book.title}
          </h3>
          <p className="line-clamp-1 text-xs text-[#827A6E] mt-0.5">{book.author}</p>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-bold text-[#2B2825]">
              {price || 'ฟรี'}
            </span>
            {book.category && (
              <span className="text-[10px] text-[#938A7C] font-medium truncate max-w-[80px]">
                {book.category}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Cart Action Button (Matching Prototype) */}
      <div className="mt-3 pt-2 border-t border-[#F4EFE6]">
        <button
          onClick={handleAddToCartClick}
          className={`w-full rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-[0.98] ${
            inCart
              ? 'bg-[#EAE2D2] text-[#2D2A26] border border-[#DDD3C1]'
              : 'bg-[#2D2A26] text-white hover:bg-[#433F3A] shadow-xs'
          }`}
        >
          <span>{inCart ? '✓' : '🛒'}</span>
          <span>{inCart ? 'ในตะกร้าแล้ว' : 'ใส่ตะกร้า'}</span>
        </button>
      </div>
    </div>
  );
}

export default BookCard;
