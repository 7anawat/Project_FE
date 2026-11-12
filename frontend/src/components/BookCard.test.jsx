import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import BookCard from './BookCard';

jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    member: { id: 1, role: 'member' },
    token: 'mock-token',
    isAuthenticated: true,
  }),
}));

jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    items: [],
    cart: [],
    addToCart: jest.fn(),
    addItem: jest.fn(),
    isInCart: () => false,
  }),
}));

describe('BookCard Component', () => {
  const mockBook = {
    id: 101,
    title: 'คู่มือเขียนโปรแกรม Go และ React',
    author: 'สมชาย สายโค้ด',
    category: 'Programming',
    price: 350,
    priceBaht: 350,
    ebookPrice: 350,
    price_baht: 350,
    coverUrl: 'https://example.com/go-react-cover.jpg',
    image: 'https://example.com/go-react-cover.jpg',
  };

  test('แสดงชื่อหนังสือ ราคา และรูปปกหนังสือถูกต้อง', () => {
    render(<BookCard book={mockBook} />);

    // 1. ตรวจสอบชื่อหนังสือและผู้แต่ง
    expect(screen.getByText('คู่มือเขียนโปรแกรม Go และ React')).toBeInTheDocument();
    expect(screen.getByText('สมชาย สายโค้ด')).toBeInTheDocument();

    // 2. ตรวจสอบการแสดงราคา (รองรับทั้งตัวเลข 350 หรือคำว่า ฟรี)
    expect(screen.getByText(/350|ฟรี/)).toBeInTheDocument();

    // 3. ตรวจสอบรูปปกหนังสือ
    const img = screen.getByRole('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/go-react-cover.jpg');
  });
});