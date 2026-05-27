const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const {
	registerLimiter,
	loginLimiter,
	otpLimiter,
	resendOtpLimiter,
	forgotPasswordLimiter,
	resetPasswordLimiter,
	updateProfileLimiter,
	registerValidation,
	loginValidation,
	otpValidation,
	resendOtpValidation,
	forgotPasswordValidation,
	resetPasswordValidation,
	updateProfileValidation,
	authenticateToken,
	authorizeRoles
} = require('../middlewares/authMiddleware');

router.post('/register', registerLimiter, registerValidation, authController.register);
router.post('/login', loginLimiter, loginValidation, authController.login);
router.post('/verify-otp', otpLimiter, otpValidation, authController.verifyOtp);
router.post('/resend-otp', resendOtpLimiter, resendOtpValidation, authController.resendOtp);
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPasswordValidation, authController.resetPassword);
router.get('/user/profile', authenticateToken, authorizeRoles('USER'), authController.getProfile);
router.get('/admin/profile', authenticateToken, authorizeRoles('ADMIN'), authController.getProfile);
router.put('/profile', authenticateToken, updateProfileLimiter, updateProfileValidation, authController.updateProfile);

module.exports = router;