import { useParams, useNavigate } from "react-router-dom";
import "./DrinkDetail.css";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import type { Review } from "../../models/review";
import { ReviewService, CategoryService, DrinkService, FavoriteService } from "../../constants/APIService";
import type { Drink } from "../../models/drink";
import type { Category } from "../../models/category";
import { IS_LOGIN, CURRENT_USER } from "../../constants/GlobalConfig";

export default function DrinkDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // States
  const [drink, setDrink] = useState<Drink | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // States cho form đánh giá mới
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // State cho yêu thích
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [resDrink, resReviews] = await Promise.all([
          DrinkService.getById(id),
          ReviewService.getByDrink(id),
        ]);

        setDrink(resDrink);
        setReviewList(resReviews);

        if (resDrink?.categoryId) {
          const resCats = await CategoryService.getAll();
          const found = resCats.find((c) => c.id === resDrink.categoryId);
          setCategory(found || null);
        }

        // Kiểm tra xem đã yêu thích chưa
        if (IS_LOGIN && CURRENT_USER?.id) {
          try {
            const favList = await FavoriteService.getByUser(CURRENT_USER.id);
            const alreadyFav = favList.some(
              (f: any) => (f.idDrink ?? f.IdDrink ?? f.id_drink) === id
            );
            setIsFavorite(alreadyFav);
          } catch {
            // Bỏ qua lỗi kiểm tra yêu thích
          }
        }
      } catch (error) {
        console.error("Lỗi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Xử lý gửi đánh giá
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert("Lữ khách vui lòng để lại vài lời bình luận!");
      return;
    }

    try {
      setSubmitting(true);
      const reviewData: any = {
        drinkId: id,
        userName: "Duy Phát", // Giả lập user, thực tế lấy từ Auth Context
        rating: newRating,
        comment: newComment,
        avatar: "https://i.pravatar.cc/100?u=phat",
        date: new Date().toISOString()
      };

      await ReviewService.create(reviewData);
      
      // Load lại danh sách review
      const updatedReviews = await ReviewService.getByDrink(id!);
      setReviewList(updatedReviews);
      
      // Reset form
      setNewComment("");
      setNewRating(5);
      alert("Cảm ơn lữ khách đã để lại lời bình!");
    } catch (error) {
      alert("Tạm thời không thể gửi lời bình. Hãy thử lại sau!");
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý toggle yêu thích
  const handleToggleFavorite = async () => {
    if (!IS_LOGIN) {
      navigate('/auth');
      return;
    }
    if (!CURRENT_USER?.id || !id) return;
    try {
      setFavLoading(true);
      if (isFavorite) {
        await FavoriteService.remove(CURRENT_USER.id, id);
        setIsFavorite(false);
      } else {
        await FavoriteService.add(CURRENT_USER.id, id);
        setIsFavorite(true);
      }
    } catch (error) {
      alert("Không thể cập nhật yêu thích. Hãy thử lại!");
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) return <div className="text-center p-5 gold-text">Đang khai mở thông tin...</div>;
  if (!drink) return <div className="text-center p-5">Không tìm thấy món nước này.</div>;

  return (
    <div className="drink-detail-container container py-5">
      <div className="row g-5">
        {/* CỘT TRÁI: HÌNH ẢNH */}
        <div className="col-md-6">
          <div className="image-wrapper-fantasy">
            <img 
              src={drink.image.startsWith('/') ? drink.image : `/${drink.image}`} 
              alt={drink.name} 
              className="img-fluid drink-img-main" 
            />
          </div>
        </div>

        {/* CỘT PHẢI: THÔNG TIN */}
        <div className="col-md-6">
          <div className="info-panel-fantasy">
            <span className="category-tag">{category?.name || "Đồ uống"}</span>
            <h1 className="drink-title-main">{drink.name}</h1>
            <div className="price-tag-large mb-4">
              {drink.price.toLocaleString()} VNĐ
            </div>
            
            <p className="drink-description-detail">
              {drink.description || "Một món nước tuyệt vời được pha chế theo công thức bí truyền của quán."}
            </p>

            <div className="ingredients-box">
              <span className="gold-text fw-bold">Thành phần chủ đạo:</span>
              <p className="mb-0">Arabica, Robusta, Sữa đặc nguyên chất.</p>
            </div>

            <div className="d-flex gap-3 mt-4">
              <button className="btn-fantasy-secondary" onClick={() => navigate(-1)}>QUAY LẠI</button>
              <button
                className={`btn-favorite-fantasy ${isFavorite ? "is-favorited" : ""}`}
                onClick={handleToggleFavorite}
                disabled={favLoading}
                title={isFavorite ? "Bỏ yêu thích" : "Lưu yêu thích"}
              >
                <span className="fav-heart">{isFavorite ? "♥" : "♡"}</span>
                <span className="fav-label">{isFavorite ? "ĐÃ LƯU" : "YÊU THÍCH"}</span>
              </button>
              <button className="btn-fantasy-buy flex-grow-1" onClick={() => addToCart(drink)}>THƯỞNG THỨC NGAY</button>
            </div>
          </div>
        </div>
      </div>

      <hr className="fantasy-divider my-5" />

      {/* PHẦN ĐÁNH GIÁ */}
      <div className="review-section mt-5">
        <h3 className="section-title-fantasy mb-4">Lời bình từ lữ khách</h3>

        {/* FORM THÊM ĐÁNH GIÁ */}
        {IS_LOGIN ? (
          <div className="review-form-fantasy mb-5 p-4">
            <h5 className="gold-text mb-3">Gửi lời bình của bạn</h5>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-3">
                <label className="d-block mb-1 text-muted">Mức độ hài lòng:</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`star-clickable ${star <= newRating ? "star-gold" : "star-gray"}`}
                      onClick={() => setNewRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-3">
                <textarea 
                  className="fantasy-textarea w-100" 
                  rows={3} 
                  placeholder="Hãy chia sẻ cảm nhận của bạn về hương vị này..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn-fantasy-buy" disabled={submitting}>
                {submitting ? "ĐANG GỬI..." : "XÁC NHẬN GỬI"}
              </button>
            </form>
          </div>
        ) : (
          <div className="login-prompt mb-5 p-3 text-center border-dashed">
             <p className="mb-0 text-muted">
                Bạn cần <b className="gold-text" style={{cursor:'pointer'}} onClick={() => navigate('/auth')}>đăng nhập</b> để chia sẻ cảm nhận.
             </p>
          </div>
        )}

        {/* DANH SÁCH REVIEW */}
        <div className="reviews-scroll-container">
          <div className="reviews-list">
            {reviewList.length > 0 ? (
              reviewList.map((rev) => (
                <div className="review-card-fantasy" key={rev.id}>
                  <div className="review-header">
                    <div className="visitor-info">
                      <img 
                        src={rev.avatar || "https://via.placeholder.com/50"} 
                        alt="avatar" 
                        className="visitor-avatar" 
                      />
                      <div>
                        <h6 className="visitor-name">{rev.userName}</h6>
                        <div className="rating-stars">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < rev.rating ? "star-gold" : "star-gray"}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-center text-muted">Chưa có lữ khách nào để lại lời bình cho món này.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}