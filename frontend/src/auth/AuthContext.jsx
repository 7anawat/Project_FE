
import { createContext, useContext, useState } from 'react';
import * as api from '../api/backend';

const AuthContext = createContext(null);

const TOKEN_KEY = 'bookhub.token';
const MEMBER_KEY = 'bookhub.member';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(() =>
    JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null')
  );

  function remember({ token, member }) {
    setToken(token);
    setMember(member);
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
  }

  async function login(email, password) {
    const data = await api.login(email, password);
    remember(data);
  }

  async function register(email, password, displayName) {
    await api.register(email, password, displayName);
    await login(email, password);
  }

  // แก้ไขข้อมูลสมาชิก
  async function updateProfile({ email, displayName }) {
    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    const updatedMember = await api.updateMyProfile(
      { email, displayName },
      token
    );

    // อัปเดตข้อมูลสมาชิกใน React
    setMember(updatedMember);

    // บันทึกข้อมูลใหม่ลง Local Storage
    localStorage.setItem(
      MEMBER_KEY,
      JSON.stringify(updatedMember)
    );

    return updatedMember;
  }

  // เปลี่ยนรหัสผ่าน
  async function changePassword(currentPassword, newPassword) {
    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบก่อน');
    }

    return await api.changeMyPassword(
      currentPassword,
      newPassword,
      token
    );
  }

  function logout() {
    setToken(null);
    setMember(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  const isAdmin = member?.role === 'admin';

  const value = {
    token,
    member,
    isLoggedIn: Boolean(token),
    isAdmin,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
