import { useEffect, useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';

const linkClass = ({ isActive }) =>
  `px-3 py-1.5 text-xs md:text-sm font-medium transition rounded-full flex items-center gap-1.5 ${isActive
    ? 'bg-[#EAE2D2] text-[#24211D] font-semibold'
    : 'text-[#68625B] hover:text-[#24211D] hover:bg-[#F3ECE0]'
  }`;

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const { totalCount } = useCart();
  const { pendingCount } = useOrders();
  const navigate = useNavigate();
  const [navSearch, setNavSearch] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const memberInitial =
    member?.displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  useEffect(() => {
    setAvatarBroken(false);
  }, [member?.avatarUrl]);

  function handleLogout() {
    logout();
    setShowUserMenu(false);
    navigate('/');
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/books?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#EAE3D5] bg-[#FAF7F0]/95 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        {/* Logo Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2D2A26] text-white shadow-xs group-hover:scale-105 transition">
            📖
          </div>
          <div>
            <span className="font-serif text-lg md:text-xl font-bold tracking-tight text-[#24211D] block leading-none">
              NangSuKub
            </span>
            <span className="text-[10px] tracking-wide text-[#8C8479] font-sans">
              Read More, Live Better.
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>หน้าหลัก</NavLink>
          <NavLink to="/books" className={linkClass}>หมวดหมู่</NavLink>
          {isLoggedIn && (
            <>
              <NavLink to="/me/library" className={linkClass}>
                ชั้นหนังสือ
              </NavLink>
              <NavLink to="/me/wishlist" className={linkClass}>
                รายการโปรด
              </NavLink>
              <NavLink to="/me/orders" className={linkClass}>
                คำสั่งซื้อ
              </NavLink>
            </>
          )}
          <NavLink to="/about" className={linkClass}>เกี่ยวกับเรา</NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `${linkClass({ isActive })} text-amber-800`}>
              <span>หลังบ้าน</span>
              {pendingCount > 0 && (
                <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          )}
        </div>

        {/* Search Bar + User + Cart Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="ค้นหาหนังสือ..."
              className="w-44 md:w-56 rounded-full border border-[#DFD6C7] bg-[#F4EFE6] px-3.5 py-1.5 pl-8 text-xs text-[#2D2A26] placeholder-[#9E9588] focus:border-[#2D2A26] focus:bg-white focus:outline-none transition shadow-2xs"
            />
            <span className="absolute left-2.5 top-2 text-xs text-[#9E9588]">🔍</span>
          </form>

          {/* Cart Icon Button */}
          <Link
            to="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E2D9CB] bg-white text-[#2D2A26] hover:bg-[#F3ECE0] transition shadow-2xs"
            title="ตะกร้าสินค้า"
          >
            <span className="text-sm">🛒</span>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#2D2A26] px-1 text-[9px] font-bold text-white shadow-xs">
                {totalCount}
              </span>
            )}
          </Link>

          {/* User Profile / Login */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-full border border-[#E2D9CB] bg-white px-3 py-1.5 text-xs font-semibold text-[#2D2A26] hover:bg-[#F3ECE0] transition shadow-2xs"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#E2D9CB] bg-[#EAE2D2] text-xs font-bold text-[#2D2A26]">
                  {member?.avatarUrl && !avatarBroken ? (
                    <img
                      src={member.avatarUrl}
                      alt="รูปโปรไฟล์"
                      className="h-full w-full object-cover"
                      onError={() => setAvatarBroken(true)}
                    />
                  ) : (
                    memberInitial
                  )}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">{member?.displayName}</span>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[#E2D9CB] bg-white p-2 shadow-xl animate-fadeIn">
                  <div className="px-3 py-2 border-b border-[#F0EAE0]">
                    <p className="text-xs font-bold text-[#2D2A26] truncate">{member?.displayName}</p>
                    <p className="text-[10px] text-[#8C8479] truncate">{member?.email}</p>
                  </div>
                  <div className="py-1 text-xs text-[#524C44] space-y-0.5">
                    <Link
                      to="/me/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-1.5 hover:bg-[#F6F1E8]"
                    >
                      👤 โปรไฟล์ของฉัน
                    </Link>
                    <Link
                      to="/me/library"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-1.5 hover:bg-[#F6F1E8]"
                    >
                      📚 ชั้นหนังสือของฉัน
                    </Link>
                    <Link
                      to="/me/wishlist"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-1.5 hover:bg-[#F6F1E8]"
                    >
                      ❤️ รายการโปรด
                    </Link>
                    <Link
                      to="/me/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-1.5 hover:bg-[#F6F1E8]"
                    >
                      📋 ประวัติคำสั่งซื้อ
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block rounded-lg px-3 py-1.5 font-semibold text-amber-800 hover:bg-amber-50"
                      >
                        ⚙️ จัดการระบบหลังบ้าน
                      </Link>
                    )}
                  </div>
                  <div className="pt-1 border-t border-[#F0EAE0]">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left rounded-lg px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-full bg-[#2D2A26] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#433F3A] transition shadow-xs"
            >
              <span>เข้าสู่ระบบ</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
