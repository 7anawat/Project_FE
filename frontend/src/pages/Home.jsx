import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BookGrid from '../components/BookGrid';
import { getBooks } from '../api/backend';
import { useAuth } from '../auth/AuthContext';

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function Home() {
  const { isLoggedIn } = useAuth();
  const [picks, setPicks] = useState([]);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;
    getBooks()
      .then((list) => {
        if (!ignore) {
          setPicks(shuffle(list).slice(0, 8));
          setStatus('success');
        }
      })
      .catch(() => {
        if (!ignore) setStatus('error');
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 space-y-10">
      {/* Hero Banner Section (Matching Prototype Screen 1) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#38332E] via-[#4A433D] to-[#5C534B] text-white shadow-lg">
        {/* Ambient Warm Glow & Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(240,215,175,0.18),transparent_50%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-8 md:p-14">
          {/* Left Text Content */}
          <div className="max-w-xl space-y-4">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-[#EAD8C3] backdrop-blur-xs">
              ✨ คลังหนังสือดิจิทัล E-Book คัดสรร
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#FAF6F0] md:text-5xl leading-tight">
              หนังสือดีๆ <br />
              ที่ทำให้คุณ...<span className="italic text-[#E8D1B5]">ยิ้มได้อีกครั้ง</span>
            </h1>
            <p className="font-serif italic text-sm text-[#D1C4B5] tracking-wide">
              Read More, Live Better.
            </p>
            <p className="text-xs md:text-sm text-[#C8BCAD] leading-relaxed max-w-md">
              รวม E-Book ยอดนิยม ทั้งวรรณกรรม จิตวิทยา การเงิน และพัฒนาตนเอง
              สั่งซื้อง่าย เปิดอ่านได้ทันทีบนทุกอุปกรณ์
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/books"
                className="inline-flex items-center gap-2 rounded-full bg-[#FAF6F0] px-6 py-2.5 text-xs md:text-sm font-bold text-[#2D2A26] shadow-md hover:bg-white transition hover:scale-105"
              >
                <span>ช้อปเลย</span>
                <span>→</span>
              </Link>
              {!isLoggedIn ? (
                <Link
                  to="/register"
                  className="rounded-full border border-white/30 bg-white/5 px-5 py-2.5 text-xs md:text-sm font-medium text-white hover:bg-white/15 transition backdrop-blur-xs"
                >
                  สมัครสมาชิก
                </Link>
              ) : (
                <Link
                  to="/me/library"
                  className="rounded-full border border-[#D5C2A5] bg-[#3B342C] px-5 py-2.5 text-xs md:text-sm font-semibold text-[#F2E8DC] hover:bg-[#484037] transition shadow-xs"
                >
                  📚 ชั้นหนังสือของฉัน
                </Link>
              )}
            </div>
          </div>

          {/* Right Cozy Note / Book Atmosphere Card */}
          <div className="relative shrink-0 flex flex-col items-center">
            {/* Sticky Cozy Note (Aesthetic Polaroid Note from Prototype) */}
            <div className="rotate-2 transform rounded-2xl bg-[#FFFDF9] p-6 text-[#2E2B27] shadow-2xl border border-[#E8DEC9] max-w-xs transition hover:rotate-0 duration-300">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">☕</span>
                <span className="font-serif text-xs font-semibold text-[#7D7364]">
                  Good Books • Good Mood
                </span>
              </div>
              <p className="font-serif italic text-base leading-relaxed text-[#38332C]">
                "อ่านหนังสือ คือการเดินทาง<br />
                ที่ไม่มีวันสิ้นสุด ♡"
              </p>
              <div className="mt-4 pt-3 border-t border-[#F0E6D5] flex items-center justify-between text-[11px] text-[#918574]">
                <span>NangSuKub E-Book</span>
                <span>✦ ✦ ✦</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Books Section (Screen 1 Main Grid) */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#EAE2D2] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base text-amber-700">✦</span>
              <h2 className="text-xl font-bold tracking-tight text-[#2B2825]">หนังสือแนะนำ</h2>
            </div>
            <p className="text-xs text-[#827A6E] mt-0.5">เล่มคัดสรรพิเศษที่คุณต้องหลงรัก</p>
          </div>
          <Link
            to="/books"
            className="text-xs font-semibold text-[#524B42] hover:text-[#2B2825] transition flex items-center gap-1"
          >
            <span>ดูทั้งหมด</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Main Book Grid (3 Cols on Desktop) */}
          <div className="lg:col-span-3">
            <BookGrid books={picks} status={status} />
          </div>

          {/* Promo Card (Right Column from Prototype Screen 1) */}
          <div className="rounded-3xl border border-[#E8DEC9] bg-gradient-to-b from-[#FFFDF9] to-[#F5ECE0] p-6 shadow-sm flex flex-col justify-between text-center min-h-[320px]">
            <div className="space-y-3">
              <span className="inline-block rounded-full bg-[#2D2A26] px-3 py-1 text-[11px] font-bold text-white shadow-2xs">
                PROMOTION
              </span>
              <h3 className="font-serif text-lg font-bold text-[#2D2A26]">
                โปรโมชันพิเศษ<br />ต้อนรับสายอ่าน!
              </h3>
              <div className="my-4 py-4 rounded-2xl bg-white/80 border border-[#E8DFC8]">
                <p className="text-xs text-[#827A6E]">E-Book ทุกหมวด</p>
                <p className="text-3xl font-black text-[#2D2A26]">ลดสูงสุด 15%</p>
              </div>
              <p className="text-xs text-[#7A7165] leading-relaxed">
                อ่านได้ทันทีบนมือถือและแท็บเล็ต ดาวน์โหลดไฟล์ PDF & ePub ได้ตลอดชีพ
              </p>
            </div>

            <Link
              to="/books"
              className="mt-6 w-full rounded-xl bg-[#2D2A26] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#433F3A] transition block"
            >
              ดูเพิ่มเติม →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
