import React, { useState } from 'react';
import { Button, Form, Input, Modal, notification } from 'antd';
import { createUserApi, resendOtpApi, verifyOtpApi } from '../util/api';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import AuthPageShell from '../components/auth/AuthPageShell';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [otpOpen, setOtpOpen] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpResendLoading, setOtpResendLoading] = useState(false);
    const [registerForm] = Form.useForm();
    const [otpForm] = Form.useForm();

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
                otpForm.setFieldsValue({ email });
                setOtpOpen(true);

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

    const handleVerifyOtp = async (values) => {
        setOtpLoading(true);
        try {
            const res = await verifyOtpApi(values);
            if (res?.status === 200) {
                notification.success({
                    message: 'VERIFY OTP',
                    description: res?.message ?? 'Xác thực OTP thành công.'
                });
                setOtpOpen(false);
                navigate('/login');
            } else {
                notification.error({
                    message: 'VERIFY OTP',
                    description: res?.message ?? 'Xác thực OTP thất bại.'
                });
            }
        } catch {
            notification.error({
                message: 'VERIFY OTP',
                description: 'Không thể kết nối đến máy chủ'
            });
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const email = otpForm.getFieldValue('email');
        if (!email) {
            notification.warning({
                message: 'VERIFY OTP',
                description: 'Vui lòng nhập email để gửi lại OTP.'
            });
            return;
        }

        setOtpResendLoading(true);
        try {
            const res = await resendOtpApi({ email });
            if (res?.status === 200) {
                notification.success({
                    message: 'RESEND OTP',
                    description: res?.message ?? 'OTP đã được gửi lại.'
                });
            } else {
                notification.error({
                    message: 'RESEND OTP',
                    description: res?.message ?? 'Không thể gửi lại OTP.'
                });
            }
        } catch {
            notification.error({
                message: 'RESEND OTP',
                description: 'Không thể kết nối đến máy chủ'
            });
        } finally {
            setOtpResendLoading(false);
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
                form={registerForm}
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

            <Modal
                open={otpOpen}
                onCancel={() => setOtpOpen(false)}
                footer={null}
                title="Xác thực OTP"
                destroyOnClose
            >
                <Form
                    name="verify-otp-form"
                    form={otpForm}
                    onFinish={handleVerifyOtp}
                    autoComplete="off"
                    layout='vertical'
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

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={otpLoading} block size="large">
                            Xác thực
                        </Button>
                    </Form.Item>

                    <Form.Item>
                        <Button type="default" onClick={handleResendOtp} loading={otpResendLoading} block size="large">
                            Gửi lại OTP
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </AuthPageShell>
    )
}

export default RegisterPage;