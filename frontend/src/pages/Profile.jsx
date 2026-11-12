
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';

function Profile() {
  const { member, updateProfile, changePassword } = useAuth();

  const [profile, setProfile] = useState({
    email: member?.email || '',
    displayName: member?.displayName || '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // อัปเดตข้อมูลในฟอร์มเมื่อข้อมูลสมาชิกเปลี่ยน
  useEffect(() => {
    setProfile({
      email: member?.email || '',
      displayName: member?.displayName || '',
    });
  }, [member?.email, member?.displayName]);

  function handleProfileChange(e) {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  // บันทึกข้อมูลสมาชิก
  async function handleProfileSubmit(e) {
    e.preventDefault();

    setProfileMessage('');
    setProfileError('');

    if (!profile.email.trim() || !profile.displayName.trim()) {
      setProfileError('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    setSavingProfile(true);

    try {
      await updateProfile({
        email: profile.email.trim(),
        displayName: profile.displayName.trim(),
      });

      setProfileMessage('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว');
    } catch (err) {
      setProfileError(err.message || 'ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSavingProfile(false);
    }
  }

  // เปลี่ยนรหัสผ่าน
  async function handlePasswordSubmit(e) {
    e.preventDefault();

    setPasswordMessage('');
    setPasswordError('');

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('กรุณากรอกข้อมูลรหัสผ่านให้ครบ');
      return;
    }

    if (Array.from(newPassword).length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setPasswordError('รหัสผ่านใหม่ต้องไม่เกิน 72 ไบต์');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน');
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม');
      return;
    }

    setSavingPassword(true);

    try {
      await changePassword(currentPassword, newPassword);

      setPasswordMessage('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setPasswordError(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setSavingPassword(false);
    }
  }

  const initial = member?.displayName?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          👤 โปรไฟล์ของฉัน
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          จัดการข้อมูลส่วนตัวและความปลอดภัยของบัญชี BookHub
        </p>
      </div>

      {/* Member information */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
        <div className="bg-gradient-to-r from-amber-50 to-white p-6">
          <div className="flex flex-wrap items-center gap-4">

            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-amber-500 text-2xl font-bold text-white shadow-sm">
              {initial}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-xl font-bold text-slate-900">
                {member?.displayName || 'สมาชิก BookHub'}
              </h2>

              <p className="truncate text-sm text-slate-500">
                {member?.email}
              </p>

              <span className="mt-2 inline-block rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                {member?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
              </span>
            </div>

          </div>
        </div>

        <div className="grid gap-4 border-t border-slate-100 p-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-slate-400">รหัสสมาชิก</p>
            <p className="mt-1 font-semibold text-slate-700">
              #{member?.id ?? '-'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">ประเภทบัญชี</p>
            <p className="mt-1 font-semibold text-slate-700">
              {member?.role === 'admin' ? 'Admin' : 'Member'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <section className="mb-8 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm md:p-7">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            ✏️ แก้ไขข้อมูลส่วนตัว
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            เปลี่ยนชื่อที่แสดงและอีเมลของบัญชี
          </p>
        </div>

        {profileMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            ✓ {profileMessage}
          </div>
        )}

        {profileError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ⚠️ {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ชื่อที่แสดง
            </label>

            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleProfileChange}
              maxLength={50}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              placeholder="กรอกชื่อของคุณ"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              อีเมล
            </label>

            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              maxLength={255}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              placeholder="example@email.com"
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingProfile ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>

        </form>
      </section>

      {/* Change password */}
      <section className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm md:p-7">

        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            🔐 เปลี่ยนรหัสผ่าน
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            กรุณากรอกรหัสผ่านเดิมก่อนตั้งรหัสผ่านใหม่
          </p>
        </div>

        {passwordMessage && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            ✓ {passwordMessage}
          </div>
        )}

        {passwordError && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            ⚠️ {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              รหัสผ่านเดิม
            </label>

            <input
              type="password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              placeholder="กรอกรหัสผ่านเดิม"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              รหัสผ่านใหม่
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />

            <p className="mt-1 text-xs text-slate-400">
              รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              ยืนยันรหัสผ่านใหม่
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              autoComplete="new-password"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            />
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-xl bg-slate-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingPassword ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </div>

        </form>
      </section>

    </div>
  );
}

export default Profile;
