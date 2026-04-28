import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaWhatsapp } from "react-icons/fa"; 
import { SiZalo } from "react-icons/si"; 
import "./Footer.css";
import { APP_NAME, IS_LOGIN } from "../constants/GlobalConfig";

export default function Footer() {
  return (
    <footer className="fantasy-footer">
      <Container>
        <Row className="justify-content-between">
          {/* Cột 1: Brand & Bio */}
          <Col lg={4} md={12} className="mb-5 text-start">
            <Link to="/" className="footer-brand">
              <img 
                src="/images/Minimalist Vietnamese coffee branding logo.png" 
                alt="logo" 
                className="footer-logo" 
              />
              <span style={{ textTransform: 'uppercase' }}>{APP_NAME}</span>
            </Link>
            <p className="footer-description">
              Hương vị huyền bí.
            </p>
            <div className="social-icons">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <FaFacebookF />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-item">
                <FaYoutube />
              </a>
              <a href="#" className="social-item">
                <SiZalo />
              </a>
              <a href="#" className="social-item">
                <FaWhatsapp />
              </a>
            </div>
          </Col>

          {/* Cột 2: Danh mục */}
          <Col lg={2} md={4} sm={6} className="mb-4 text-start">
            <h5 className="footer-title">Giới thiệu</h5>
            <ul className="footer-links">
              <li><Link to="/about">Về {APP_NAME}</Link></li>
              <li><Link to="/policies/shipping">Chính sách giao hàng</Link></li>
              <li><Link to="/policies/payment">Chính sách thanh toán</Link></li>
              <li><Link to="/policies/rewards">Chính sách đổi thưởng</Link></li>
            </ul>
          </Col>

          {/* Cột 3: Tin tức */}
          <Col lg={2} md={4} sm={6} className="mb-4 text-start">
            <h5 className="footer-title">Bảng Tin</h5>
            <ul className="footer-links">
              <li><Link to="/activities">Hoạt động</Link></li>
              <li><Link to="/career">Việc làm</Link></li>
              <li><Link to="/location">Địa điểm</Link></li>
            </ul>
          </Col>

          {/* Cột 4: Tài khoản */}
          <Col lg={2} md={4} sm={12} className="mb-4 text-start">
            <h5 className="footer-title">Cá nhân</h5>
            <ul className="footer-links">
              <li><Link to={IS_LOGIN ? "/profile" : "/auth"}>Thông tin</Link></li>
              <li><Link to={IS_LOGIN ? "/profile/orders" : "/auth"}>Lịch sử đơn hàng</Link></li>
              <li><Link to={IS_LOGIN ? "/profile/favorites" : "/auth"}>Nước uống yêu thích</Link></li>
              <li><Link to={IS_LOGIN ? "/support" : "/auth"}>Hỗ trợ</Link></li>
            </ul>
          </Col>
        </Row>

        <Row className="footer-bottom">
          <Col className="text-center">
            <small>© 2026 ĐẬU COFFEE - THẾ GIỚI NƯỚC UỐNG.</small>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}