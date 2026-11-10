import { createContext, useContext, useState } from 'react';
import * as api from '../api/backend';

const AuthContext = createContext(null);

const TOKEN_KEY = 'bookhub.token';
const MEMBER_KEY = 'bookhub.member';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [member, setMember] = useState(() => JSON.parse(localStorage.getItem(MEMBER_KEY) || 'null'));

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

  function logout() {
    setToken(null);
    setMember(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
  }

  const isAdmin = member?.role === 'admin';
  const value = { token, member, isLoggedIn: Boolean(token), isAdmin, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

