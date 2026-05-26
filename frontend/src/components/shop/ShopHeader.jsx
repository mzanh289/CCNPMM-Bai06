import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Modal, notification } from 'antd';
import { AuthContext } from '../context/auth.context';
import { SearchOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import { CartContext } from '../context/cart.context.jsx';
import CartDrawer from './CartDrawer';

const ShopHeader = ({ searchValue = '', onSearchChange }) => {
  const { auth, logout } = useContext(AuthContext);
  const {
    cart,
    itemCount,
    isDrawerOpen,
    openDrawer,
    closeDrawer,
    updateItem,
    removeItem,
    clearCart,
    loading
  } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm logout',
      content: 'Are you sure you want to log out? You will be redirected to login.',
      okText: 'Logout',
      cancelText: 'Cancel',
      onOk: () => {
        logout();
        navigate('/login');
      }
    });
  };

  const handleOpenCart = () => {
    if (!auth?.isAuthenticated) {
      notification.info({ message: 'Cart', description: 'Please login to access your cart.' });
      navigate('/login');
      return;
    }
    openDrawer();
  };

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="section-shell">
        <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white font-bold">Q</div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Quick & Legit</p>
                <h1 className="font-display text-xl text-slate-900">DANH'S SHOP</h1>
              </div>
            </Link>
            <button className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white lg:hidden">
              Menu
            </button>
          </div>

          <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-slate-900">Home</Link>
            <a href="#latest" className="hover:text-slate-900">Latest</a>
            <a href="#best-sellers" className="hover:text-slate-900">Best Sellers</a>
            <a href="#promotions" className="hover:text-slate-900">Promotions</a>
            <a href="#categories" className="hover:text-slate-900">Categories</a>
            {auth?.isAuthenticated && (
              <Link to="/orders" className="hover:text-slate-900">Orders</Link>
            )}
            {auth?.isAuthenticated && auth?.user?.role === 'ADMIN' && (
              <Link to="/admin" className="hover:text-slate-900">Admin</Link>
            )}
          </nav>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4">
            <div className="flex items-center gap-3">
              <button
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${
                  auth?.isAuthenticated ? 'bg-slate-900' : 'bg-slate-400'
                }`}
                onClick={handleOpenCart}
              >
                <ShoppingCartOutlined />
                Cart
                {auth?.isAuthenticated && itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                    {itemCount}
                  </span>
                )}
              </button>
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
                <div className="h-8 w-8 rounded-full bg-slate-900/90 text-xs font-semibold text-white flex items-center justify-center">
                  {auth?.user?.name?.[0]?.toUpperCase() || auth?.user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500">Member</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {auth?.user?.name || auth?.user?.email || 'Guest'}
                  </p>
                </div>
                {auth?.isAuthenticated ? (
                  <button
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                    onClick={handleLogout}
                  >
                    <LogoutOutlined />
                    Logout
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:border-slate-400"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    {auth?.isAuthenticated && (
      <CartDrawer
        open={isDrawerOpen}
        onClose={closeDrawer}
        cart={cart}
        loading={loading}
        onUpdateItem={updateItem}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />
    )}
    </>
  );
};

export default ShopHeader;
