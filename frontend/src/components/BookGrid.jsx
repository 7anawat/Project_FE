import BookCard from './BookCard';

function BookGrid({ books, status, error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse overflow-hidden rounded-2xl border border-[#EDE5D6] bg-white p-3"
          >
            <div className="aspect-[3/4] rounded-xl bg-[#F0E8DC]" />
            <div className="mt-3 space-y-2">
              <div className="h-4 w-4/5 rounded bg-[#F0E8DC]" />
              <div className="h-3 w-3/5 rounded bg-[#F5EFE6]" />
              <div className="h-8 w-full rounded-xl bg-[#F0E8DC] mt-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/50 p-8 text-center">
        <p className="font-semibold text-red-700">โหลดข้อมูลไม่สำเร็จ</p>
        <p className="mt-1 text-xs text-red-500">{error?.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 rounded-full border border-red-300 bg-white px-5 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 shadow-xs"
          >
            ลองใหม่อีกครั้ง
          </button>
        )}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#DDD2C0] bg-white/60 py-16 text-center">
        <p className="text-4xl">📖</p>
        <p className="mt-2 text-sm font-semibold text-[#38332C]">ไม่พบหนังสือที่ค้นหา</p>
        <p className="text-xs text-[#8A8173]">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นดูนะครับ</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {books.map((b) => (
        <BookCard key={b.id} book={b} />
      ))}
    </div>
  );
}

export default BookGrid;
