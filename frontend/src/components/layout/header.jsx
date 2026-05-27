import React, { useContext, useMemo, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Form, Input, Menu, Modal, notification } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { updateProfileApi } from '../../util/api';

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout, setAuth } = useContext(AuthContext);
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileForm] = Form.useForm();

    const handleLogout = () => {
        Modal.confirm({
            title: 'Confirm logout',
            content: 'Are you sure you want to log out? You will be redirected to login.',
            okText: 'Logout',
            cancelText: 'Cancel',
            onOk: () => {
                logout();
                setCurrent('login');
                navigate('/login');
            }
        });
    };

    const items = [
        ...(auth?.user?.role === 'ADMIN' ? [{
            label: <Link to={"/admin"}>Admin Dashboard</Link>,
            key: 'admin-orders',
            icon: <HomeOutlined />,
        }] : [{
            label: <Link to={"/"}>Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        }]),
        ...(!auth.isAuthenticated ? [{
            label: <Link to="/login">Login</Link>,
            key: 'login-page',
            icon: <UsergroupAddOutlined />,
        }] : []),
        ...(auth.isAuthenticated ? [{
            label: <span>Profile</span>,
            key: 'profile',
            icon: <UsergroupAddOutlined />,
        }] : []),
        ...(auth.isAuthenticated && auth?.user?.role === 'USER' ? [{
            label: <Link to="/orders">Orders</Link>,
            key: 'orders',
            icon: <UsergroupAddOutlined />,
        }, {
            label: <Link to="/cart">Cart</Link>,
            key: 'cart',
            icon: <UsergroupAddOutlined />,
        }] : []),

        {
            label: `Welcome ${auth?.user?.email ?? "Guest"}`,
            key: 'SubMenu',
            icon: <SettingOutlined />,
            children: [
                ...(auth.isAuthenticated ? [{
                    label: <span onClick={handleLogout}>Đăng xuất</span>,
                    key: 'logout',
                }] : [
                    {
                        label: <Link to={"/login"}>Đăng nhập</Link>,
                        key: 'login',
                    },
                ]),
            ],
        },
    ];

    const [current, setCurrent] = useState('mail');

    const onClick = (e) => {
        if (e.key === 'profile') {
            profileForm.setFieldsValue({
                name: auth?.user?.name ?? '',
                currentPassword: '',
                newPassword: ''
            });
            setProfileOpen(true);
            return;
        }
        setCurrent(e.key);
    };

    const profileMeta = useMemo(() => ({
        email: auth?.user?.email ?? 'N/A',
        role: auth?.user?.role ?? 'USER'
    }), [auth?.user?.email, auth?.user?.role]);

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

    return (
        <>
            <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />
            <Modal
                open={profileOpen}
                onCancel={() => setProfileOpen(false)}
                footer={null}
                title="Thông tin tài khoản"
                destroyOnClose
            >
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Email</div>
                    <div style={{ fontWeight: 600 }}>{profileMeta.email}</div>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Role</div>
                    <div style={{ fontWeight: 600 }}>{profileMeta.role}</div>
                </div>
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
        </>
    );
};

export default Header;