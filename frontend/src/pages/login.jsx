import React, { useContext, useState } from 'react';
import { Button, Form, Input, Modal, Tabs, notification } from 'antd';
import { forgotPasswordApi, loginApi, resetPasswordApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/context/auth.context';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthPageShell from '../components/auth/AuthPageShell';

const LoginPage = () => {
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [loginForm] = Form.useForm();
    const [forgotForm] = Form.useForm();
    const [resetForm] = Form.useForm();
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);

    const onFinish = async (values) => {
        const { email, password } = values;
        setLoading(true);

        try {
            const res = await loginApi({ email, password });

            if (res?.token && res?.user && res?.status === 200) {
                notification.success({
                    message: "LOGIN USER",
                    description: "Success"
                });
                setAuth({
                    isAuthenticated: true,
                    token: res.token,
                    user: {
                        id: res?.user?.id ?? "",
                        email: res?.user?.email ?? "",
                        role: res?.user?.role ?? "USER",
                        name: res?.user?.name ?? ""
                    }
                })
                navigate('/', { replace: true });

            } else {
                notification.error({
                    message: "LOGIN USER",
                    description: res?.message ?? "error"
                })
            }
        } catch {
            notification.error({
                message: "LOGIN USER",
                description: "Không thể kết nối đến máy chủ"
            });
        } finally {
            setLoading(false);
        }
    };

    const openForgotModal = () => {
        const email = loginForm.getFieldValue('email');
        if (email) {
            forgotForm.setFieldsValue({ email });
            resetForm.setFieldsValue({ email });
        }
        setForgotOpen(true);
    };

    const onRequestOtp = async (values) => {
        setForgotLoading(true);
        try {
            const res = await forgotPasswordApi(values);

            if (res?.status === 200) {
                notification.success({
                    message: 'QUÊN MẬT KHẨU',
                    description: res?.message ?? 'OTP đã được gửi về email.'
                });
            } else {
                notification.error({
                    message: 'QUÊN MẬT KHẨU',
                    description: res?.message ?? 'Không thể gửi OTP.'
                });
            }
        } catch {
            notification.error({
                message: 'QUÊN MẬT KHẨU',
                description: 'Không thể kết nối đến máy chủ'
            });
        } finally {
            setForgotLoading(false);
        }
    };

    const onResetPassword = async (values) => {
        setResetLoading(true);
        try {
            const res = await resetPasswordApi(values);

            if (res?.status === 200) {
                notification.success({
                    message: 'ĐẶT LẠI MẬT KHẨU',
                    description: res?.message ?? 'Đặt lại mật khẩu thành công.'
                });
                setForgotOpen(false);
                resetForm.resetFields(['otp', 'password']);
            } else {
                notification.error({
                    message: 'ĐẶT LẠI MẬT KHẨU',
                    description: res?.message ?? 'Không thể đặt lại mật khẩu.'
                });
            }
        } catch {
            notification.error({
                message: 'ĐẶT LẠI MẬT KHẨU',
                description: 'Không thể kết nối đến máy chủ'
            });
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <AuthPageShell
            eyebrow="Danh's Shop"
            title="Đăng nhập"
            description="Đăng nhập để tiếp tục mua sắm và trải nghiệm những ưu đãi hấp dẫn từ chúng tôi!"
            footer={
                <div className="auth-page__footer">
                    <Link to="/"><ArrowLeftOutlined /> Quay lại trang chủ</Link>
                    <span>
                        Chưa có tài khoản? <Link to="/register">Đăng ký tại đây</Link>
                    </span>
                </div>
            }
        >
            <Form
                name="login-form"
                form={loginForm}
                onFinish={onFinish}
                autoComplete="off"
                layout='vertical'
                requiredMark={false}
            >
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
                    ]}
                >
                    <Input.Password size="large" placeholder="••••••••" />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <Button type="link" onClick={openForgotModal} style={{ padding: 0 }}>
                        Quên mật khẩu?
                    </Button>
                </div>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block size="large">
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>

            <Modal
                open={forgotOpen}
                onCancel={() => setForgotOpen(false)}
                footer={null}
                title="Quên mật khẩu"
                destroyOnClose
            >
                <Tabs
                    defaultActiveKey="request"
                    items={[
                        {
                            key: 'request',
                            label: 'Gửi OTP',
                            children: (
                                <Form
                                    name="forgot-password-form"
                                    form={forgotForm}
                                    onFinish={onRequestOtp}
                                    autoComplete="off"
                                    layout="vertical"
                                    requiredMark={false}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input size="large" placeholder="name@example.com" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={forgotLoading} block>
                                            Gửi OTP
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )
                        },
                        {
                            key: 'reset',
                            label: 'Đặt lại mật khẩu',
                            children: (
                                <Form
                                    name="reset-password-form"
                                    form={resetForm}
                                    onFinish={onResetPassword}
                                    autoComplete="off"
                                    layout="vertical"
                                    requiredMark={false}
                                >
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập email' },
                                            { type: 'email', message: 'Email không hợp lệ' }
                                        ]}
                                    >
                                        <Input size="large" placeholder="name@example.com" />
                                    </Form.Item>

                                    <Form.Item
                                        label="OTP"
                                        name="otp"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập OTP' },
                                            { len: 6, message: 'OTP phải gồm 6 ký tự' }
                                        ]}
                                    >
                                        <Input size="large" placeholder="123456" />
                                    </Form.Item>

                                    <Form.Item
                                        label="Mật khẩu mới"
                                        name="password"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
                                        ]}
                                    >
                                        <Input.Password size="large" placeholder="••••••••" />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={resetLoading} block>
                                            Đặt lại mật khẩu
                                        </Button>
                                    </Form.Item>
                                </Form>
                            )
                        }
                    ]}
                />
            </Modal>
        </AuthPageShell>
    )
}

export default LoginPage;