import { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, Carousel } from 'react-bootstrap';
import './Home.css';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CategoryService, DrinkService, ReviewService } from '../../constants/APIService';
import type { Drink } from '../../models/drink';
import type { Review } from '../../models/review';
import type { Category } from '../../models/category';

const banners = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1501339819398-ee49a94b3b1c",
    title: "Đậu Coffee",
    subtitle: "Hương vị từ những hạt đậu cổ xưa",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",
    title: "Cold Brew Đậm Đà",
    subtitle: "Mát lạnh - tỉnh táo",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1511920170033-f8396924c348",
    title: "Trà Trái Cây",
    subtitle: "Tươi mới mỗi ngày",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
    title: "Cà Phê Rang Xay",
    subtitle: "Đậm chất fantasy",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
    title: "Combo Ưu Đãi",
    subtitle: "Giảm giá cực mạnh",
  },
];

export default function Home() {
  const [rotation, setRotation] = useState(0);
  const [selectedCatId, setSelectedCatId] = useState<number>(1);
  const rotateNext = () => setRotation((prev: number) => prev - 36); // 360 độ / 10 món = 36 độ mỗi lần quay
  const rotatePrev = () => setRotation((prev: number) => prev + 36);

  const [drinkList, setDrinkList] = useState<Drink[]>([]);
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  
useEffect(() => {
  const fetchData = async () => {
    try {
      // Gọi song song cả 2 để bổ trợ dữ liệu cho nhau
      const [resDrinks, resReviews, resCategories] = await Promise.all([
        DrinkService.getAll(),
        ReviewService.getAll(),
        CategoryService.getAll(),
      ]);
      setDrinkList(resDrinks);
      setReviewList(resReviews);
      setCategoryList(resCategories);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    }
  };
  fetchData();
}, []);

  const featuredDrinks = drinkList
  .filter(drink => drink.isFeatured === true)
  .slice(0, 10);
  const displayedReviews = reviewList.slice(0, 10);
  const filteredDrinks = drinkList.filter(drink => {
    if (selectedCatId === 8) return drink.isBestSeller;
    if (selectedCatId === 9) return drink.isFeatured;
    return drink.categoryId === categoryList[selectedCatId].id;
  }).slice(0, 10); // Giới hạn 10 món như bạn muốn
  
  const { addToCart } = useCart();
  return (
    <div className="home-container">
      {/* 1. BANNER QUẢNG CÁO */}
      <section className="hero-banner">
        <Carousel fade interval={3000} pause="hover">
          {banners.map((banner) => (
            <Carousel.Item key={banner.id}>
              <div
                className="hero-slide"
style={{
      backgroundImage: `linear-gradient(to bottom, rgba(26,15,10,0.3), rgba(26,15,10,0.9)), url(${banner.image})`,
    }}
              >
                <div className="hero-content">
<h1 className="animate__animated animate__fadeInDown">{banner.title}</h1>                  
<p className="fs-4 italic animate__animated animate__fadeInUp">{banner.subtitle}</p>                  <Button
                    variant="warning"
                    size="lg"
                    className="rounded-pill px-5 fw-bold shadow"
                  >
                    THỬ NGAY
                  </Button>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      <Container className="pb-5">
        {/* 2. TOP DANH SÁCH NƯỚC UỐNG ĐỀ NGHỊ */}
        <div className="carousel-3d-container">
          <h2 className="section-title">Danh sách nước uống đề nghị</h2>
          <div className="carousel-view">
            <div 
              className="carousel-ring" 
              style={{ transform: `rotateY(${rotation}deg)` }}
            >
              {featuredDrinks.map((item, index) => {
                  const handleAddToCart = () => {
                  addToCart(item);
                  alert("Đã thêm vào túi hành trang!");
                };
                return(
                <div  
                  key={item.id} 
                  className="carousel-item-3d" 
                  style={{ transform: `rotateY(${index * 36}deg) translateZ(450px)` }}
                  onClick={() => console.log("Bạn đã chọn:", item.name)}
                >
                  <div className="c3d-card">

                    <div className="c3d-img-wrapper">

                      {/* 🏷️ TAG TREO */}
                      {(item.isBestSeller || item.isFeatured) && (
                        <div className="c3d-tag-rope">
                          {item.isBestSeller && <span className="c3d-tag c3d-bestseller">Best</span>}
                          {item.isFeatured && <span className="c3d-tag c3d-hot">Hot</span>}
                        </div>
                      )}

                      {/* 🔖 SALE */}
                      {item.isPromotion && (
                        <div className="c3d-sale-badge">
                          -{item.promotionPercent}%
                        </div>
                      )}

                      <Link to={`/drinkdetail/${item.id}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          draggable="false"
                          className="c3d-img"
                        />
                      </Link>
                    </div>

                    <div className="c3d-info">

                      <h5 className="c3d-title">{item.name}</h5>

                      {/* 💰 PRICE */}
                      <div className="c3d-price-box">
                        {item.isPromotion ? (
                          <>
                            <span className="c3d-old-price">
                              {item.price.toLocaleString()}đ
                            </span>
                            <span className="c3d-new-price">
                              {Math.round(
                                item.price * (1 - item.promotionPercent / 100)
                              ).toLocaleString()}đ
                            </span>
                          </>
                        ) : (
                          <span className="c3d-new-price">
                            {item.price.toLocaleString()}đ
                          </span>
                        )}
                      </div>

                      {/* 🛒 BUTTON */}
                      <button className="c3d-add-cart-btn" onClick={handleAddToCart}>
                        🛒 Thêm
                      </button>

                    </div>
                  </div>
                </div>
              );})}
            </div>
          </div>

          {/* Mũi tên điều hướng */}
          <div className="carousel-controls">
            <button onClick={rotatePrev} className="nav-btn prev" aria-label="Previous">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            
            <button onClick={rotateNext} className="nav-btn next" aria-label="Next">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 3. DANH SÁCH THEO CATEGORY (Dạng Tab hoặc Grid rút gọn) */}
        <Container className="my-5">
          {/* --- PHẦN 1: HÀNG DANH MỤC (TABS TRÒN) --- */}
          <h2 className="section-title text-center mb-5">Danh Mục Nước Uống</h2>
          <Row className="justify-content-center mb-5">
            {categoryList.map((cat, index) => (
              <Col xs={6} sm={4} md={2} key={cat.id} className="mb-4">
                <div 
                  onClick={() => setSelectedCatId(index)}
                  className={`category-circle ${selectedCatId === index ? 'active' : ''}`}
                >
                  <div className="circle-content">
                    <img src={cat.image} alt={cat.name} className="cat-img" />
                    <span className="cat-name">{cat.name}</span>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {/* --- PHẦN 2: DANH SÁCH NƯỚC UỐNG TƯƠNG ỨNG --- */}
          <Row>
            {filteredDrinks.map((drink) => {
              const handleAddToCart = () => {
                addToCart(drink);
                alert("Đã thêm vào túi hành trang!");
              };
              return (
              <Col key={drink.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="drink-card h-100 border-0">

                  <div className="position-relative overflow-hidden">

                    {/* 🏷️ TAG TREO (Bestseller + Hot) */}
                    {(drink.isBestSeller || drink.isFeatured) && (
                      <div className="tag-rope">
                        {drink.isBestSeller && <span className="tag bestseller">Bestseller</span>}
                        {drink.isFeatured && <span className="tag hot">Hot</span>}
                      </div>
                    )}

                    {/* 🔖 SALE (BÊN PHẢI) */}
                    {drink.isPromotion && (
                      <div className="sale-badge">
                        -{drink.promotionPercent}%
                      </div>
                    )}

                    <Link to={`/drinkdetail/${drink.id}`}>
                      <Card.Img
                        variant="top"
                        src={drink.image}
                        className="drink-img"
                      />
                    </Link>
                  </div>

                  <Card.Body className="text-center d-flex flex-column justify-content-between">

                    <div className="title-wrapper">
                      <Card.Title className="drink-title">{drink.name}</Card.Title>
                    </div>

                    <div className="mt-2 price-box">
                      {drink.isPromotion ? (
                        <>
                          <span className="old-price">
                            {drink.price.toLocaleString()}đ
                          </span>

                          <span className="new-price">
                            {Math.round(
                              drink.price * (1 - drink.promotionPercent / 100)
                            ).toLocaleString()}đ
                          </span>
                        </>
                      ) : (
                        <span className="new-price">
                          {drink.price.toLocaleString()}đ
                        </span>
                      )}
                    </div>

                    {/* 🛒 ADD TO CART */}
                    <button className="add-cart-btn" onClick={handleAddToCart}>
                      🛒 Thêm
                    </button>

                  </Card.Body>
                </Card>
              </Col>);
            })}
          </Row>
        </Container>

        {/* 4. DANH SÁCH ĐÁNH GIÁ */}
        <h2 className="section-title">Lời khen từ khách quý</h2>

        <div className="review-container">
          <Row>
            {displayedReviews.map((r) => {
              const drink = drinkList.find(d => d.id === r.idDrink);
              return (<Col md={6} key={r.id}>
                <div className="review-box">

                  {/* HEADER */}
                  <div className="review-header">
                    <img src={r.avatar} className="review-avatar" />

                    <div>
                      <div className="reviewer-name">{r.userName}</div>
                      <div className="review-drink">{drink?.name}</div>
                    </div>
                  </div>

                  {/* STARS */}
                  <div className="stars">
                    {"⭐".repeat(r.rating)}
                  </div>

                  {/* COMMENT */}
                  <p className="review-comment">"{r.comment}"</p>

                </div>
              </Col>);
            })}
          </Row>
        </div>
      </Container>
    </div>
  );
}