import { motion } from "framer-motion";
import { branches } from "../../data/branches";
import "./LocationsPage.css";

export default function LocationsPage() {
  return (
    <div className="locations-container">
      <div className="locations-header text-center mb-5">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fantasy-title gold-glow-text"
        >
          ◈ HỆ THỐNG CHI NHÁNH ◈
        </motion.h2>
        <p className="subtitle-fantasy">Tìm điểm dừng chân gần bạn nhất trong vương quốc Coffee Realm</p>
        <div className="fantasy-divider-gold mx-auto"></div>
      </div>

      <div className="container">
        <div className="row">
          {branches.map((branch, index) => (
            <motion.div 
              key={branch.id}
              className="col-lg-12 mb-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="branch-card card-frame shadow-glow">
                <div className="row g-0">
                  {/* Ảnh chi nhánh */}
                  <div className="col-md-5">
                    <div className="branch-image-wrapper">
                      <img src={branch.image} alt={branch.name} className="branch-img" />
                    </div>
                  </div>
                  
                  {/* Thông tin chi nhánh */}
                  <div className="col-md-7">
                    <div className="branch-content p-4">
                      <h3 className="gold-text mb-3">{branch.name}</h3>
                      <div className="branch-info-list">
                        <p>📍 <strong>Địa chỉ:</strong> {branch.address}</p>
                        <p>📞 <strong>Hotline:</strong> {branch.phone}</p>
                        <p>⏰ <strong>Giờ mở cửa:</strong> {branch.hours}</p>
                      </div>
                      
                        <div className="branch-actions mt-auto pt-4 d-flex flex-wrap gap-3">
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn-fantasy btn-sm"
                        >
                            <span className="d-flex align-items-center gap-2">
                            <i className="bi bi-geo-alt"></i> CHỈ ĐƯỜNG
                            </span>
                        </a>
                        
                        <button className="btn-outline-fantasy">
                            <span className="d-flex align-items-center gap-2">
                            <i className="bi bi-calendar-check"></i> ĐẶT BÀN NGAY
                            </span>
                        </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}