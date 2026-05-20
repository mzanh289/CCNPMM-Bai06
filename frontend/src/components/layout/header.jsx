import React, { useContext, useState } from 'react';
import { UsergroupAddOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
    const navigate = useNavigate();
    const { auth, logout } = useContext(AuthContext);

    const items = [
        ...(auth?.user?.role === 'ADMIN' ? [{
            label: <Link to={"/admin/profile"}>Order Management</Link>,
            key: 'admin-orders',
            icon: <HomeOutlined />,
        }] : [{
            label: <Link to={"/"}>Home Page</Link>,
            key: 'home',
            icon: <HomeOutlined />,
        }]),
        ...(auth.isAuthenticated ? [{
            label: <Link to={auth?.user?.role === 'ADMIN' ? "/admin/profile" : "/user/profile"}>Profile</Link>,
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
                    label: <span onClick={() => {
                        logout();
                        setCurrent("home");
                        navigate("/");
                    }}>Đăng xuất</span>,
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