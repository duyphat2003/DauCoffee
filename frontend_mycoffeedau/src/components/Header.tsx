import { Container, Nav, Navbar, NavDropdown, Form, FormControl, Button, Badge } from "react-bootstrap";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { categories } from "../data/categories";
import "./Header.css";
import { APP_NAME, IS_ADMIN, IS_LOGIN } from "../constants/GlobalConfig";
import { useCart } from "../context/CartContext"; // ✅ THÊM

export default function Header() {
  const [show, setShow] = useState(false);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const savedUser = localStorage.getItem("user_token");
  const user = savedUser ? JSON.parse(savedUser) : null;

  // ✅ Lấy số lượng item thực từ CartContext
  const { cartItems } = useCart();
  const totalItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) navigate(`/DrinkListPage?keyword=${keyword}`);
  };
  return (
    <Navbar expand="lg" className="fantasy-navbar" sticky="top">
      <Container>
        {/* 1. BRAND */}
        <Navbar.Brand as={Link} to="/" className="brand d-flex align-items-center gap-2">
          <img 
            src="/images/Minimalist Vietnamese coffee branding logo.png" 
            alt="logo" 
            className="brand-logo" 
          />
          <span style={{ textTransform: 'uppercase' }}>{APP_NAME}</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="nav-collapse" className="bg-warning border-0" />

        <Navbar.Collapse id="nav-collapse">
          {/* 2. MENU CHÍNH (Căn giữa) */}
          <Nav className="mx-auto nav-links align-items-center">
            <NavDropdown
              title="Danh mục"
              id="category-dropdown"
              show={show}
              onMouseEnter={() => setShow(true)}
              onMouseLeave={() => setShow(false)}
              className="fantasy-dropdown"
            >
              {categories.map((c) => (
                <NavDropdown.Item key={c.id} onClick={() => navigate(`/DrinkListPage?category=${c.id}`)}>
                  {c.name}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <Nav.Link as={Link} to="/DrinkListPage">Sản phẩm</Nav.Link>
            <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
          </Nav>

          {/* 3. CỤM ACTION (Bên phải) */}
          <div className="d-flex align-items-center gap-3">
            
            {/* Thanh Tìm Kiếm */}
            <Form className="search-container d-none d-xl-flex" onSubmit={handleSearch}>
              <FormControl
                type="search"
                placeholder="Tên nước uống..."
                className="search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onSubmit={() => handleSearch}
              />
              <Button type="submit" className="search-btn">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </Button>
            </Form>

            {/* Giỏ hàng — ✅ Hiển thị số lượng thực */}
            <div className="cart-wrapper" onClick={() => navigate("/cart")}>
              <span>🛒</span>
              {totalItemCount > 0 && (
                <Badge pill className="cart-count">{totalItemCount}</Badge>
              )}
            </div>

            {/* User Badge */}
            {IS_LOGIN ? (
              <div className="user-badge" onClick={() => navigate("/profile")}>
                <img 
                  src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.email}`} 
                  className="user-avatar" 
                  alt="avatar" 
                />
                <div className="user-info-text d-none d-md-block">
                  <span className="user-name">{user?.nameDisplay}</span>
                  <span className="user-exp">⭐ {user?.points ?? 0} điểm</span>
                </div>
              </div>
            ) : (
              <Button variant="outline-warning" className="rounded-pill btn-sm px-3" onClick={() => navigate(IS_ADMIN ? "/admin" : "/auth")}>
                  { IS_ADMIN ? "ADMIN" : "ĐĂNG NHẬP"} 
              </Button>
            )}

          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}