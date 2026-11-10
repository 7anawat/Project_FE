import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/AuthContext';

const OrderContext = createContext(null);
const STORAGE_KEY = 'bookhub_all_orders';

export function OrderProvider({ children }) {
  const { member } = useAuth();

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // บันทึกและกระจาย event เมื่อ orders เปลี่ยนแปลง
  const saveOrders = useCallback((newOrders) => {
    setOrders(newOrders);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders));
      window.dispatchEvent(new Event('bookhub_orders_updated'));
    } catch (e) {
      console.error('Failed to save orders:', e);
    }
  }, []);

  // ซิงก์ orders ข้าม tabs / components
  useEffect(() => {
    function handleSync() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } catch {}
    }
    window.addEventListener('storage', handleSync);
    window.addEventListener('bookhub_orders_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('bookhub_orders_updated', handleSync);
    };
  }, []);

  // สร้างคำสั่งซื้อใหม่ (แนบสลิป)
  function createOrder({ items, totalAmount, slipUrl, slipNote = '', transferBank = 'โอนเงินผ่านธนาคาร' }) {
    if (!member?.id || !items || items.length === 0) {
      throw new Error('ข้อมูลคำสั่งซื้อไม่ครบถ้วน');
    }

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      memberId: member.id,
      memberName: member.displayName || 'สมาชิก',
      memberEmail: member.email || '',
      items: items.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        priceTHB: b.priceTHB,
        coverUrl: b.coverUrl,
        category: b.category,
      })),
      totalAmount: Number(totalAmount) || 0,
      slipUrl: slipUrl || null,
      slipNote: slipNote.trim(),
      transferBank,
      status: 'pending', // 'pending' | 'approved' | 'rejected'
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      reviewedBy: null,
      rejectReason: null,
    };

    const updated = [newOrder, ...orders];
    saveOrders(updated);
    return newOrder;
  }

  // แอดมินอนุมัติการโอนเงิน -> เพิ่มหนังสือเข้าคลังของ Member อัตโนมัติ!
  function approveOrder(orderId, adminName = 'Admin') {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return false;

    // 1. เพิ่มหนังสือเข้าสู่ชั้นหนังสือของ Member คนนั้น
    try {
      const libKey = `bookhub_library_${targetOrder.memberId}`;
      const existingLib = JSON.parse(localStorage.getItem(libKey) || '[]');
      const newLib = [...existingLib];

      targetOrder.items.forEach((item) => {
        if (!newLib.some((b) => b.id === item.id)) {
          newLib.push({
            ...item,
            purchasedAt: new Date().toISOString(),
            orderId: targetOrder.id,
          });
        }
      });

      localStorage.setItem(libKey, JSON.stringify(newLib));
      window.dispatchEvent(new Event('bookhub_library_updated'));
    } catch (e) {
      console.error('Failed to update member library:', e);
    }

    // 2. อัปเดตสถานะของคำสั่งซื้อเป็น approved
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
          }
        : o
    );

    saveOrders(updated);
    return true;
  }

  // แอดมินปฏิเสธคำสั่งซื้อ
  function rejectOrder(orderId, reason = 'ยอดเงินหรือสลิปไม่ถูกต้อง', adminName = 'Admin') {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'rejected',
            rejectReason: reason,
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
          }
        : o
    );

    saveOrders(updated);
    return true;
  }

  // จำนวนคำสั่งซื้อที่รอตรวจสอบ
  const pendingCount = orders.filter((o) => o.status === 'pending').length;

  // รายการคำสั่งซื้อของ member ปัจจุบัน
  const myOrders = member?.id ? orders.filter((o) => o.memberId === member.id) : [];

  const value = {
    orders,
    myOrders,
    pendingCount,
    createOrder,
    approveOrder,
    rejectOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return ctx;
}

