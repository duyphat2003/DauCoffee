import React, { useEffect, useState } from "react";
import "./UserProfile.css";
import type { User } from "../../models/user";
import type { Order } from "../../models/order";
import type { PaymentMethod } from "../../models/paymentmethod";
import type { FavoriteDrink } from "../../models/favoritedrink";
import { drinks } from "../../data/drinks";
import { useNavigate, useParams } from "react-router-dom";
import { UserService, FavoriteService, OrderService, DrinkService, UserVoucherService } from "../../constants/APIService";
import { CURRENT_USER } from "../../constants/GlobalConfig";
import type { Drink } from "../../models/drink";
import type { Voucher } from "../../models/voucher";
import type { UserVoucher } from "../../models/uservoucher";
import { useCart } from "../../context/CartContext"; // ✅ THÊM
export default function UserProfile() {
  const { tab } = useParams(); // Lấy giá trị :tab từ thanh địa chỉ
  const navigate = useNavigate();
  const { addToCart } = useCart(); // ✅ THÊM
  const [currentActiveTab, setActiveTab] = useState(tab || "info");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<FavoriteDrink[]>([]);
  const [favoriteDrinks, setFavoriteDrinks] = useState<Drink[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho Voucher
  const [shopVouchers, setShopVouchers] = useState<Voucher[]>([]);
  const [myVouchers, setMyVouchers] = useState<UserVoucher[]>([]);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

useEffect(() => {
  const fetchData = async () => {
    if (!CURRENT_USER?.email) return;
    try {
      const userData = await UserService.getByEmail(CURRENT_USER.email);
      setUser(userData);

      const [favData, orderData] = await Promise.all([
        FavoriteService.getByUser(userData.id),
        OrderService.getByUser(userData.id),
      ]);

      // Normalize orders: map PascalCase → camelCase nếu backend trả PascalCase
      const normalizedOrders = orderData.map((o: any) => ({
        id: o.id ?? o.Id,
        idUser: o.idUser ?? o.IdUser,
        date: o.date ?? o.Date,
        total: o.total ?? o.Total,
        status: o.status ?? o.Status,
        items: (o.items ?? o.Items ?? []).map((item: any) => ({
          id: item.id ?? item.Id,
          orderId: item.orderId ?? item.OrderId,
          idDrink: item.idDrink ?? item.IdDrink,
          name: item.name ?? item.Name,
          quantity: item.quantity ?? item.Quantity,
          priceAtPurchase: item.priceAtPurchase ?? item.PriceAtPurchase,
        })),
      }));
      setOrders(normalizedOrders);

      setFavorites(favData);

      // Lấy thông tin drink thực từ API thay vì local data
      const drinkDetails = await Promise.all(
        favData.map((fav: any) =>
          DrinkService.getById(fav.idDrink ?? fav.IdDrink ?? fav.id_drink).catch(() => null)
        )
      );
      setFavoriteDrinks(drinkDetails.filter(Boolean));

      // Lấy danh sách voucher shop + voucher đã đổi của user
      const [shopData, myVoucherData] = await Promise.all([
        UserVoucherService.getShopList(),
        UserVoucherService.getMyVouchers(userData.id),
      ]);
      setShopVouchers(shopData);
      setMyVouchers(myVoucherData);

    } catch (err) {
      console.error("Lỗi tải dữ liệu người dùng:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);
  
const MOCK_PAYMENTS: PaymentMethod[] = [
  { 
    id: "p1", 
    id_user: "U-001",
    namePayment: "Visa", 
    numberPayment: "**** **** **** 8888", 
    expiry: "12/28", 
    isDefault: true 
  },
  { 
    id: "p2", 
    id_user: "U-001",
    namePayment: "Momo", 
    numberPayment: "090****567", 
    expiry: "", // Ví điện tử không cần ngày hết hạn
    isDefault: false 
  }
];

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    alert("⚔️ Hệ thống: Thông tin đã được ghi chép vào sử sách!");
    // Logic cập nhật thực tế sẽ nằm ở đây
  };

  useEffect(() => {
    // Nếu tab trên URL thay đổi (do nhấn Back/Forward hoặc Link từ Footer)
    if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("info");
    }
  }, [tab]);

  // --- Xử lý khi người dùng nhấn trực tiếp vào Tab Sidebar ---
  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName); // Cập nhật UI ngay lập tức cho mượt
    navigate(`/profile/${tabName}`); // Cập nhật URL để đồng bộ
  };

  // --- Hàm render nội dung (Tách ra để code sạch hơn) ---
  const renderTabContent = () => {
    switch (currentActiveTab) {
      case "info":
        return renderInfo();
      case "orders":
        return renderOrders();
      case "points":
        return renderPoints();
      case "favorites":
        return renderFavorites();
      case "payment":
        return renderPayment();
      default:
        return renderInfo();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    navigate("/auth");
    window.location.reload();
  };

  return (
    <div className="user-profile-page container py-5">
      <div className="row g-4">
        {/* SIDEBAR */}
        <div className="col-lg-4">
          <div className="profile-sidebar-fantasy card-frame">
            <div className="user-header text-center">
              <div className="avatar-container">
                <div className="avatar-ring"></div>
                <img src={user?.avatar ?? `https://i.pravatar.cc/100?u=${user?.email}`} alt="avatar" className="avatar-img" />
                <div className="rank-badge-premium">{user?.rank}</div>
              </div>
              <h2 className="user-name-fantasy mt-4">{user?.nameDisplay}</h2>
              <p className="user-title-sub">⭐ {user?.points ?? 0}</p>
            </div>

            <div className="nav-menu-fantasy mt-4">
                {[
                    {id: 'info', label: 'Hồ Sơ Cá Nhân', icon: '👤'},
                    {id: 'orders', label: 'Lịch sử Đơn Hàng', icon: '📜'},
                    {id: 'favorites', label: 'Nước Uống Yêu Thích', icon: '⭐'},
                    {id: 'points', label: 'Đổi Điểm Thưởng', icon: '💎'},
                    {id: 'payment', label: 'Thanh Toán', icon: '💳'}
                ].map(item => (
                    <button 
                        key={item.id}
                        className={`nav-item-btn ${currentActiveTab === item.id ? 'active' : ''}`}
                        onClick={() => handleTabChange(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                        {currentActiveTab === item.id && <span className="active-indicator">◀</span>}
                    </button>
                ))}
            </div>
            <button className="btn-logout-fantasy mt-5" onClick={handleLogout}>🚪 Đăng xuất</button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="col-lg-8">
          <div className="profile-main-content card-frame">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* MODAL QUÊN MẬT KHẨU */}
      {showForgotModal && (
        <div className="fantasy-modal-overlay">
          <div className="fantasy-modal-content card-frame">
            <div className="modal-header-fantasy">
              <h3>Khôi Phục Mật Mã</h3>
              <button className="close-btn" onClick={() => setShowForgotModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="guide-text">Hệ thống sẽ gửi mã xác minh đến email của bạn.</p>
              <div className="mb-4">
                <label className="fantasy-label">Email Xác Minh</label>
                <input type="email" className="fantasy-input" placeholder="lancelot@fantasy.com" />
              </div>
              <div className="mb-4">
                <label className="fantasy-label">Mật Khẩu Mới</label>
                <input type="password" className="fantasy-input" placeholder="Tối thiểu 8 ký tự" />
              </div>
              <button className="btn-fantasy w-100 py-3" onClick={() => {
                alert("⚔️ Hệ thống: Bồ câu đưa thư đã khởi hành!");
                setShowForgotModal(false);
              }}>
                GỬI YÊU CẦU XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function renderInfo() {
          return (
          <div className="tab-pane-fantasy fade-in">
            <h3 className="tab-title">📜 Hồ Sơ Cá Nhân</h3>
            <form className="row g-4" onSubmit={handleUpdate}>
              <div className="col-md-6">
                <label className="fantasy-label">Danh xưng (Tên)</label>
                <input 
                    type="text" className="fantasy-input" 
                    defaultValue={user?.nameDisplay} 
                />
              </div>
              <div className="col-md-6">
                <label className="fantasy-label">Liên lạc (SĐT)</label>
                <input type="text" className="fantasy-input" defaultValue={user?.phone} />
              </div>
              <div className="col-md-12">
                <label className="fantasy-label">Địa điểm (Địa chỉ giao hàng)</label>
                <textarea className="fantasy-input" rows={3} defaultValue={user?.address}></textarea>
              </div>
              <div className="col-md-6">
                <label className="fantasy-label">Mật mã hiện tại</label>
                <input type="password" className="fantasy-input" placeholder="••••••••" />
              </div>
              <div className="col-md-12 d-flex align-items-center gap-3">
                <button type="submit" className="btn-fantasy btn-lg">LƯU THÔNG TIN</button>
                <button type="button" className="btn-link-fantasy" onClick={() => setShowForgotModal(true)}>
                  Đổi mật mã bí mật?
                </button>
              </div>
            </form>
          </div>
        );
}

function renderOrders() {
          return (
            <div className="tab-pane-fantasy fade-in">
            <h3 className="tab-title text-center mb-4">📜 Nhật Ký Giao Kèo</h3>
            <div className="orders-list-fantasy">
                {orders.map((order) => (
                <div className="order-item-card" key={order.id}>
                    <div className="order-header-v2">
                    <span className="order-id">Mã: <span className="gold-text">#{order.id}</span></span>
                    <span className={`badge-status-v2 ${order.status === "Đã giao" ? "status-done" : "status-pending"}`}>
                        {order.status}
                    </span>
                    </div>
                    <div className="order-body-v2">
                    <div className="order-meta-simple">
                        <div>{order.date}</div>
                        <div className="gold-text">{order.total.toLocaleString()} đ</div>
                    </div>
                    <button 
                        className="btn-view-detail" 
                        onClick={() => setSelectedOrder(order)} // Bấm để mở Popup
                    >
                        XEM CHI TIẾT
                    </button>
                    </div>
                </div>
                ))}
            </div>

            {/* 3. HIỂN THỊ POPUP CHI TIẾT KHI CÓ ORDER ĐƯỢC CHỌN */}
            {selectedOrder && (
                <div className="fantasy-modal-overlay fade-in">
                <div className="order-detail-modal card-frame shadow-glow">
                    <div className="modal-header-fantasy">
                    <h3>📜 Chi Tiết Giao Kèo</h3>
                    <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
                    </div>
                    
                    <div className="modal-body scroll-fantasy">
                    <div className="detail-row">
                        <span>Mã giao dịch:</span>
                        <span className="gold-text">#{selectedOrder.id}</span>
                    </div>
                    <div className="detail-row">
                        <span>Thời gian:</span>
                        <span>{selectedOrder.date}</span>
                    </div>
                    <hr className="divider-gold" />
                    
                    <h5 className="section-subtitle">Nước uống đã đặt:</h5>
                    <div className="order-items-detail-list">
                        {selectedOrder.items.map((item, index) => (
                        <div className="detail-item-line" key={index}>
                            <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <small className="item-sub">Số lượng: x{item.quantity}</small>
                            </div>
                            <span className="item-sub-price">{(item.priceAtPurchase * item.quantity).toLocaleString()} đ</span>
                        </div>
                        ))}
                    </div>
                    
                    <hr className="divider-gold" />
                    <div className="detail-total-row">
                        <span>Tổng tiền tiêu tốn:</span>
                        <span className="total-gold-large">{selectedOrder.total.toLocaleString()} đ</span>
                    </div>
                    </div>

                    <div className="modal-footer-fantasy mt-4">
                    <button className="btn-fantasy w-100" onClick={() => setSelectedOrder(null)}>
                        XÁC NHẬN
                    </button>
                    </div>
                </div>
                </div>
            )}
            </div>
        );
}

function renderFavorites() {
  return (
    <div className="tab-pane-fantasy fade-in">
      <h3 className="tab-title text-center mb-5">⭐ Nước uống yêu thích</h3>
      {favoriteDrinks.length === 0 ? (
        <p className="text-center" style={{ color: "#aaa" }}>Chưa có nước uống yêu thích nào.</p>
      ) : (
        <div className="favorites-list-container">
          {favoriteDrinks.map((drink) => {
            const hasPromo = drink.isPromotion && drink.promotionPercent > 0;
            const finalPrice = hasPromo
              ? Math.round(drink.price * (1 - drink.promotionPercent / 100))
              : drink.price;

            return (
              <div className="fav-horizontal-card" key={drink.id}>
                <div className="fav-left-section">
                  <img src={drink.image.startsWith('/') ? drink.image : `/${drink.image}`} alt={drink.name} className="fav-img-thumb" />
                  <div className="fav-tags-stack">
                    {drink.isBestSeller && <span className="tag-mini tag-best">BEST</span>}
                    {drink.isFeatured && <span className="tag-mini tag-hot">HOT</span>}
                    {hasPromo && <span className="tag-mini tag-sale">-{drink.promotionPercent}%</span>}
                  </div>
                </div>
                <div className="fav-right-section">
                  <div className="fav-info-top">
                    <h5 className="fav-name-title">{drink.name}</h5>
                    <div className="fav-pricing">
                      <span className="price-current">{finalPrice.toLocaleString()}đ</span>
                      {hasPromo && <span className="price-original">{drink.price.toLocaleString()}đ</span>}
                    </div>
                  </div>
                  <div className="fav-info-bottom">
                    <button
                      className="btn-craft-gold"
                      onClick={() => {
                        addToCart(drink);
                        navigate("/cart");
                      }}
                    >ĐẶT NGAY</button>
                    <button
                      className="btn-remove-rpg"
                      title="Bỏ yêu thích"
                      onClick={() => {
                        FavoriteService.remove(user!.id, drink.id);
                        setFavoriteDrinks((prev) => prev.filter((d) => d.id !== drink.id));
                      }}
                    >✕</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function renderPayment() {
              return (
              <div className="tab-pane-fantasy fade-in">
                <h3 className="tab-title">💳 Phương Thức Thanh Toán</h3>
                    <div className="payment-methods-list">
                        {MOCK_PAYMENTS.map(method => (
                            <div className={`method-item-card ${method.isDefault ? 'default' : ''}`} key={method.id}>
                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center">
                                        {/* Render Icon dựa trên namePayment */}
                                        <div className="payment-icon">
                                            {method.namePayment === 'Visa' || method.namePayment === 'MasterCard' ? '💳' : '📱'}
                                        </div>
                                        <div className="ms-3">
                                            <p className="mb-0 fw-bold">
                                                {method.namePayment} {method.numberPayment}
                                            </p>
                                            {method.expiry && (
                                                <small className="text-muted">Hết hạn: {method.expiry}</small>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="actions d-flex align-items-center">
                                        {method.isDefault && (
                                            <span className="badge-default-fantasy">MẶC ĐỊNH</span>
                                        )}
                                        <button className="btn-remove-sm ms-3">Gỡ bỏ</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* ĐÂY LÀ NÚT BẠN LỠ XÓA */}
            <button 
                className="btn-fantasy-outline w-100 mt-4 py-3"
                onClick={() => alert("⚔️ Hệ thống: Chức năng liên kết kho báu đang được xây dựng!")}
            >
                + THÊM PHƯƠNG THỨC THANH TOÁN MỚI
            </button>
                    </div>
              </div>
            );
}
function renderPoints() {
  const handleRedeem = async (voucher: Voucher) => {
    if (!user) return;
    if (user.points < voucher.point) {
      alert(`Bạn cần ${voucher.point} điểm để đổi voucher này. Hiện tại bạn có ${user.points} điểm.`);
      return;
    }
    const alreadyOwned = myVouchers.some(
      mv => (mv.idVoucher === voucher.id) && !mv.isUsed
    );
    if (alreadyOwned) {
      alert("Bạn đã sở hữu voucher này và chưa sử dụng!");
      return;
    }
    if (!confirm(`Đổi "${voucher.content}" với ${voucher.point} điểm?`)) return;
    try {
      setRedeemingId(voucher.id);
      const result = await UserVoucherService.redeem(user.id, voucher.id);
      // Cập nhật điểm user local
      setUser(prev => prev ? { ...prev, points: result.remainingPoints } : prev);
      // Refresh kho voucher của user
      const updated = await UserVoucherService.getMyVouchers(user.id);
      setMyVouchers(updated);
      alert(`🎉 Đổi thành công! Bạn còn ${result.remainingPoints} điểm.`);
    } catch (err: any) {
      alert(err?.response?.data || "Không thể đổi voucher. Vui lòng thử lại!");
    } finally {
      setRedeemingId(null);
    }
  };

  const RANK_COLORS: Record<string, string> = {
    "Tập Sự": "#94a3b8", "Đồng": "#cd7c2f", "Bạc": "#94a3b8",
    "Vàng": "#f59e0b", "Kim Cương": "#60a5fa", "": "#10b981",
  };

  return (
    <div className="tab-pane-fantasy fade-in">
      <div className="points-container-premium">
        <div className="gem-icon">💎</div>
        <h3 className="tab-title">Cửa hàng đổi điểm thưởng</h3>
        <div className="points-display">
          <span className="point-val">{user?.points ?? 0}</span>
          <span className="point-unit">ĐIỂM THƯỞNG</span>
        </div>
        <div className="divider-dots mb-4"></div>

        {/* SHOP VOUCHERS */}
        <h5 className="mb-3" style={{ color: "#b18c5d", fontFamily: "Cinzel, serif", textAlign: "left" }}>
          🏪 Danh sách voucher có thể đổi
        </h5>
        {shopVouchers.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center" }}>Hiện chưa có voucher nào trong cửa hàng.</p>
        ) : (
          <div className="row g-3 mb-5">
            {shopVouchers.map(v => {
              const canAfford = (user?.points ?? 0) >= v.point;
              const rankColor = RANK_COLORS[v.pointRequirement] ?? "#10b981";
              return (
                <div className="col-md-6" key={v.id}>
                  <div className="reward-card" style={{
                    opacity: canAfford ? 1 : 0.6,
                    border: `1px solid ${rankColor}44`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{
                        fontSize: "0.7rem", background: rankColor + "22",
                        color: rankColor, border: `1px solid ${rankColor}44`,
                        padding: "2px 8px", borderRadius: 4, fontWeight: 700
                      }}>
                        {v.pointRequirement || "Tất cả"}
                      </span>
                      <span style={{ color: "#f5d87a", fontSize: "0.75rem", fontWeight: 700 }}>
                        💎 {v.point.toLocaleString()} điểm
                      </span>
                    </div>
                    <p style={{ color: "#f3e5ab", marginBottom: 12, fontSize: "0.95rem", fontWeight: 600 }}>
                      {v.content}
                    </p>
                    <button
                      className="btn-fantasy-outline w-100"
                      disabled={!canAfford || redeemingId === v.id}
                      onClick={() => handleRedeem(v)}
                      style={!canAfford ? { cursor: "not-allowed" } : {}}
                    >
                      {redeemingId === v.id
                        ? "ĐANG ĐỔI..."
                        : canAfford
                          ? `ĐỔI ${v.point.toLocaleString()} ĐIỂM`
                          : `CẦN THÊM ${(v.point - (user?.points ?? 0)).toLocaleString()} ĐIỂM`
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MY VOUCHERS */}
        <div className="divider-dots mb-4"></div>
        <h5 className="mb-3" style={{ color: "#b18c5d", fontFamily: "Cinzel, serif", textAlign: "left" }}>
          🎟️ Kho voucher của bạn
        </h5>
        {myVouchers.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center" }}>Bạn chưa đổi voucher nào.</p>
        ) : (
          <div className="row g-3">
            {myVouchers.map((mv, i) => (
              <div className="col-md-6" key={i}>
                <div className="reward-card" style={{
                  border: mv.isUsed ? "1px solid #333" : "1px solid #b18c5d55",
                  opacity: mv.isUsed ? 0.5 : 1
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{
                      fontSize: "0.7rem", background: mv.isUsed ? "#33333355" : "#b18c5d22",
                      color: mv.isUsed ? "#666" : "#b18c5d",
                      border: `1px solid ${mv.isUsed ? "#333" : "#b18c5d44"}`,
                      padding: "2px 8px", borderRadius: 4
                    }}>
                      {mv.isUsed ? "ĐÃ DÙNG" : "CÒN HIỆU LỰC"}
                    </span>
                    <small style={{ color: "#888" }}>
                      {new Date(mv.redeemedDate).toLocaleDateString("vi-VN")}
                    </small>
                  </div>
                  <p style={{ color: mv.isUsed ? "#666" : "#f3e5ab", marginBottom: 0, fontWeight: 600 }}>
                    {mv.content || mv.idVoucher}
                  </p>
                  {mv.pointRequirement && (
                    <small style={{ color: "#888" }}>Yêu cầu: {mv.pointRequirement}</small>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
}