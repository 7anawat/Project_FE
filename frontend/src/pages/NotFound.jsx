import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-6xl">📭</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900">ไม่พบหน้าที่ต้องการ</h1>
      <p className="mt-2 text-slate-500">ลิงก์นี้อาจถูกลบหรือย้ายไปแล้ว</p>
      <Link to="/" className="mt-6 inline-block rounded-lg bg-amber-500 px-6 py-2 text-sm font-medium text-white hover:bg-amber-600">
        กลับหน้าแรก
      </Link>
    </div>
  );
}

export default NotFound;

