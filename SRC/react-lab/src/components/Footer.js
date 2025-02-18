import React from 'react';
import './Footer.scss';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>OCTOPUS</h3>
          <p>Nền tảng cung cấp tài khoản premium hàng đầu Việt Nam</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Liên kết nhanh</h4>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/products">Sản phẩm</Link></li>
            <li><Link to="/about">Về chúng tôi</Link></li>
            <li><Link to="/support">Hỗ trợ</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Danh mục</h4>
          <ul>
            <li><Link to="/category/streaming">Streaming</Link></li>
            <li><Link to="/category/education">Giáo dục</Link></li>
            <li><Link to="/category/software">Phần mềm</Link></li>
            <li><Link to="/category/gaming">Gaming</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <ul className="contact-info">
            <li><i className="fas fa-phone"></i> 1900 xxxx</li>
            <li><i className="fas fa-envelope"></i> support@octopus.vn</li>
            <li><i className="fas fa-map-marker-alt"></i> TP. Hồ Chí Minh, Việt Nam</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Octopus. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer;