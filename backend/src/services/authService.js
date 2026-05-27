const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/OTP');
const emailService = require('./emailService');
const { generateOTP } = require('../utils/generateOTP');

const register = async (email, password, name = '') => {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
        throw new Error('EMAIL_EXISTS');
    }


    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        status: 'INACTIVE'
    });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000); // 5 phút

    await Otp.create({ email: normalizedEmail, otp_code: otpCode, expiresAt, type: 'REGISTER' });

    const delivery = await emailService.sendOtpMail(normalizedEmail, otpCode);

    return {
        email: normalizedEmail,
        otpCode,
        delivery
    };
};

const verifyOtp = async (email, otpCode) => {
    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        otp_code: otpCode,
        $or: [{ type: 'REGISTER' }, { type: { $exists: false } }]
    }).sort({ createdAt: -1 });

    if (!otpRecord) throw new Error('OTP_INVALID');
    if (new Date() > otpRecord.expiresAt) throw new Error('OTP_EXPIRED');

    await User.updateOne(
        { email: normalizedEmail },
        { $set: { status: 'ACTIVE' } }
    );

    await Otp.deleteMany({ email: normalizedEmail, $or: [{ type: 'REGISTER' }, { type: { $exists: false } }] });
};

const resendRegisterOtp = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    if (user.status === 'ACTIVE') {
        throw new Error('ACCOUNT_ACTIVE');
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await Otp.deleteMany({ email: normalizedEmail, $or: [{ type: 'REGISTER' }, { type: { $exists: false } }] });
    await Otp.create({ email: normalizedEmail, otp_code: otpCode, expiresAt, type: 'REGISTER' });

    const delivery = await emailService.sendOtpMail(normalizedEmail, otpCode);

    return {
        email: normalizedEmail,
        delivery
    };
};

const requestPasswordReset = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60000);

    await Otp.create({ email: normalizedEmail, otp_code: otpCode, expiresAt, type: 'RESET_PASSWORD' });

    const delivery = await emailService.sendResetPasswordOtpMail(normalizedEmail, otpCode);

    return {
        email: normalizedEmail,
        delivery
    };
};

const resetPassword = async (email, otpCode, newPassword) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        otp_code: otpCode,
        type: 'RESET_PASSWORD'
    }).sort({ createdAt: -1 });

    if (!otpRecord) throw new Error('OTP_INVALID');
    if (new Date() > otpRecord.expiresAt) throw new Error('OTP_EXPIRED');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.updateOne(
        { email: normalizedEmail },
        { $set: { password: hashedPassword } }
    );

    await Otp.deleteMany({ email: normalizedEmail, type: 'RESET_PASSWORD' });
};

const updateProfile = async (userId, payload) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('USER_NOT_FOUND');
    }

    const { name, currentPassword, newPassword } = payload;

    if (typeof name === 'string') {
        user.name = name.trim();
    }

    if (newPassword) {
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new Error('INVALID_CURRENT_PASSWORD');
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    return {
        id: user._id.toString(),
        email: user.email,
        name: user.name ?? '',
        role: user.role
    };
};

const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('INVALID_CREDENTIALS');
    }

    if (user.status !== 'ACTIVE') {
        throw new Error('ACCOUNT_INACTIVE');
    }

    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const token = jwt.sign(
        { id: user._id.toString(), email: user.email, role: user.role },
        secret,
        { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    return {
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? '',
            role: user.role
        },
        redirectUrl: user.role === 'ADMIN' ? '/admin/profile' : '/user/profile'
    };
};

module.exports = { register, verifyOtp, resendRegisterOtp, login, requestPasswordReset, resetPassword, updateProfile };