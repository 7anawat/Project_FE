import { findMockBook, getMockBooks } from '../data/mockBooks';

// API layer: คุยกับ BookHub Backend (Go บน Render)
// ตั้ง REACT_APP_API_URL=https://your-backend.onrender.com ใน .env และบน Vercel

const BASE = process.env.REACT_APP_API_URL || '';

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json()
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON' }));
  if (!res.ok) {
    const err = new Error(
      data.error?.message ??
      data.error ??
      `server ตอบกลับ ${res.status}`
    );
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- Auth ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- หนังสือ ----------
export async function getBooks(q = '', category = '') {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (category) params.set('category', category);

  try {
    const data = await apiFetch(`/api/books?${params}`);
    // ถ้า Backend ใช้งานได้แต่ฐานข้อมูลยังไม่มีหนังสือ ให้แสดงข้อมูลตัวอย่างแทน
    if (Array.isArray(data.items) && data.items.length > 0) return data.items;
  } catch (error) {
    // ถ้ายังไม่ได้เปิด Backend/Database ให้ใช้ข้อมูลจำลองเพื่อดูหน้าบ้านได้
    console.info('ใช้ข้อมูลหนังสือตัวอย่าง (Mock Data):', error.message);
  }
  return getMockBooks(q, category);
}
export async function getBook(bookId) {
  try {
    return await apiFetch(`/api/books/${bookId}`);
  } catch (error) {
    // รองรับการกดเข้าไปดูรายละเอียดหนังสือตัวอย่างขณะ Offline
    const mockBook = findMockBook(bookId);
    if (mockBook) return mockBook;
    throw error;
  }
}
export async function getCategories() {
  const data = await apiFetch('/api/categories');
  return data.items;
}

// ---------- รีวิว ----------
export function getReviews(bookId) {
  return apiFetch(`/api/books/${bookId}/reviews`);
}
export function postReview(bookId, text, token) {
  return apiFetch(`/api/books/${bookId}/reviews`, { method: 'POST', body: { text }, token });
}
export function deleteReview(reviewId, token) {
  return apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE', token });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });
}
export function addToWishlist(bookId, token) {
  return apiFetch(`/api/me/wishlist/${bookId}`, { method: 'PUT', token });
}
export function removeFromWishlist(bookId, token) {
  return apiFetch(`/api/me/wishlist/${bookId}`, { method: 'DELETE', token });
}

// ---------- Admin ----------
export function getAdminStats(token) {
  return apiFetch('/api/admin/stats', { token });
}
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.items;
}
export function setMemberRole(memberId, role, token) {
  return apiFetch(`/api/admin/members/${memberId}/role`, { method: 'PUT', body: { role }, token });
}
export function getAdminBook(bookId, token) {
  return apiFetch(`/api/admin/books/${bookId}`, { token });
}
export function createBook(fields, token) {
  return apiFetch('/api/admin/books', { method: 'POST', body: fields, token });
}
export function updateBook(bookId, fields, token) {
  return apiFetch(`/api/admin/books/${bookId}`, { method: 'PUT', body: fields, token });
}
export function deleteBook(bookId, token) {
  return apiFetch(`/api/admin/books/${bookId}`, { method: 'DELETE', token });
}
// ---------- Upload API (Multipart Form Data) ----------
export async function apiUpload(path, formData, token) {
  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(BASE + path, {
    method: 'POST',
    headers,
    body: formData,
  });

  const data = await res.json()
    .catch(() => ({ error: 'server ไม่ได้ตอบเป็น JSON' }));

  if (!res.ok) {
    const err = new Error(
      data.error?.message ??
      data.error ??
      `server ตอบกลับ ${res.status}`
    );
    err.status = res.status;
    throw err;
  }

  return data;
}
// ---------- Orders ----------
export async function createOrder({ items, slipFile, slipNote, transferBank }, token) {
  const formData = new FormData();

  const bookIds = items.map((item) => Number(item.id));

  if (bookIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new Error('รหัสหนังสือไม่ถูกต้อง กรุณาตรวจสอบรายการในตะกร้า');
  }

  formData.append('bookIds', JSON.stringify(bookIds));
  formData.append('slip', slipFile);
  formData.append('slipNote', slipNote || '');
  formData.append('transferBank', transferBank || '');

  const data = await apiUpload('/api/me/orders', formData, token);
  return data.order;
}

export async function getMyOrders(token) {
  const data = await apiFetch('/api/me/orders', { token });
  return data.items || [];
}

export async function getAdminOrders(token) {
  const data = await apiFetch('/api/admin/orders', { token });
  return data.items || [];
}

export function approveOrder(orderId, token) {
  return apiFetch(`/api/admin/orders/${orderId}/approve`, {
    method: 'POST',
    token,
  });
}

export function rejectOrder(orderId, reason, token) {
  return apiFetch(`/api/admin/orders/${orderId}/reject`, {
    method: 'POST',
    body: { reason },
    token,
  });
}

export async function getMyLibrary(token) {
  const data = await apiFetch('/api/me/library', { token });
  return data.items || [];
}