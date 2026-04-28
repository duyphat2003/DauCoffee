import { useNavigate } from "react-router-dom";
import "./AboutPage.css";

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-page container-fluid py-5">
      <div className="container">
        {/* HEADER SECTION */}
        <header className="about-header text-center mb-5">
          <h1 className="chronicle-title">BIÊN NIÊN SỬ ĐẬU COFFEE</h1>
          <div className="title-divider">
            <span className="crystal"></span>
          </div>
          <p className="subtitle-fantasy">"Nơi những hạt đậu cổ xưa thức tỉnh bản ngã thám hiểm"</p>
        </header>

        <div className="row g-5 align-items-center">
          {/* HÌNH ẢNH MINH HỌA CỔ ĐIỂN */}
          <div className="col-lg-6">
            <div className="legend-img-frame">
              <img 
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085" 
                alt="Ancient Coffee beans" 
                className="legend-img" 
              />
              <div className="frame-decoration top-left"></div>
              <div className="frame-decoration bottom-right"></div>
            </div>
          </div>

          {/* NỘI DUNG GIỚI THIỆU */}
          <div className="col-lg-6">
            <div className="parchment-content">
              <h2 className="section-subtitle">◈ Khởi Nguồn Huyền Thoại</h2>
              <p>
                Tại <strong>Đậu Coffee</strong>, chúng tôi không chỉ bán cà phê. Chúng tôi là những người canh giữ 
                những "linh hồn hạt" được thu thập từ những vùng đất xa xôi nhất của vương quốc. 
                Mỗi tách đồ uống tại đây là một bản giao hưởng giữa <em>phép thuật chế tác</em> và <em>nguyên liệu thuần khiết</em>.
              </p>

              <h2 className="section-subtitle mt-4">◈ Sứ Mệnh Của Chúng Tôi</h2>
              <ul className="mission-list">
                <li><span>✦</span> <strong>Đánh thức giác quan:</strong> Giúp mỗi nhà thám hiểm tỉnh táo trước mọi thử thách.</li>
                <li><span>✦</span> <strong>Kết nối cộng đồng:</strong> Nơi những bang hội tụ họp và chia sẻ chiến tích.</li>
                <li><span>✦</span> <strong>Chất lượng hoàng gia:</strong> Chỉ sử dụng hạt đậu đạt phẩm cấp S-Rank.</li>
              </ul>

              <div className="signature mt-5">
                <p>Ký tên,</p>
                <h3 className="master-alchemist">Trưởng Giả Đậu Coffee</h3>
              </div>
            </div>
          </div>
        </div>

        {/* THÔNG SỐ CỬA HÀNG (STATS) */}
        <div className="row mt-5 pt-5 text-center g-4">
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="stat-number">10+</h2>
              <p className="stat-label">Công Thức Độc Bản</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="stat-number">50K+</h2>
              <p className="stat-label">Người dùng Tin Dùng</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card">
              <h2 className="stat-number">2+</h2>
              <p className="stat-label">Chi Nhánh Liên Minh</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-5">
          <button className="btn-fantasy px-5" onClick={() => navigate("/")}>
            KHÁM PHÁ NƯỚC UỐNG NGAY
          </button>
        </div>
      </div>
    </div>
  );
}