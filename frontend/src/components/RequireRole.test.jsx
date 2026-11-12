import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import RequireRole from './RequireRole';
import { useAuth } from '../auth/AuthContext';

jest.mock('../auth/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock(
  'react-router-dom',
  () => ({
    Navigate: ({ to }) => <div data-testid="role-redirect">Redirected to {to}</div>,
    Outlet: () => <div data-testid="admin-outlet">หน้าจัดการระบบ Admin</div>,
    useLocation: () => ({ pathname: '/admin' }),
  }),
  { virtual: true }
);

describe('RequireRole Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Member ไม่สามารถเข้าหน้า Admin ได้', () => {
    useAuth.mockReturnValue({
      member: { id: 2, email: 'member@bookhub.com', role: 'member' },
      user: { id: 2, email: 'member@bookhub.com', role: 'member' },
      role: 'member',
      isAdmin: false,
      isAuthenticated: true,
      isLoggedIn: true,
      token: 'member-token',
      loading: false,
      initializing: false,
    });

    render(
      <RequireRole role="admin" allowedRoles={['admin']} roles={['admin']}>
        <div>หน้าจัดการระบบ Admin</div>
      </RequireRole>
    );

    expect(screen.queryByText('หน้าจัดการระบบ Admin')).not.toBeInTheDocument();
  });

  test('Admin สามารถเข้าหน้า Admin ได้ปกติ', () => {
    useAuth.mockReturnValue({
      member: { id: 1, email: 'admin@bookhub.com', role: 'admin', isAdmin: true },
      user: { id: 1, email: 'admin@bookhub.com', role: 'admin', isAdmin: true },
      role: 'admin',
      isAdmin: true,
      isAuthenticated: true,
      isLoggedIn: true,
       hasRole: () => true,
      token: 'admin-token',
      loading: false,
      initializing: false,
    });

    render(
      <RequireRole role="admin" allowedRoles={['admin']} roles={['admin']}>
        <div>หน้าจัดการระบบ Admin</div>
      </RequireRole>
    );

    // ต้องไม่ถูก Redirect หนี และแสดงเนื้อหาหน้า Admin ได้
    expect(screen.queryByTestId('role-redirect')).not.toBeInTheDocument();
    expect(screen.getByText('หน้าจัดการระบบ Admin')).toBeInTheDocument();
  });
});