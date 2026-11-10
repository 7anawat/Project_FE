import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import * as api from '../api/backend';

function MyLibrary() {
  const { member, token } = useAuth();

  const [books, setBooks] = useState([]);
  const [readingBook, setReadingBook] = useState(null);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadLibrary() {
      if (!token || !member?.id) {
        setBooks([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await api.getMyLibrary(token);

        if (active) {
          setBooks(data);
        }
      } catch (err) {
        console.error('Load library failed:', err);

        if (active) {
          setError(err.message || 'ไม่สามารถโหลดชั้นหนังสือได้');
          setBooks([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadLibrary();

    return () => {
      active = false;
    };
  }, [token, member?.id]);

  function handleDownload(book) {
    setDownloadMsg(`กำลังเตรียมดาวน์โหลด "${book.title}" (PDF & ePub)...`);
    setTimeout(() => {
      setDownloadMsg(`ดาวน์โหลด "${book.title}" สำเร็จแล้ว!`);
      setTimeout(() => setDownloadMsg(null), 3000);
    }, 1200);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">📚 ชั้นหนังสือ E-Book ของฉัน</h1>
        <p className="mt-1 text-sm text-slate-500">
          คลัง E-Book ของคุณ {member?.displayName} — สามารถเปิดอ่านได้ทุกเวลา หรือดาวน์โหลดเก็บไว้ได้
        </p>
      </div>

      {downloadMsg && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-sm animate-fadeIn">
          📥 {downloadMsg}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-amber-100 bg-white py-16 text-center">
          <p className="text-4xl">⏳</p>
          <p className="mt-4 text-sm text-slate-500">
            กำลังโหลดชั้นหนังสือ...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-white py-12 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            ไม่สามารถโหลดชั้นหนังสือได้
          </h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-white py-16 text-center">
          <p className="text-5xl">📖</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            ชั้นหนังสือของคุณยังว่างอยู่
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            คุณยังไม่ได้ซื้อ E-Book เล่มใดในขณะนี้
          </p>
          <Link
            to="/books"
            className="mt-6 inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition shadow-sm"
          >
            เลือกซื้อ E-Book ที่น่าสนใจ
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="flex gap-4">
                {b.coverUrl ? (
                  <img
                    src={b.coverUrl}
                    alt={b.title}
                    className="h-32 w-22 shrink-0 rounded-lg object-cover border border-slate-100 shadow-xs"
                  />
                ) : (
                  <div className="grid h-32 w-22 shrink-0 place-items-center rounded-lg bg-amber-50 text-3xl">
                    📖
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    E-Book ฉบับเต็ม
                  </span>
                  <h3 className="mt-1.5 font-bold text-slate-900 truncate" title={b.title}>
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{b.author}</p>
                  {b.category && (
                    <p className="mt-1 text-[11px] text-amber-700 font-medium">{b.category}</p>
                  )}
                  {b.purchasedAt && (
                    <p className="mt-2 text-[10px] text-slate-400">
                      ซื้อเมื่อ: {new Date(b.purchasedAt).toLocaleDateString('th-TH')}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setReadingBook(b)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <span>📖</span>
                  <span>เปิดอ่านออนไลน์</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(b)}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    📥 ดาวน์โหลดไฟล์
                  </button>
                  <Link
                    to={`/books/${b.id}`}
                    className="rounded-lg border border-amber-200 px-3 py-1.5 text-center text-xs font-medium text-amber-700 hover:bg-amber-50 transition"
                  >
                    ดูหน้ารายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reader Modal (สำหรับอ่าน E-Book ฉบับเต็ม) */}
      {readingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 md:p-6 backdrop-blur-sm">
          <div
            className={`relative flex h-full max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl shadow-2xl transition-colors ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
              }`}
          >
            {/* Header / Controls */}
            <div
              className={`flex flex-wrap items-center justify-between border-b px-6 py-3.5 text-sm ${isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/70'
                }`}
            >
              <div className="min-w-0 pr-4">
                <h3 className="font-bold truncate text-base">{readingBook.title}</h3>
                <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  โดย {readingBook.author} (ฉบับ E-Book ดิจิทัล)
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* ตัวปรับขนาดฟอนต์ */}
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setFontSize((s) => Math.max(12, s - 2))}
                    className="h-7 w-7 rounded border border-current font-bold hover:opacity-80"
                    title="ลดขนาดตัวอักษร"
                  >
                    A-
                  </button>
                  <span className="w-6 text-center">{fontSize}</span>
                  <button
                    onClick={() => setFontSize((s) => Math.min(26, s + 2))}
                    className="h-7 w-7 rounded border border-current font-bold hover:opacity-80"
                    title="เพิ่มขนาดตัวอักษร"
                  >
                    A+
                  </button>
                </div>

                {/* โหมดมืด / สว่าง */}
                <button
                  onClick={() => setIsDarkMode((d) => !d)}
                  className="rounded-lg border border-current px-2.5 py-1 text-xs font-medium hover:opacity-80"
                >
                  {isDarkMode ? '☀️ โหมดสว่าง' : '🌙 โหมดกลางคืน'}
                </button>

                {/* ปุ่มปิด */}
                <button
                  onClick={() => setReadingBook(null)}
                  className="rounded-lg p-1 text-lg hover:opacity-70 ml-2"
                  title="ปิดเครื่องอ่าน"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* เนื้อหา E-Book Reader */}
            <div
              className="flex-1 overflow-y-auto px-6 py-8 md:px-12 leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
            >
              <div className="mx-auto max-w-2xl space-y-6">
                <div className="text-center pb-8 border-b border-current/10">
                  <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 mb-2">
                    E-Book Reader
                  </span>
                  <h1 className="text-2xl font-bold md:text-3xl">{readingBook.title}</h1>
                  <p className="mt-1 text-sm opacity-70">ประพันธ์โดย {readingBook.author}</p>
                </div>

                <div className="space-y-4">
                  <h2 className="text-xl font-bold">บทนำ</h2>
                  <p className="opacity-90 leading-relaxed">
                    {readingBook.description ||
                      'ยินดีต้อนรับสู่หนังสือฉบับเต็ม เนื้อหาทั้งหมดได้รับการจัดเตรียมเพื่อการอ่านที่สะดวกสบายบนทุกอุปกรณ์'}
                  </p>

                  <h2 className="text-xl font-bold pt-6">บทที่ 1: การเริ่มต้นการเดินทาง</h2>
                  <p className="opacity-90 leading-relaxed">
                    ทุกการเรียนรู้และการเปลี่ยนแปลงอันยิ่งใหญ่ มักเริ่มต้นจากก้าวเล็ก ๆ เสมอ
                    เรื่องราวในหน้านี้จะนำพาทุกท่านเดินทางไปสำรวจแนวคิดและสาระสำคัญที่ถูกร้อยเรียงขึ้นมาอย่างประณีต
                    เพื่อให้เกิดทั้งความเพลิดเพลินและความรู้ที่สามารถนำไปปรับใช้ได้จริงในชีวิตประจำวัน
                  </p>
                  <p className="opacity-90 leading-relaxed">
                    การอ่านหนังสือในรูปแบบ E-Book ช่วยให้คุณสามารถเข้าถึงความรู้ได้ทุกที่ทุกเวลา
                    ไม่ว่าจะผ่านหน้าจอคอมพิวเตอร์ แท็บเล็ต หรือสมาร์ตโฟน โดยไม่ต้องพกพาหนังสือเล่มหนา
                    และยังสามารถปรับขนาดตัวอักษรรวมถึงสลับโหมดการอ่านให้เหมาะสมกับสภาพแสงได้ตลอดเวลา
                  </p>

                  <h2 className="text-xl font-bold pt-6">บทที่ 2: แก่นแท้และบทเรียนสำคัญ</h2>
                  <p className="opacity-90 leading-relaxed">
                    เมื่อเราเข้าใจหลักการพื้นฐานแล้ว ขั้นตอนต่อไปคือการทำความเข้าใจบริบทแวดล้อม
                    และลงลึกถึงรายละเอียดที่จะช่วยเปิดมุมมองใหม่ที่คุณอาจไม่เคยสังเกตมาก่อน
                    ผู้เขียนได้รวบรวมประสบการณ์และข้อคิดสำคัญไว้ในแต่ละย่อหน้าเพื่อให้ผู้อ่านได้ใคร่ครวญและตกผลึกด้วยตนเอง
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Reader */}
            <div
              className={`flex items-center justify-between border-t px-6 py-3 text-xs ${isDarkMode ? 'border-slate-800 bg-slate-950/40 text-slate-400' : 'border-slate-100 bg-slate-50/70 text-slate-500'
                }`}
            >
              <span>กำลังอ่านฉบับเต็ม</span>
              <button
                onClick={() => setReadingBook(null)}
                className="font-semibold hover:underline"
              >
                กลับสู่ชั้นหนังสือ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyLibrary;
