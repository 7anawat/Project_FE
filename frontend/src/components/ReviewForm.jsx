import { useState } from 'react';

function ReviewForm({ bookTitle, onSubmit }) {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | error
  const [error, setError] = useState(null);

  const minLen = 10;
  const remaining = minLen - [...text].length;

  async function handleSubmit(e) {
    e.preventDefault();
    if ([...text.trim()].length < minLen) return;
    setStatus('submitting');
    setError(null);
    try {
      await onSubmit(text.trim());
      setText('');
      setStatus('idle');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="mb-3 font-semibold text-slate-900">เขียนรีวิว: {bookTitle}</h3>
      <textarea
        value={text}
        onChange={e => { setText(e.target.value); setStatus('idle'); }}
        rows={4}
        placeholder="แบ่งปันความคิดเห็นเกี่ยวกับหนังสือเล่มนี้... (ต้องไม่น้อยกว่า 10 ตัวอักษร)"
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs ${remaining > 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
          {remaining > 0 ? `ต้องพิมพ์อีก ${remaining} ตัวอักษร` : '✓ พร้อมส่ง'}
        </span>
        <button
          type="submit"
          disabled={status === 'submitting' || remaining > 0}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:bg-slate-300"
        >
          {status === 'submitting' ? 'กำลังส่ง...' : 'ส่งรีวิว'}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  );
}

export default ReviewForm;

