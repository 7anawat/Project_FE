import '@testing-library/jest-dom';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import * as backendApi from '../api/backend';

jest.mock('../api/backend', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getMe: jest.fn(),
  updateMyProfile: jest.fn(),
  changeMyPassword: jest.fn(),
}));

function TestAuthConsumer() {
  const { member, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">
        {member ? `Logged in: ${member.displayName} (${member.role})` : 'Guest'}
      </div>
      <button onClick={() => login('member@bookhub.com', 'password123')}>
        LoginBtn
      </button>
      <button onClick={() => logout()}>LogoutBtn</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('เริ่มต้นด้วยสถานะ Guest และสามารถ Login / Logout เปลี่ยนสถานะผู้ใช้ได้จริง', async () => {
    const mockUser = {
      id: 1,
      email: 'member@bookhub.com',
      displayName: 'Siwat',
      role: 'member',
    };

    backendApi.login.mockResolvedValue({
      token: 'fake-jwt-token',
      member: mockUser,
      user: mockUser,
    });
    backendApi.getMe.mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestAuthConsumer />
      </AuthProvider>
    );

    // 1. ตรวจสอบสถานะเริ่มต้น (ยังไม่ล็อกอิน)
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');

    // 2. ทดสอบการ Login
    await act(async () => {
      screen.getByText('LoginBtn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in: Siwat (member)');
    });
    expect(backendApi.login).toHaveBeenCalledWith('member@bookhub.com', 'password123');

    // 3. ทดสอบการ Logout
    await act(async () => {
      screen.getByText('LogoutBtn').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Guest');
    });
  });
});