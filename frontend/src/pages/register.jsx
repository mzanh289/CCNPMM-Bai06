import React, { useState } from 'react';
import { Button, Form, Input, notification } from 'antd';
import { createUserApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthPageShell from '../components/auth/AuthPageShell';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        const { name, email, password } = values;
        setLoading(true);

        try {
            const res = await createUserApi({ name, email, password });

            if (res?.status === 200) {
                notification.success({
                    message: "CREATE USER",
                    description: res?.message ?? "Success"
                });
                navigate("/login");

            } else {
                notification.error({
                    message: "CREATE USER",
                    description: res?.message ?? "error"
                })
            }
        } catch {
            notification.error({
                message: "CREATE USER",
                description: "Không thể kết nối đến máy chủ"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthPageShell
            eyebrow="Create account"
            title="Đăng ký tài khoản"
            description="Tạo tài khoản bằng email/password. Tài khoản sẽ được kích hoạt qua OTP nếu backend yêu cầu."
            footer={
                <div className="auth-page__footer">
                    <Link to="/"><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                    <span>
                        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                    </span>
                </div>
            }
        >
            <Form
                name="register-form"
                onFinish={onFinish}
                autoComplete="off"
                layout='vertical'
                requiredMark={false}
            >
                <Form.Item
                    label="Name"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập tên hiển thị',
                        },
                    ]}
                >
                    <Input size="large" placeholder="Your name" />
                </Form.Item>

                <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập email',
                        },
                        {
                            type: 'email',
                            message: 'Email không hợp lệ'
                        }
                    ]}
                >
                    <Input size="large" placeholder="name@example.com" />
                </Form.Item>

                <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mật khẩu',
                        },
                        {
                            min: 6,
                            message: 'Mật khẩu phải có ít nhất 6 ký tự'
                        }
                    ]}
                >
                    <Input.Password size="large" placeholder="••••••••" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Tạo tài khoản
                    </Button>
                </Form.Item>
            </Form>
        </AuthPageShell>
    )
}

export default RegisterPage;