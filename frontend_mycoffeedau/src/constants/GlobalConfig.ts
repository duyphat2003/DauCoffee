export const API_URL = "https://localhost:7264/api"; // Link backend của bạn
export const APP_NAME = "Đậu Coffee";
const savedUser = localStorage.getItem("user_token");
export const CURRENT_USER = savedUser ? JSON.parse(savedUser) : null;
export const IS_LOGIN = savedUser !== null;
export const IS_ADMIN = CURRENT_USER?.email === "admin@gmail.com";
