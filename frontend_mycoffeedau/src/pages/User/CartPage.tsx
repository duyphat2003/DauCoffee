import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeItem, totalAmount } = useCart(); // Lấy từ Context

  return (
    <div className="cart-page container py-5">
      <h1 className="inventory-title text-center mb-5">
        <span className="ornament">⚔</span> TÚI ĐỒ HÀNH TRANG <span className="ornament">⚔</span>
      </h1>

      {cartItems.length === 0 ? (
        <div className="empty-cart text-center p-5">
          <p className="gold-text">Túi đồ của bạn đang trống rỗng...</p>
          <button className="btn-fantasy" onClick={() => navigate("/")}>QUAY LẠI CỬA HÀNG</button>
        </div>
      ) : (
        <div className="row g-4">
          {/* DANH SÁCH VẬT PHẨM */}
          <div className="col-lg-8">
            <div className="inventory-list">
              {cartItems.map(item => (
                <div key={item.id} className="inventory-item d-flex align-items-center">
                  <div className="item-frame">
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className="item-info ms-4 flex-grow-1">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-price">{item.price.toLocaleString()} VÀNG</p>
                  </div>

                  <div className="item-controls d-flex align-items-center">
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>−</button>
                    <span className="qty-value mx-3">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>＋</button>
                  </div>

                  <button className="btn-remove ms-4" onClick={() => removeItem(item.id)}>
                    <i className="trash-icon">🗑</i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TỔNG KẾT HÓA ĐƠN */}
          <div className="col-lg-4">
            <div className="scroll-summary">
              <h2 className="summary-title">TỔNG KẾT</h2>
              <div className="divider-dots"></div>
              
              <div className="d-flex justify-content-between mb-3">
                <span>Vật phẩm:</span>
                <span>{cartItems.length}</span>
              </div>
              
              <div className="total-box">
                <p className="label">TỔNG CHI PHÍ:</p>
                <h2 className="final-amount">
                  {totalAmount.toLocaleString()} <span className="gold-unit">VÀNG</span>
                </h2>
              </div>

              <button className="btn-fantasy btn-checkout w-100 mt-4">
                XÁC NHẬN GIAO DỊCH
              </button>
              <button className="btn-back-shop w-100 mt-3" onClick={() => navigate("/")}>
                TIẾP TỤC THU THẬP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}