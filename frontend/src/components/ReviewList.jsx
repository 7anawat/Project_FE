const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', {
  day: 'numeric', month: 'short', year: 'numeric',
});

function ReviewList({ items }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">ยังไม่มีรีวิว เป็นคนแรกที่รีวิวหนังสือเล่มนี้ได้เลย</p>;
  }
  return (
    <ul className="divide-y divide-slate-100">
      {items.map(r => (
        <li key={r.id} className="py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-900 text-sm">{r.member.displayName}</span>
            <span className="text-xs text-slate-400">{dateTH(r.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">{r.text}</p>
        </li>
      ))}
    </ul>
  );
}

export default ReviewList;

