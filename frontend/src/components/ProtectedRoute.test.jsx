import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { useAuth } from '../auth/AuthContext';

jest.mock('../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    Navigate: ({ to }) => <div data-testid="navigate-redirect">Redirected to {to}</div>,
    Outlet: () => <div>Outlet Protected Content</div>,
    useLocation: () => ({ pathname: '/profile' }),
  }),
  { virtual: true }
);

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ผู้ที่ยังไม่ Login ไม่สามารถเข้าหน้า Protected ได้ และถูก Redirect ไปหน้า Login', () => {
    useAuth.mockReturnValue({
      member: null,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoggedIn: false,
      loading: false,
      initializing: false,
    });

    render(
      <ProtectedRoute>
        <div>เนื้อหาเฉพาะสมาชิก</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('เนื้อหาเฉพาะสมาชิก')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate-redirect')).toHaveTextContent(/\/login/i);
  });

  test('ผู้ที่ Login แล้วสามารถเข้าดูเนื้อหาหน้า Protected ได้ปกติ', () => {
    useAuth.mockReturnValue({
      member: { id: 1, email: 'user@bookhub.com', role: 'member' },
      user: { id: 1, email: 'user@bookhub.com', role: 'member' },
      token: 'valid-token',
      isAuthenticated: true,
      isLoggedIn: true,
      loading: false,
      initializing: false,
    });

    render(
      <ProtectedRoute>
        <div>เนื้อหาเฉพาะสมาชิก</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('เนื้อหาเฉพาะสมาชิก')).toBeInTheDocument();
  });
});