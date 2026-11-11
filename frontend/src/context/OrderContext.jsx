
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';

import { useAuth } from '../auth/AuthContext';
import * as api from '../api/backend';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const { member, token, isAdmin } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดคำสั่งซื้อจาก Backend
  const refreshOrders = useCallback(async () => {
    if (!token || !member?.id) {
      setOrders([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const data = isAdmin
        ? await api.getAdminOrders(token)
        : await api.getMyOrders(token);

      setOrders(data);
      return data;
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดคำสั่งซื้อได้');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token, member?.id, isAdmin]);

  // โหลดข้อมูลเมื่อเข้าสู่ระบบ หรือเปลี่ยนบัญชี
  useEffect(() => {
    if (!token || !member?.id) {
      setOrders([]);
      return;
    }

    refreshOrders().catch((err) => {
      console.error('Load orders failed:', err);
    });
  }, [refreshOrders, token, member?.id]);
  // โหลดคำสั่งซื้อซ้ำทุก 10 วินาที เพื่อให้ Admin เห็นข้อมูลล่าสุด
  useEffect(() => {
    if (!token || !member?.id || !isAdmin) {
      return;
    }

    const interval = setInterval(() => {
      refreshOrders().catch((err) => {
        console.error('Auto refresh orders failed:', err);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [token, member?.id, isAdmin, refreshOrders]);

  // สมาชิกสร้างคำสั่งซื้อ
  const createOrder = useCallback(async ({
    items,
    slipFile,
    slipNote = '',
    transferBank = '',
  }) => {
    if (!token || !member?.id) {
      throw new Error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
    }

    if (!items?.length || !slipFile) {
      throw new Error('กรุณาตรวจสอบรายการหนังสือและแนบสลิป');
    }

    const order = await api.createOrder({
      items,
      slipFile,
      slipNote,
      transferBank,
    }, token);

    await refreshOrders();

    return order;
  }, [token, member?.id, refreshOrders]);

  // Admin อนุมัติคำสั่งซื้อ
  const approveOrder = useCallback(async (orderId) => {
    if (!token || !isAdmin) {
      throw new Error('คุณไม่มีสิทธิ์อนุมัติคำสั่งซื้อ');
    }

    try {
      await api.approveOrder(orderId, token);
      await refreshOrders();
      return true;
    } catch (err) {
      // หากมี Admin คนอื่นดำเนินการไปแล้ว ให้โหลดสถานะล่าสุด
      if (err.status === 409) {
        await refreshOrders().catch(() => { });
      }
      throw err;
    }
  }, [token, isAdmin, refreshOrders]);

  // Admin ปฏิเสธคำสั่งซื้อ
  const rejectOrder = useCallback(async (orderId, reason) => {
    if (!token || !isAdmin) {
      throw new Error('คุณไม่มีสิทธิ์ปฏิเสธคำสั่งซื้อ');
    }

    try {
      await api.rejectOrder(orderId, reason, token);
      await refreshOrders();
      return true;
    } catch (err) {
      if (err.status === 409) {
        await refreshOrders().catch(() => { });
      }
      throw err;
    }
  }, [token, isAdmin, refreshOrders]);

  // คำสั่งซื้อของสมาชิกปัจจุบัน
  const myOrders = isAdmin
    ? []
    : orders.filter((order) => Number(order.memberId) === Number(member?.id));

  // จำนวนคำสั่งซื้อที่รอตรวจสอบ
  const pendingCount = orders.filter(
    (order) => order.status === 'pending'
  ).length;

  const value = {
    orders,
    myOrders,
    pendingCount,
    loading,
    error,
    refreshOrders,
    createOrder,
    approveOrder,
    rejectOrder,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);

  if (!ctx) {
    throw new Error('useOrders must be used within an OrderProvider');
  }

  return ctx;
}
