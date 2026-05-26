import React, { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu, Modal } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout } = useContext(AuthContext);

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
            label: <Link to={auth?.user?.role === 'ADMIN' ? "/admin" : "/user/profile"}>Profile</Link>,
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
        setCurrent(e.key);
    };

    return <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={items} />;
};

export default Header;