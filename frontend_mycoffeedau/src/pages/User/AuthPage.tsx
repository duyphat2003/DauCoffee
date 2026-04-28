/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./AuthPage.css";
import { UserService } from "../../constants/APIService";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const navigate = useNavigate();
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({
    username: false,
    email: false,
    password: false,
  });



  // --- HÀM KIỂM TRA (VALIDATORS) ---
  const isEmailValid = (email: string) => /^[^\s@]+@gmail\.com$/.test(email);
  const isUsernameValid = (name: string) => name.length === 8;
  const isPasswordValid = (pass: string) => 
    /^[A-Z].{6,}[!@#$%^&*()_+{}:"<>?]$/.test(pass) && pass.length >= 8;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: false }));
  };
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // --- LOGIC ĐĂNG NHẬP ---
        const user = await UserService.login({ 
          email: formData.email, 
          password: formData.password 
        });
        // Lưu thông tin vào localStorage để duy trì phiên
        localStorage.setItem("user_token", JSON.stringify(user));
        alert("Chào mừng lữ khách " + user.nameDisplay + " trở lại!");
        navigate("/");
        window.location.reload(); // Reload để Header cập nhật trạng thái mới
      } else {
        // --- LOGIC ĐĂNG KÝ ---
        await UserService.register({
          nameDisplay: formData.username,
          email: formData.email,
          password: formData.password
        } as any);
        alert("Đăng ký thành công! Hãy dùng mật khẩu vừa tạo để vào quán.");
        setIsLogin(true);
      }
    } catch (error: any) {
      alert(error.response?.data || "Có lỗi xảy ra, lữ khách vui lòng kiểm tra lại!");
    }
  };

  const handleForgotSubmit = async () => {
    if (!forgotEmail.includes("@gmail.com")) {
      setForgotError(true);
      return;
    }
    try {
      const msg = await UserService.forgotPassword(forgotEmail);
      alert("⚔️ " + msg);
      setShowForgotModal(false);
    } catch (error: any) {
      alert(error.response?.data || "Không tìm thấy email này!");
    }
  };

  
  return (
    <div className="auth-page-container">
    <div className="fantasy-bg-overlay"></div>
      <div className="mist-layer"></div>

      <motion.div layout className="auth-card card-frame shadow-glow">
        <div className="auth-header text-center">
          <h2 className="fantasy-title gold-glow-text">{isLogin ? "◈ ĐĂNG NHẬP ◈" : "◈ GHI DANH ◈"}</h2>
          <div className="fantasy-divider-gold"></div>
        </div>

        <form onSubmit={handleAuthSubmit} className="auth-form mt-4" noValidate>
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                className={`input-group-fantasy mb-4 
                  ${formData.username ? (isUsernameValid(formData.username) ? "is-valid-rpg" : "is-invalid-rpg") : ""}
                  ${errors.username ? "has-fantasy-error" : ""}`}
              >
                <label>Danh xưng (Đúng 8 ký tự)</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="SIRLANCE" />
                <div className="custom-error-tooltip">
                   <span className="error-icon">⚔️</span>
                   <span className="error-msg">Danh xưng phải đủ 8 hào quang!</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`input-group-fantasy mb-4 
            ${formData.email ? (isEmailValid(formData.email) ? "is-valid-rpg" : "is-invalid-rpg") : ""}
            ${errors.email ? "has-fantasy-error" : ""}`}>
            <label>Địa chỉ thư tín (@gmail.com)</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="hiep-si@gmail.com" />
            <div className="custom-error-tooltip">
               <span className="error-icon">📜</span>
               <span className="error-msg">Thư tín phải thuộc hệ Gmail!</span>
            </div>
          </div>

          <div className={`input-group-fantasy mb-4 
            ${formData.password ? (isPasswordValid(formData.password) ? "is-valid-rpg" : "is-invalid-rpg") : ""}
            ${errors.password ? "has-fantasy-error" : ""}`}>
            <label>Mật mã (In hoa đầu, ký tự đặc biệt cuối)</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Abcdefg@" />
            <div className="custom-error-tooltip">
               <span className="error-icon">🛡️</span>
               <span className="error-msg">Ấn ký chưa đúng quy luật bảo mật!</span>
            </div>
          </div>

<button type="submit" className="btn-fantasy btn-auth-submit w-100">
  <span className="btn-text-content">{isLogin ? "XÁC MINH" : "GHI DANH"}</span>
</button>
        </form>

        <div className="auth-footer text-center mt-4">
          <p className="switch-text">
            {isLogin ? "Lần đầu tới ư?" : "Đã có ghi danh?"}{" "}
            <span className="gold-link" onClick={() => {
              setIsLogin(!isLogin);
              setErrors({ username: false, email: false, password: false });
            }}>
              {isLogin ? "Đăng ký" : "Đăng nhập"}
            </span>
          </p>
          {isLogin && (
            <p className="forgot-pass-link" onClick={() => setShowForgotModal(true)}>
              Thất lạc mật mã?
            </p>
          )}
        </div>
      </motion.div>

      {/* MODAL QUÊN MẬT KHẨU GIỮ NGUYÊN */}
{/* MODAL QUÊN MẬT KHẨU ĐÃ CẬP NHẬT LOGIC TRỰC QUAN */}
<AnimatePresence>
  {showForgotModal && (
    <div className="fantasy-modal-overlay">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fantasy-modal-content card-frame shadow-glow"
      >
        <h3 className="gold-text mb-3">KHÔI PHỤC MẬT KHẨU</h3>
        <p className="text-white-50 mb-4">Nhập địa chỉ thư tín, bồ câu sẽ gửi mật mã mới đến bạn.</p>
        
        {/* Thêm logic đổi màu border real-time và rung khi lỗi submit */}
        <div className={`input-group-fantasy mb-5 text-start 
          ${forgotEmail ? (/^[^\s@]+@gmail\.com$/.test(forgotEmail) ? "is-valid-rpg" : "is-invalid-rpg") : ""} 
          ${forgotError ? "has-fantasy-error" : ""}`}
        >
          <label>Địa chỉ Email (@gmail.com)</label>
          <input 
            type="email" 
            placeholder="lancelot@gmail.com" 
            value={forgotEmail}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              if (forgotError) setForgotError(false); // Xóa trạng thái lỗi khi người dùng sửa
            }}
          />
          
          {/* Tooltip lỗi cuộn giấy đỏ */}
          <div className="custom-error-tooltip">
            <span className="error-icon">🕊️</span>
            <span className="error-msg">Thư tín phải thuộc hệ Gmail!</span>
          </div>
        </div>

        <div className="d-flex gap-2">
<button 
    className="btn-fantasy btn-secondary w-100" 
    type="button" // Luôn thêm type để tránh trigger submit nhầm
    onClick={() => {
      setShowForgotModal(false);
      setForgotError(false);
      setForgotEmail("");
    }}
  >
    <span>HỦY</span>
  </button>
  <button 
    className="btn-fantasy w-100" 
    type="button"
    onClick={handleForgotSubmit}
  >
    <span>GỬI</span>
  </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </div>
  );
}