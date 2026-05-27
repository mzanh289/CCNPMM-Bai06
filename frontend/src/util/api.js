import axios from './axios.customize';

const API_PREFIX = "/api/auth";

const createUserApi = (data) => {
    return axios.post(`${API_PREFIX}/register`, data);
}

const loginApi = (data) => {
    return axios.post(`${API_PREFIX}/login`, data);
}

const getProfileApi = (role = "USER") => {
    const endpoint = role === "ADMIN" ? "/admin/profile" : "/user/profile";
    return axios.get(`${API_PREFIX}${endpoint}`);
}

const forgotPasswordApi = (data) => {
    return axios.post(`${API_PREFIX}/forgot-password`, data);
}

const resetPasswordApi = (data) => {
    return axios.post(`${API_PREFIX}/reset-password`, data);
}

const updateProfileApi = (data) => {
    return axios.put(`${API_PREFIX}/profile`, data);
}

const verifyOtpApi = (data) => {
    return axios.post(`${API_PREFIX}/verify-otp`, data);
}

const resendOtpApi = (data) => {
    return axios.post(`${API_PREFIX}/resend-otp`, data);
}

export {
    createUserApi,
    loginApi,
    getProfileApi,
    forgotPasswordApi,
    resetPasswordApi,
    updateProfileApi,
    verifyOtpApi,
    resendOtpApi
}