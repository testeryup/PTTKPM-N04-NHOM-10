import UserHeader from "../containers/Header/UserHeader";
import React from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.scss';
import ProductSection from "../containers/HomePage/ProductSection";

export default function Home() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        fade: true, // Enable fade transition
        cssEase: 'linear', // Change easing function
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
            <ProductSection></ProductSection>
        </div>
    )
}