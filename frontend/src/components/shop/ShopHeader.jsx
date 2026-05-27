import { Link, useNavigate } from 'react-router-dom';
import { useContext, useMemo, useState } from 'react';
import { Button, Dropdown, Form, Input, Modal, notification } from 'antd';
import { AuthContext } from '../context/auth.context';
import { SearchOutlined, ShoppingCartOutlined, LogoutOutlined } from '@ant-design/icons';
import { CartContext } from '../context/cart.context.jsx';
import CartDrawer from './CartDrawer';
import { updateProfileApi } from '../../util/api';

const ShopHeader = ({ searchValue = '', onSearchChange }) => {
  const { auth, logout, setAuth } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm] = Form.useForm();
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

  const handleProfileOpen = () => {
    profileForm.setFieldsValue({
      name: auth?.user?.name ?? '',
      currentPassword: '',
      newPassword: ''
    });
    setProfileOpen(true);
  };

  const handleProfileUpdate = async (values) => {
    const payload = {};
    const trimmedName = values.name?.trim();

    if (trimmedName) {
      payload.name = trimmedName;
    }

    if (values.newPassword) {
      payload.currentPassword = values.currentPassword;
      payload.newPassword = values.newPassword;
    }

    setProfileLoading(true);
    try {
      const res = await updateProfileApi(payload);
      if (res?.user) {
        notification.success({
          message: 'Profile',
          description: res?.message ?? 'Cập nhật profile thành công.'
        });
        setAuth((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            ...res.user
          }
        }));
        setProfileOpen(false);
      } else {
        notification.error({
          message: 'Profile',
          description: res?.message ?? 'Không thể cập nhật profile.'
        });
      }
    } catch {
      notification.error({
        message: 'Profile',
        description: 'Không thể kết nối đến máy chủ'
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const profileMeta = useMemo(() => ({
    email: auth?.user?.email ?? 'N/A',
    role: auth?.user?.role ?? 'USER'
  }), [auth?.user?.email, auth?.user?.role]);

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
                <h1 className="font-display text-xl text-slate-900">DANH'S GROCERY STORE</h1>
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
              {auth?.isAuthenticated ? (
                <Dropdown
                  trigger={['click']}
                  dropdownRender={() => (
                    <div className="w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-900/90 text-sm font-semibold text-white flex items-center justify-center">
                          {auth?.user?.name?.[0]?.toUpperCase() || auth?.user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Member</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {auth?.user?.name || auth?.user?.email || 'Guest'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-1 text-sm text-slate-600">
                        <p><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</span><br />{profileMeta.email}</p>
                        <p><span className="text-xs uppercase tracking-[0.2em] text-slate-400">Role</span><br />{profileMeta.role}</p>
                      </div>
                      <div className="mt-4 flex flex-col gap-2">
                        <Button type="primary" onClick={handleProfileOpen}>
                          Profile
                        </Button>
                        <button
                          className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400"
                          onClick={handleLogout}
                        >
                          <LogoutOutlined />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                >
                  <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2">
                    <div className="h-8 w-8 rounded-full bg-slate-900/90 text-xs font-semibold text-white flex items-center justify-center">
                      {auth?.user?.name?.[0]?.toUpperCase() || auth?.user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-slate-500">Member</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {auth?.user?.name || auth?.user?.email || 'Guest'}
                      </p>
                    </div>
                  </button>
                </Dropdown>
              ) : (
                <button
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
    <Modal
      open={profileOpen}
      onCancel={() => setProfileOpen(false)}
      footer={null}
      title="Thông tin tài khoản"
      destroyOnClose
    >
      <Form
        form={profileForm}
        layout="vertical"
        onFinish={handleProfileUpdate}
        requiredMark={false}
      >
        <Form.Item
          label="Tên hiển thị"
          name="name"
        >
          <Input size="large" placeholder="Nhập tên hiển thị" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu hiện tại"
          name="currentPassword"
          dependencies={['newPassword']}
          rules={[
            ({ getFieldValue }) => ({
              validator: (_, value) => {
                if (getFieldValue('newPassword') && !value) {
                  return Promise.reject(new Error('Vui lòng nhập mật khẩu hiện tại'));
                }
                return Promise.resolve();
              }
            })
          ]}
        >
          <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
          ]}
        >
          <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={profileLoading} block>
            Cập nhật profile
          </Button>
        </Form.Item>
      </Form>
    </Modal>
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
