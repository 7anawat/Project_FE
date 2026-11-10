function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 md:px-6">
      <h1 className="text-2xl font-semibold text-slate-900">📚 เกี่ยวกับ NangSuKub</h1>
      <p className="mt-4 text-slate-600 leading-relaxed">
        NangSuKub คือร้านหนังสือ E-Book ออนไลน์ที่รวบรวมหนังสืออิเล็กทรอนิกส์ยอดนิยม
        ทั้งหนังสือภาษาไทยและแปลจากต่างประเทศ ครอบคลุมหลากหลายหมวดหมู่
        ตั้งแต่นิยาย จิตวิทยา การเงิน ไปจนถึงนิยายวิทยาศาสตร์
        สั่งซื้อง่าย มีตัวอย่างให้อ่านฟรี และเปิดอ่านได้ทันทีทุกที่ทุกเวลาบนทุกอุปกรณ์
      </p>
      <div className="mt-8 rounded-xl border border-amber-100 bg-white p-6 space-y-3">
        <h2 className="font-semibold text-slate-900">Stack ที่ใช้</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>🗄️ <strong>Database:</strong> PostgreSQL บน <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-amber-600 underline">Supabase</a></li>
          <li>⚙️ <strong>Backend:</strong> Go (net/http + pgx) บน <a href="https://render.com" target="_blank" rel="noreferrer" className="text-amber-600 underline">Render</a></li>
          <li>🌐 <strong>Frontend:</strong> React + TailwindCSS บน <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-amber-600 underline">Vercel</a></li>
        </ul>
      </div>
      <div className="mt-8 rounded-xl border border-amber-100 bg-white p-6 space-y-3">
        <h2 className="font-semibold text-slate-900">TEAM PROJECT คุกกี้รสมันบด</h2>
        <ul className="space-y-2 text-sm text-slate-600">
          <li> <strong>650710158 </strong> ธนวัฒน์ เพ็ชรป้อม </li>
          <li> <strong>650710236 </strong> ปฐทวงศ์ วงศ์สาลี </li>
          <li> <strong>650710238 </strong> ศิวัช จำรูญศิริรุ่งโรจน์ </li>
        </ul>

      </div>
    </div>
  );
}

export default About;

