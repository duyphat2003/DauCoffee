import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PoliciesPage.css";
import { useNavigate, useParams } from "react-router-dom";
import { APP_NAME } from "../../constants/GlobalConfig";

const POLICIES = [
  {
    id: "shipping",
    title: "CHÍNH SÁCH GIAO HÀNG",
    icon: "🚚",
    content: [
      { 
        subtitle: "Phạm vi giao hàng", 
        text: "Chúng tôi hỗ trợ giao hàng trong bán kính 10km từ cửa hàng gần nhất. Đối với các khu vực xa hơn, phí vận chuyển sẽ được tính dựa trên biểu phí của các đơn vị đối vận chuyển đối tác (Grab, Ahamove)." 
      },
      { 
        subtitle: "Thời gian giao hàng", 
        text: "Thời gian chuẩn bị và giao hàng dự kiến từ 20 - 45 phút tùy vào khoảng cách và tình hình giao thông. Trong khung giờ cao điểm, thời gian có thể kéo dài hơn, mong quý khách thông cảm." 
      },
      { 
        subtitle: "Phí vận chuyển", 
        text: "Miễn phí vận chuyển (Freeship) cho các hóa đơn có giá trị từ 200.000 VNĐ trở lên trong bán kính 3km. Các đơn hàng khác sẽ áp dụng phí cố định là 15.000 VNĐ - 30.000 VNĐ." 
      }
    ]
  },
  {
    id: "payment",
    title: "CHÍNH SÁCH THANH TOÁN",
    icon: "💳",
    content: [
      { 
        subtitle: "Thanh toán không dùng tiền mặt", 
        text: "Hỗ trợ đa dạng các phương thức thanh toán điện tử như thẻ nội địa (ATM), thẻ quốc tế (Visa/Mastercard), và các ví điện tử phổ biến (Momo, ZaloPay, ShopeePay)." 
      },
      { 
        subtitle: "Thanh toán khi nhận hàng (COD)", 
        text: "Quý khách có thể lựa chọn trả tiền mặt trực tiếp cho nhân viên giao hàng ngay khi nhận được sản phẩm." 
      },
      { 
        subtitle: "Tính bảo mật", 
        text: "Mọi thông tin giao dịch qua thẻ hoặc ví điện tử đều được mã hóa theo tiêu chuẩn bảo mật quốc tế, đảm bảo an toàn tuyệt đối thông tin cá nhân và tài khoản của khách hàng." 
      }
    ]
  },
  {
    id: "rewards",
    title: "CHÍNH SÁCH ĐỔI THƯỞNG",
    icon: "🎁",
    content: [
      { 
        subtitle: "Tích lũy điểm (Beans)", 
        text: "Với mỗi 10.000 VNĐ chi tiêu tại cửa hàng hoặc trên ứng dụng, quý khách sẽ tích lũy được 1 'Hạt cà phê' vào tài khoản thành viên." 
      },
      { 
        subtitle: "Hạng thành viên", 
        text: "Hệ thống bao gồm 3 hạng: Mới (Newbie), Bạc (Silver), và Vàng (Gold). Hạng càng cao, quý khách càng nhận được nhiều ưu đãi đặc biệt như quà tặng sinh nhật hoặc giảm giá trực tiếp trên hóa đơn." 
      },
      { 
        subtitle: "Quy đổi phần thưởng", 
        text: "Điểm tích lũy có thể dùng để đổi các sản phẩm miễn phí (từ 50 điểm), voucher giảm giá hoặc các vật phẩm lưu niệm độc quyền của quán." 
      }
    ]
  }
];

export default function PoliciesPage() {
const { id } = useParams(); // Lấy 'shipping', 'payment' hoặc 'rewards' từ URL
  const navigate = useNavigate();

  // Nếu URL không có type hoặc type lạ, mặc định về shipping
  const activeType = id && POLICIES.find(p => p.id === id) ? id : "shipping";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const currentPolicy = POLICIES.find(p => p.id === activeType);

  return (
    <div className="policies-container">
      <div className="policies-header text-center mb-5">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fantasy-title gold-glow-text"
        >
        ◈ Chính sách { APP_NAME } ◈
        </motion.h2>
        <div className="fantasy-divider-gold mx-auto"></div>
      </div>

      <div className="container">
        <div className="row">
          {/* Sidebar Menu điều hướng bằng URL */}
          <div className="col-lg-4 mb-4">
            <div className="policy-sidebar card-frame p-3 shadow-glow">
              {POLICIES.map((policy) => (
                <button
                  key={policy.id}
                  className={`policy-nav-link ${activeType === policy.id ? "active" : ""}`}
                  onClick={() => navigate(`/policies/${policy.id}`)} // Chuyển URL khi click
                >
                  <span className="policy-icon">{policy.icon}</span>
                  {policy.title}
                </button>
              ))}
            </div>
          </div>

          {/* Nội dung hiển thị dựa theo tham số URL */}
          <div className="col-lg-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeType}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="policy-content-area card-frame p-5"
              >
                <h3 className="gold-text mb-4 text-center">{currentPolicy?.title}</h3>
                
                {currentPolicy?.content.map((item, index) => (
                  <div key={index} className="policy-section mb-4">
                    <h5 className="gold-text">✦ {item.subtitle}</h5>
                    <p className="text-white-50">{item.text}</p>
                  </div>
                ))}
                
                <div className="policy-footer-note mt-5">
                  <p>⚠️ Mọi quy định có hiệu lực kể từ kỷ nguyên thứ III. Hội đồng có quyền thay đổi thông qua bồ câu đưa tin.</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}