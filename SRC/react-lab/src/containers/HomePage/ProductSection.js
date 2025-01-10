import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ProductSection.scss';
export default function ProductSection() {
    const setting = {
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
    };
    return (
        <>
            <div className="product-slider-container">
                <div className="product-slider-wrapper">
                    <div className="product-slider">
                        <div className='heading'>
                            <div className='vertical-bar'></div>
                            <h1 className='header'>Hàng mới về</h1>
                        </div>
                        <Slider {...setting}>
                            <div className='product-item'>
                                <img src={require('../../assets/products/Canva-giahan-1nam-13476.png')} alt=''></img>
                                <div><h4>Canva Premium 1 năm</h4></div>
                            </div>
                            <div className='product-item'>
                                <img src={require('../../assets/products/ChatGPT.png')} alt=''></img>
                                <div><h4>ChatGPT Premium</h4></div>
                            </div>
                            <div className='product-item'>
                                <img src={require('../../assets/products/Windows 10 Professional CD Key-22736.png')} alt=''></img>
                                <div><h4>Key Windows 10 Pro</h4></div>
                            </div>
                            <div className='product-item'>
                                <img src={require('../../assets/products/YouTube Premium Music-1nam-65910.png')} alt=''></img>
                                <div><h4>YouTube Premium Music</h4></div>
                            </div>
                            <div className='product-item'>
                                <img src={require('../../assets/products/Zoom Pro 28d-58614.png')} alt=''></img>
                                <div><h4>Zoom Pro</h4></div>
                            </div>
                        </Slider>
                    </div>
                </div>
            </div>
        </>
    )
}