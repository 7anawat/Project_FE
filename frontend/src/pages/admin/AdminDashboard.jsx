import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useOrders } from '../../context/OrderContext';
import { getAdminStats } from '../../api/backend';
import { ErrorBox, Loading } from '../../components/admin/AdminStates';

function StatCard({ label, value, to, badge }) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        {badge && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700 animate-pulse">{badge}</span>}
      </div>
      <p className="mt-1 text-3xl font-semibold text-slate-900">{value ?? 0}</p>
    </>
  );
  const cls = 'rounded-xl border border-amber-100 bg-white p-4';
  return to ? <Link to={to} className={cls + ' block hover:border-amber-300'}>{body}</Link> : <div className={cls}>{body}</div>;
}

function AdminDashboard() {
  const { token } = useAuth();
  const { pendingCount, orders } = useOrders();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const data = await getAdminStats(token);
        if (!ignore) { setStats(data); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <StatCard label="รอตรวจสลิป" value={pendingCount} to="/admin/orders" badge={pendingCount > 0 ? 'รออนุมัติ' : null} />
        <StatCard label="คำสั่งซื้อทั้งหมด" value={orders.length} to="/admin/orders" />
        <StatCard label="หนังสือ" value={stats?.books} to="/admin/books" />
        <StatCard label="สมาชิก" value={stats?.members} to="/admin/members" />
        <StatCard label="Admin" value={stats?.admins} />
        <StatCard label="รีวิว" value={stats?.reviews} />
      </div>
    </div>
  );
}

export default AdminDashboard;


