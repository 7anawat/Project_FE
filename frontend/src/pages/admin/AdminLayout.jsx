import { NavLink, Outlet } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';

const tabClass = ({ isActive }) =>
  'rounded-full px-4 py-1.5 text-sm transition flex items-center gap-1.5 ' +
  (isActive ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:bg-amber-50');

function AdminLayout() {
  const { pendingCount } = useOrders();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-wrap items-center gap-3 border-b border-amber-100 pb-4">
        <h1 className="mr-2 text-xl font-semibold text-slate-900">หลังบ้าน NangSuKub</h1>
        <nav className="flex flex-wrap gap-1">
          <NavLink to="/admin" end className={tabClass}>ภาพรวม</NavLink>
          <NavLink to="/admin/orders" className={tabClass}>
            <span>ตรวจสลิปโอนเงิน</span>
            {pendingCount > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white animate-pulse">
                {pendingCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/admin/books" className={tabClass}>หนังสือ</NavLink>
          <NavLink to="/admin/members" className={tabClass}>สมาชิก</NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  );
}

export default AdminLayout;


