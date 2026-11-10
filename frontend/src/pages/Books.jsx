import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getBooks } from '../api/backend';

// แมปไอคอนหมวดหมู่ให้เข้ากับสไตล์ใน prototype
const categoryIcons = {
  all: '🏷️',
  'นวนิยาย': '📖',
  'นวนิยายไทย': '📖',
  'นวนิยายแปล': '📖',
  'นวนิยายแฟนตาซี': '✨',
  'นวนิยายสยองขวัญ': '🕯️',
  'จิตวิทยาและพัฒนาตนเอง': '💡',
  'จิตวิทยา': '🧠',
  'จิตวิทยาและความสัมพันธ์': '❤️',
  'จิตวิทยาและการสื่อสาร': '💬',
  'จิตวิทยาและการใช้ชีวิต': '🌿',
  'การเงินและการลงทุน': '📈',
  'ธุรกิจและการเงิน': '💼',
  'ประวัติศาสตร์': '📜',
  'ประวัติศาสตร์ไทย': '🏛️',
  'วิทยาศาสตร์และเยาวชน': '🔬',
  'เทคโนโลยีและการเขียนโปรแกรม': '💻',
};

function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular'); // 'popular' | 'price-asc' | 'price-desc' | 'title'

  const [books, setBooks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getBooks();
        if (!ignore) {
          setBooks(list);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  // หมวดหมู่ทั้งหมดที่มีอยู่จริง
  const categories = [...new Set(books.map((b) => b.category).filter(Boolean))].sort();

  const q = query.trim().toLowerCase();
  let shown = books.filter(
    (b) =>
      (category === 'all' || b.category === category) &&
      (q === '' || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
  );

  // การจัดเรียง
  if (sortBy === 'price-asc') {
    shown = [...shown].sort((a, b) => (a.priceTHB || 0) - (b.priceTHB || 0));
  } else if (sortBy === 'price-desc') {
    shown = [...shown].sort((a, b) => (b.priceTHB || 0) - (a.priceTHB || 0));
  } else if (sortBy === 'title') {
    shown = [...shown].sort((a, b) => a.title.localeCompare(b.title, 'th'));
  }

  function handleCategorySelect(cat) {
    setCategory(cat);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="grid gap-8 lg:grid-cols-4">
        {/* Left Sidebar: หมวดหมู่ (Matching Prototype Screen 2) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 rounded-3xl border border-[#EDE5D6] bg-white p-5 shadow-xs">
            <h2 className="font-serif text-base font-bold text-[#2B2825] mb-4 pb-3 border-b border-[#F0EAE0]">
              หมวดหมู่หนังสือ
            </h2>

            <nav className="space-y-1">
              {/* ปุ่มทั้งหมด */}
              <button
                onClick={() => handleCategorySelect('all')}
                className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  category === 'all'
                    ? 'bg-[#2D2A26] text-white shadow-xs font-semibold'
                    : 'text-[#5C564E] hover:bg-[#F6F1E8] hover:text-[#2D2A26]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>🏠</span>
                  <span>ทั้งหมด</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${category === 'all' ? 'bg-white/20 text-white' : 'bg-[#F2ECE1] text-[#7A7165]'}`}>
                  {books.length}
                </span>
              </button>

              {/* รายการหมวดหมู่แต่ละประเภท */}
              {categories.map((c) => {
                const count = books.filter((b) => b.category === c).length;
                const icon = categoryIcons[c] || '📖';
                const isActive = category === c;

                return (
                  <button
                    key={c}
                    onClick={() => handleCategorySelect(c)}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-[#2D2A26] text-white shadow-xs font-semibold'
                        : 'text-[#5C564E] hover:bg-[#F6F1E8] hover:text-[#2D2A26]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span>{icon}</span>
                      <span className="truncate">{c}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-[#F2ECE1] text-[#7A7165]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Right Main Content: Header, Search, Sort & Grid */}
        <main className="lg:col-span-3 space-y-6">
          {/* Top Bar with Title, Search and Sort Dropdown */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#EAE3D5] pb-4">
            <div>
              <h1 className="font-serif text-2xl font-bold text-[#2B2825]">
                {category === 'all' ? 'หมวดหมู่ทั้งหมด' : category}
              </h1>
              <p className="text-xs text-[#827A6E] mt-0.5">
                พบ {shown.length} รายการจากคลังหนังสือทั้งหมด
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* ช่องค้นหา */}
              <div className="relative">
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setSearchParams(e.target.value ? { q: e.target.value } : {});
                  }}
                  placeholder="ค้นหาชื่อเรื่อง หรือผู้แต่ง..."
                  className="w-full sm:w-56 rounded-full border border-[#DFD6C7] bg-white px-3.5 py-1.5 pl-8 text-xs text-[#2D2A26] placeholder-[#9E9588] focus:border-[#2D2A26] focus:outline-none transition shadow-2xs"
                />
                <span className="absolute left-2.5 top-2 text-xs text-[#9E9588]">🔍</span>
              </div>

              {/* เรียงตาม Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-[#524B42]">
                <span className="hidden sm:inline">เรียงตาม:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-full border border-[#DFD6C7] bg-white px-3 py-1.5 text-xs font-semibold text-[#2D2A26] focus:border-[#2D2A26] focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="popular">ยอดนิยม</option>
                  <option value="price-asc">ราคา: ต่ำ - สูง</option>
                  <option value="price-desc">ราคา: สูง - ต่ำ</option>
                  <option value="title">ชื่อหนังสือ (ก-ฮ)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          <BookGrid
            books={shown}
            status={status}
            error={error}
            onRetry={() => setReloadKey((k) => k + 1)}
          />
        </main>
      </div>
    </div>
  );
}

export default Books;
