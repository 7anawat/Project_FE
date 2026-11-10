import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBooks } from '../../api/backend';
import { ErrorBox, Loading, btnPrimary, inputClass } from '../../components/admin/AdminStates';

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getBooks();
        if (!ignore) { setBooks(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [reloadKey]);

  const q = query.trim().toLowerCase();
  const shown = books.filter(b =>
    q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || String(b.id) === q
  );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">หนังสือทั้งหมด</h2>
          {status === 'success' && <p className="text-sm text-slate-500">แสดง {shown.length} จาก {books.length} เล่ม</p>}
        </div>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)}
                 placeholder="ค้นชื่อหนังสือ ผู้แต่ง หรือพิมพ์ id" className={inputClass + ' md:w-64'} />
          <Link to="/admin/books/new" className={btnPrimary + ' whitespace-nowrap'}>+ เพิ่มหนังสือ</Link>
        </div>
      </div>

      {status === 'loading' && <Loading />}
      {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-amber-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">หนังสือ</th>
                <th className="px-4 py-3">หมวดหมู่</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map(b => (
                <tr key={b.id} className="hover:bg-amber-50/40">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      {b.coverUrl
                        ? <img src={b.coverUrl} alt="" className="h-12 w-8 rounded object-cover" />
                        : <div className="grid h-12 w-8 place-items-center rounded bg-amber-50 text-xs">📖</div>}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{b.title}</p>
                        <p className="truncate text-xs text-slate-500">{b.author} <span className="text-slate-300">#{b.id}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{b.category ?? '-'}</td>
                  <td className="px-4 py-2 text-slate-600">{b.priceTHB ? `฿${b.priceTHB}` : '-'}</td>
                  <td className="px-4 py-2 text-right">
                    <Link to={`/admin/books/${b.id}`} className="text-amber-600 hover:underline">แก้ไข</Link>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">ไม่พบหนังสือที่ค้นหา</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminBooks;

