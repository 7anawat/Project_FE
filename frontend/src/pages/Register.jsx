import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Register() {
  const { register, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', displayName: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form.email, form.password, form.displayName);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-2xl border border-[#DFD6C7] bg-[#FAF7F2] px-4 py-2.5 text-xs text-[#2D2A26] placeholder-[#9E9588] focus:border-[#2D2A26] focus:bg-white focus:outline-none transition shadow-2xs';

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <div className="overflow-hidden rounded-3xl border border-[#EDE5D6] bg-white shadow-md grid md:grid-cols-2">
        {/* Left Column: Cozy Promo Quote (Prototype Screen 7) */}
        <div className="relative hidden md:flex flex-col justify-between bg-gradient-to-br from-[#3D3731] to-[#2B2723] p-10 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📖</span>
            <span className="font-serif text-lg font-bold tracking-tight text-[#FAF6F0]">
              NangSuKub
            </span>
          </div>

          <div className="my-auto space-y-4">
            <div className="inline-block rounded-2xl bg-white/10 p-6 backdrop-blur-xs border border-white/10 shadow-lg">
              <span className="text-2xl block mb-2">🎁</span>
              <p className="font-serif italic text-lg leading-relaxed text-[#F5ECE0]">
                "สมัครสมาชิกวันนี้<br />
                รับส่วนลดพิเศษทันที!"
              </p>
              <p className="text-[10px] text-[#C2B5A3] mt-3 uppercase tracking-wider">
                พร้อมเปิดอ่าน E-Book ได้ทุกที่ทุกเวลา
              </p>
            </div>
          </div>

          <p className="text-[11px] text-[#A89C8B]">
            ร่วมเป็นส่วนหนึ่งของคอมมูนิตี้คนรักการอ่าน
          </p>
        </div>

        {/* Right Column: Register Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center md:text-left mb-6">
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#2B2825]">
              สมัครสมาชิก
            </h1>
            <p className="text-xs text-[#827A6E] mt-1">
              มาเป็นครอบครัว NangSuKub กับเรานะ!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#574F44] mb-1">
                ชื่อ-นามสกุล / ชื่อที่แสดง
              </label>
              <input
                type="text"
                placeholder="เช่น สมชาย ใจดี"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#574F44] mb-1">
                อีเมล
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#574F44] mb-1">
                รหัสผ่าน
              </label>
              <input
                type="password"
                placeholder="อย่างน้อย 8 ตัวอักษร"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className={inputClass}
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 p-2.5 text-xs text-red-600 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[#2D2A26] py-3 text-xs md:text-sm font-bold text-white shadow-md hover:bg-[#433F3A] transition disabled:bg-slate-300 active:scale-[0.99] mt-2"
            >
              {loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}
            </button>

            <div className="pt-4 text-center border-t border-[#F0EAE0]">
              <p className="text-xs text-[#7A7165]">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="font-bold text-[#2D2A26] underline hover:text-amber-800">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
