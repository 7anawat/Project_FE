import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { render, screen, fireEvent } from '@testing-library/react';
import Profile from './Profile';

// กำหนด TextEncoder / TextDecoder ให้สภาพแวดล้อมของ Jest รู้จัก
Object.assign(global, { TextEncoder, TextDecoder });

const mockUpdateProfile = jest.fn();
const mockChangePassword = jest.fn();

jest.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    member: {
      id: 1,
      email: 'member@bookhub.com',
      displayName: 'Book Lover',
      role: 'member',
    },
    updateProfile: mockUpdateProfile,
    changePassword: mockChangePassword,
  }),
}));

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('แสดงข้อมูลโปรไฟล์ของสมาชิกถูกต้อง', () => {
    render(<Profile />);
    expect(screen.getByText('Book Lover')).toBeInTheDocument();
    expect(screen.getByText('member@bookhub.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Book Lover')).toBeInTheDocument();
  });

  test('แจ้งเตือนเมื่อกรอกรหัสผ่านใหม่และการยืนยันไม่ตรงกัน', () => {
    render(<Profile />);

    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านเดิม'), {
      target: { value: 'oldpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('อย่างน้อย 8 ตัวอักษร'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('กรอกรหัสผ่านใหม่อีกครั้ง'), {
      target: { value: 'mismatch123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'เปลี่ยนรหัสผ่าน' }));

    expect(screen.getByText(/รหัสผ่านใหม่และการยืนยันไม่ตรงกัน/i)).toBeInTheDocument();
    expect(mockChangePassword).not.toHaveBeenCalled();
  });
});