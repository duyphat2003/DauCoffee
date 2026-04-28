import React from "react";
import { motion } from "framer-motion";
import "./ActivitiesPage.css";
import { activities } from "../../data/activities";
import { useNavigate } from "react-router-dom";

export default function ActivitiesPage() {
    const navigate = useNavigate();
  return (
    <div className="activities-container">
      <div className="activities-header text-center mb-5">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fantasy-title gold-glow-text"
        >
          ◈ BẢNG TIN HOẠT ĐỘNG ◈
        </motion.h2>
        <div className="fantasy-divider-gold mx-auto"></div>
        <p className="subtitle-fantasy">Cập nhật những biến động mới nhất trong vương quốc cà phê</p>
      </div>

      <div className="container">
        {/* Khu vực cuộn nếu dữ liệu vượt quá giới hạn */}
        <div className="activities-scroll-area">
          <div className="row">
            {activities.map((item, index) => (
              <motion.div 
                key={item.id}
                className="col-lg-4 col-md-6 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} // Chỉ chạy animation 1 lần khi scroll thấy
                transition={{ delay: (index % 3) * 0.1 }} // Delay theo hàng ngang cho mượt
              >
                <div className="activity-card card-frame shadow-glow">
                  <div className="activity-image-wrapper">
                    <img src={item.image} alt={item.title} className="activity-img" />
                    <span className={`activity-badge ${item.badge.toLowerCase()}`}>
                      {item.badge}
                    </span>
                  </div>
                  
                  <div className="activity-content">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="activity-category">{item.category}</span>
                      <span className="activity-date">{item.date}</span>
                    </div>
                    <h4 className="activity-title gold-text">{item.title}</h4>
                    <p className="activity-desc text-white-50">{item.description}</p>
                    <button className="btn-fantasy btn-sm w-100" onClick={() => navigate(`/activities/${item.id}`)}>
                      <span>XEM CHI TIẾT</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}