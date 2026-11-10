import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { member, isLoggedIn } = useAuth();
  const storageKey = member?.id ? `bookhub_cart_${member.id}` : 'bookhub_cart_guest';

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // อัปเดตตะกร้าเมื่อเปลี่ยน user
  useEffect(() => {
    if (!isLoggedIn || !member?.id) {
      setItems([]);
      return;
    }
    try {
      const saved = localStorage.getItem(`bookhub_cart_${member.id}`);
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  }, [member?.id, isLoggedIn]);

  // บันทึกลง localStorage เมื่อ items เปลี่ยน
  useEffect(() => {
    if (isLoggedIn && member?.id) {
      localStorage.setItem(`bookhub_cart_${member.id}`, JSON.stringify(items));
    }
  }, [items, member?.id, isLoggedIn]);

  function addToCart(book) {
    if (!book || !book.id) return false;
    let added = false;
    setItems((prev) => {
      if (prev.some((item) => item.id === book.id)) {
        return prev;
      }
      added = true;
      return [
        ...prev,
        {
          id: book.id,
          title: book.title,
          author: book.author,
          category: book.category,
          priceTHB: book.priceTHB ?? 0,
          coverUrl: book.coverUrl,
        },
      ];
    });
    return added;
  }

  function removeFromCart(bookId) {
    setItems((prev) => prev.filter((item) => item.id !== bookId));
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(bookId) {
    return items.some((item) => item.id === bookId);
  }

  const totalPrice = items.reduce((sum, item) => sum + (Number(item.priceTHB) || 0), 0);
  const totalCount = items.length;

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    totalPrice,
    totalCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
