import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import MyLibrary from './pages/MyLibrary';
import MyOrders from './pages/MyOrders';
import NotFound from './pages/NotFound';
import RequireRole from './components/RequireRole';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookForm from './pages/admin/AdminBookForm';
import AdminMembers from './pages/admin/AdminMembers';
import AdminOrders from './pages/admin/AdminOrders';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<Books />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/me/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
                <Route path="/me/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
                <Route path="/me/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/admin" element={<RequireRole role="admin"><AdminLayout /></RequireRole>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="books" element={<AdminBooks />} />
                  <Route path="books/new" element={<AdminBookForm />} />
                  <Route path="books/:id" element={<AdminBookForm />} />
                  <Route path="members" element={<AdminMembers />} />
                </Route>
                <Route path="/about" element={<About />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

