import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { jobs } from "../../data/jobs";
import { APP_NAME } from "../../constants/GlobalConfig";
import "./CareersPage.css";

export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<typeof jobs[0] | null>(null);

  return (
    <div className="careers-container">
      <div className="careers-header text-center mb-5">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fantasy-title gold-glow-text"
        >
          ◈ CHIÊU MỘ NHÂN TÀI ◈
        </motion.h2>
        <p className="subtitle-fantasy">Gia nhập đội ngũ để cùng viết nên huyền thoại {APP_NAME}</p>
        <div className="fantasy-divider-gold mx-auto"></div>
      </div>

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            {/* Khu vực Scroll Area: Từ tin thứ 5 trở đi sẽ cuộn */}
            <div className="jobs-scroll-area">
              {jobs.map((job, index) => (
                <motion.div 
                  key={job.id}
                  className="mb-4 pe-2"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index % 5) * 0.1 }}
                >
                  <div className="job-post-card card-frame shadow-glow">
                    <div className="job-info">
                      <div className="d-flex align-items-center gap-3 mb-2">
                        <span className={`job-type-badge ${job.type.toLowerCase().replace("-", "")}`}>
                          {job.type}
                        </span>
                        <span className="job-id-tag">#{job.id}</span>
                      </div>
                      <h4 className="gold-text m-0">{job.position}</h4>
                      <p className="job-meta mt-2">
                        <span>📍 {job.location}</span>
                        <span className="mx-2">|</span>
                        <span>💰 {job.salary}</span>
                        <span className="mx-2">|</span>
                        <span>⏳ Hạn: {job.deadline}</span>
                      </p>
                    </div>
                    <button 
                      className="btn-fantasy btn-sm"
                      onClick={() => setSelectedJob(job)}
                    >
                      <span>XEM CHI TIẾT</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết công việc */}
      <AnimatePresence>
        {selectedJob && (
          <motion.div 
            className="fantasy-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedJob(null)}
          >
            <motion.div 
              className="fantasy-modal-content job-detail-modal card-frame"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close-btn" onClick={() => setSelectedJob(null)}>✕</button>
              <h3 className="gold-text">{selectedJob.position}</h3>
              <div className="fantasy-divider-gold mb-3"></div>
              
              <div className="job-detail-body text-start">
                <div className="detail-meta-grid mb-4">
                  <div><strong>Hình thức:</strong> {selectedJob.type}</div>
                  <div><strong>Nơi làm việc:</strong> {selectedJob.location}</div>
                  <div><strong>Lương:</strong> {selectedJob.salary}</div>
                </div>

                <h6>◈ MÔ TẢ NHIỆM VỤ:</h6>
                <p className="text-white-50">{selectedJob.description}</p>
                
                <h6>◈ YÊU CẦU NĂNG LỰC:</h6>
                <ul className="requirements-list">
                  {selectedJob.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>

                <div className="apply-box mt-4 p-3 text-center">
                  <p className="mb-2">Gửi "Hồ sơ năng lực" về địa chỉ:</p>
                  <h5 className="gold-text">recruitment@coffeerealm.com</h5>
                  <p className="small italic text-warning mt-2">
                    Tiêu đề: [ỨNG TUYỂN] - {selectedJob.position} - Tên của bạn
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}