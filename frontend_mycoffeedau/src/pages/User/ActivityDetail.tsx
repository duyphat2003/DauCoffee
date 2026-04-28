import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { activities } from "../../data/activities";
import "./ActivityDetail.css";

export default function ActivityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Tìm kiếm hoạt động theo ID
  const activity = activities.find((item) => item.id === Number(id));

  // Cuộn lên đầu trang khi vào chi tiết
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!activity) {
    return (
      <div className="activities-container text-center">
        <h2 className="gold-text">Bản tin không tồn tại hoặc đã bị niêm phong!</h2>
        <button className="btn-fantasy mt-4" onClick={() => navigate("/news")}>
          <span>QUAY LẠI BẢNG TIN</span>
        </button>
      </div>
    );
  }

  return (
    <div className="activity-detail-container">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="container"
      >
        <button className="btn-back-fantasy" onClick={() => navigate(-1)}>
          ⬅ Trở về
        </button>

        <div className="row mt-4">
          {/* Hình ảnh đặc tả */}
          <div className="col-lg-6 mb-4">
            <div className="detail-image-frame card-frame shadow-glow">
              <img src={activity.image} alt={activity.title} className="img-fluid" />
              <div className={`detail-badge ${activity.category.toLowerCase()}`}>
                {activity.category}
              </div>
            </div>
          </div>

          {/* Nội dung chi tiết */}
          <div className="col-lg-6">
            <div className="detail-content-scroll card-frame p-4">
              <span className="detail-date">📅 Khởi hiệu: {activity.date}</span>
              <h1 className="detail-title gold-text mt-2">{activity.title}</h1>
              <div className="fantasy-divider-gold mb-4"></div>
              
              <div className="detail-full-desc">
                <p className="lead-text">{activity.description}</p>
                
                <h5 className="gold-text mt-4">◈ CHI TIẾT NỘI DUNG ◈</h5>
                <p>
                  Lữ khách thân mến, đây là thông điệp được gửi từ hội đồng Coffee Realm. 
                  Sự kiện này không chỉ mang lại hương vị thượng hạng mà còn là cơ hội 
                  để các chiến binh tích lũy linh hồn (điểm thưởng) và thăng hạng danh vọng.
                </p>
                
                <ul className="fantasy-list">
                  <li>Yêu cầu: Đã đăng ký ấn ký tại vương quốc.</li>
                  <li>Phần thưởng: Voucher Phù Thủy & Thức uống giới hạn.</li>
                  <li>Địa điểm: Toàn bộ chi nhánh tháp cà phê.</li>
                </ul>

                <div className="alert-fantasy mt-5">
                  <p>⚠️ Lưu ý: Hiệu lực của thông điệp có thể kết thúc sớm nếu số lượng quà tặng cạn kiệt.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}