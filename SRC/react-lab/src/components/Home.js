import UserHeader from "../containers/Header/UserHeader";
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.scss';
import ProductSection from "../containers/HomePage/ProductSection";
import Footer from "./Footer";
export default function Home() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        fade: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        beforeChange: (current, next) => {
            const items = document.querySelectorAll('.banner-item');
            items[current]?.classList.add('slide-out');
            items[next]?.classList.add('slide-in');
        },
        afterChange: (current) => {
            const items = document.querySelectorAll('.banner-item');
            items.forEach(item => {
                item.classList.remove('slide-out', 'slide-in');
            });
        }
    };
    return (
        <div className="home-container">
            <UserHeader></UserHeader>
            <div className="banner-section">
                <Slider {...settings}>
                    <div className="banner-item">
                        <img src={require('../assets/banner/Netflix.png')} alt="Netflix" />
                    </div>
                    <div className="banner-item">
                        <img src={require('../assets/banner/Youtube2.png')} alt="Youtube" />
                    </div>
                    <div className="banner-item">
                        <img src={require('../assets/banner/iQIYI2.png')} alt="iQIYI2" />
                    </div>
                    <div className="banner-item">
                        <img src={require('../assets/banner/AntiVirus.png')} alt="AntiVirus" />
                    </div>
                    <div className="banner-item">
                        <img src={require('../assets/banner/HocTapPhatTrien.png')} alt="HocTapPhatTrien" />
                    </div>
                </Slider>
            </div>
            <div className="features-section">
                <div className="feature">
                    <i className="fas fa-shield-alt"></i>
                    <h3>Bảo mật tuyệt đối</h3>
                    <p>Thanh toán an toàn 100%</p>
                </div>
                <div className="feature">
                    <i className="fas fa-bolt"></i>
                    <h3>Tức thì</h3>
                    <p>Kích hoạt tài khoản ngay</p>
                </div>
                <div className="feature">
                    <i className="fas fa-headset"></i>
                    <h3>Hỗ trợ 24/7</h3>
                    <p>Luôn sẵn sàng phục vụ</p>
                </div>
            </div>
            <ProductSection></ProductSection>
            <Footer></Footer>
        </div>
    )
}