const authService = require('../services/authService');

const logControllerError = (operation, error) => {
    console.error(`[authController:${operation}]`, {
        message: error.message,
        stack: error.stack
    });
};

const register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const result = await authService.register(email, password, name);

        return res.status(200).json({
            message: result?.delivery?.fallback
                ? 'Đăng ký thành công. SMTP không khả dụng, OTP đã được in ra terminal.'
                : 'Đăng ký thành công. Vui lòng kiểm tra email để lấy OTP.',
            delivery: result?.delivery ?? { sent: false, fallback: true }
        });
    } catch (error) {
        if (error.message === 'EMAIL_EXISTS') {
            return res.status(409).json({ message: "Email đã tồn tại trong hệ thống." });
        }

        logControllerError('register', error);
        return res.status(500).json({
            message: `Register failed: ${error.message}`,
            operation: 'register',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);

        return res.status(200).json({
            message: 'Đăng nhập thành công.',
            token: result.token,
            user: result.user,
            url: result.redirectUrl
        });
    } catch (error) {
        if (error.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }

        if (error.message === 'ACCOUNT_INACTIVE') {
            return res.status(403).json({ message: 'Tài khoản chưa được kích hoạt.' });
        }

        logControllerError('login', error);
        return res.status(500).json({
            message: `Login failed: ${error.message}`,
            operation: 'login',
            error: error.message
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        await authService.verifyOtp(email, otp);
        return res.status(200).json({ message: "Xác thực thành công. Tài khoản đã được kích hoạt." });
    } catch (error) {
        if (error.message === 'OTP_INVALID') return res.status(400).json({ message: "Mã OTP không chính xác." });
        if (error.message === 'OTP_EXPIRED') return res.status(400).json({ message: "Mã OTP đã hết hạn." });
        logControllerError('verifyOtp', error);
        return res.status(500).json({
            message: `OTP verification failed: ${error.message}`,
            operation: 'verifyOtp',
            error: error.message
        });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.resendRegisterOtp(email);

        return res.status(200).json({
            message: result?.delivery?.fallback
                ? 'Gửi lại OTP thành công. SMTP không khả dụng, OTP đã được in ra terminal.'
                : 'Gửi lại OTP thành công. Vui lòng kiểm tra email để lấy OTP.',
            delivery: result?.delivery ?? { sent: false, fallback: true }
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
        }
        if (error.message === 'ACCOUNT_ACTIVE') {
            return res.status(409).json({ message: 'Tài khoản đã được kích hoạt.' });
        }

        logControllerError('resendOtp', error);
        return res.status(500).json({
            message: `Resend OTP failed: ${error.message}`,
            operation: 'resendOtp',
            error: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const result = await authService.requestPasswordReset(email);

        return res.status(200).json({
            message: result?.delivery?.fallback
                ? 'Yêu cầu đặt lại mật khẩu thành công. SMTP không khả dụng, OTP đã được in ra terminal.'
                : 'Yêu cầu đặt lại mật khẩu thành công. Vui lòng kiểm tra email để lấy OTP.',
            delivery: result?.delivery ?? { sent: false, fallback: true }
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
        }

        logControllerError('forgotPassword', error);
        return res.status(500).json({
            message: `Forgot password failed: ${error.message}`,
            operation: 'forgotPassword',
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;
        await authService.resetPassword(email, otp, password);

        return res.status(200).json({ message: 'Đặt lại mật khẩu thành công.' });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Email không tồn tại trong hệ thống.' });
        }
        if (error.message === 'OTP_INVALID') {
            return res.status(400).json({ message: 'Mã OTP không chính xác.' });
        }
        if (error.message === 'OTP_EXPIRED') {
            return res.status(400).json({ message: 'Mã OTP đã hết hạn.' });
        }

        logControllerError('resetPassword', error);
        return res.status(500).json({
            message: `Reset password failed: ${error.message}`,
            operation: 'resetPassword',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    const user = req.user;

    return res.status(200).json({
        message: 'Lấy thông tin profile thành công.',
        user,
        url: user.role === 'ADMIN' ? '/admin/profile' : '/user/profile'
    });
};

const updateProfile = async (req, res) => {
    try {
        const updatedUser = await authService.updateProfile(req.user.id, req.body);

        return res.status(200).json({
            message: 'Cập nhật profile thành công.',
            user: updatedUser
        });
    } catch (error) {
        if (error.message === 'USER_NOT_FOUND') {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        if (error.message === 'INVALID_CURRENT_PASSWORD') {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng.' });
        }

        logControllerError('updateProfile', error);
        return res.status(500).json({
            message: `Update profile failed: ${error.message}`,
            operation: 'updateProfile',
            error: error.message
        });
    }
};

module.exports = { register, login, verifyOtp, resendOtp, forgotPassword, resetPassword, getProfile, updateProfile };