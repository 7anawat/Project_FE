import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getAdminBook, getCategories, createBook, updateBook, deleteBook } from '../../api/backend';
import { ErrorBox, Loading, ConfirmBox, btnPrimary, btnDanger, inputClass } from '../../components/admin/AdminStates';

const EMPTY = {
  title: '', author: '', category: '', isbn: '', publisher: '',
  publicationYear: '', description: '', priceTHB: '', stockQuantity: '0',
  coverUrl: '', language: 'th'
};

function AdminBookForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { token } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const [cats, book] = await Promise.all([
          getCategories().catch(() => []),
          isEdit ? getAdminBook(id, token) : null
        ]);
        if (ignore) return;
        setCategories(cats);
        if (book) {
          setForm({
            title: book.title ?? '',
            author: book.author ?? '',
            category: book.category ?? '',
            isbn: book.isbn ?? '',
            publisher: book.publisher ?? '',
            publicationYear: book.publicationYear ? String(book.publicationYear) : '',
            description: book.description ?? '',
            priceTHB: book.priceTHB ? String(book.priceTHB) : '',
            stockQuantity: String(book.stockQuantity ?? 0),
            coverUrl: book.coverUrl ?? '',
            language: book.language ?? 'th'
          });
        }
        setStatus('ready');
      } catch (err) {
        if (!ignore) { setLoadError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [id, isEdit, token]);

  function set(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) {
      setServerError('กรุณากรอกชื่อหนังสือและผู้แต่ง');
      return;
    }

    setSaving(true);
    setServerError(null);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      category: form.category.trim() || null,
      isbn: form.isbn.trim() || null,
      publisher: form.publisher.trim() || null,
      publicationYear: form.publicationYear ? parseInt(form.publicationYear, 10) : null,
      description: form.description.trim() || null,
      priceTHB: form.priceTHB ? parseFloat(form.priceTHB) : null,
      stockQuantity: parseInt(form.stockQuantity, 10) || 0,
      coverUrl: form.coverUrl.trim() || null,
      language: form.language.trim() || 'th'
    };

    try {
      if (isEdit) {
        await updateBook(id, payload, token);
        navigate('/admin/books');
      } else {
        await createBook(payload, token);
        navigate('/admin/books');
      }
    } catch (err) {
      setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteBook(id, token);
      navigate('/admin/books', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (status === 'loading') return <Loading />;
  if (status === 'error') return <ErrorBox error={loadError} />;

  const label = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{isEdit ? `แก้ไขหนังสือ #${id}` : 'เพิ่มหนังสือใหม่'}</h2>
        <Link to="/admin/books" className="text-sm text-amber-600 hover:underline">กลับรายการ</Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-amber-100 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>ชื่อหนังสือ *</label>
            <input value={form.title} onChange={set('title')} required className={inputClass} />
          </div>
          <div>
            <label className={label}>ผู้แต่ง *</label>
            <input value={form.author} onChange={set('author')} required className={inputClass} />
          </div>
          <div>
            <label className={label}>หมวดหมู่</label>
            <input value={form.category} onChange={set('category')} placeholder="เช่น นวนิยาย, จิตวิทยา" className={inputClass} />
          </div>
          <div>
            <label className={label}>ราคา (บาท)</label>
            <input type="number" step="0.01" value={form.priceTHB} onChange={set('priceTHB')} className={inputClass} />
          </div>
          <div>
            <label className={label}>ปีที่พิมพ์</label>
            <input type="number" value={form.publicationYear} onChange={set('publicationYear')} className={inputClass} />
          </div>
          <div>
            <label className={label}>ISBN</label>
            <input value={form.isbn} onChange={set('isbn')} className={inputClass} />
          </div>
          <div>
            <label className={label}>สำนักพิมพ์</label>
            <input value={form.publisher} onChange={set('publisher')} className={inputClass} />
          </div>
        </div>

        <div>
          <label className={label}>URL รูปปก</label>
          <input value={form.coverUrl} onChange={set('coverUrl')} placeholder="https://..." className={inputClass} />
        </div>

        <div>
          <label className={label}>เรื่องย่อ / รายละเอียด</label>
          <textarea value={form.description} onChange={set('description')} rows={4} className={inputClass} />
        </div>

        {serverError && <p className="text-sm text-red-600">{serverError}</p>}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'กำลังบันทึก...' : isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ'}
          </button>
          {isEdit && (
            <button type="button" onClick={() => setConfirmDelete(true)} className={btnDanger}>
              ลบหนังสือเล่มนี้
            </button>
          )}
        </div>
      </form>

      <ConfirmBox open={confirmDelete} title={`ลบ "${form.title}" ?`} confirmText="ลบถาวร"
                  busy={deleting} onConfirm={handleDelete} onCancel={() => setConfirmDelete(false)}>
        <p>หนังสือเล่มนี้และข้อมูลรีวิวจะถูกลบออกถาวร</p>
      </ConfirmBox>
    </div>
  );
}

export default AdminBookForm;

