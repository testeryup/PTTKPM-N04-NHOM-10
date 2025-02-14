import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './ProductSection.scss';
import ProductCard from './ProductCard';
import { getProducts } from '../../services/userService';

import { useState, useEffect } from 'react';
import Loading from '../../components/Loading';;

export default function ProductSection() {
    const settings = {
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        infinite: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            }
        ]
    };

    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const result = await getProducts();
                if (result.errCode === 0) {
                    setProducts(result.data);
                }
                else {
                    throw new Error("An error occured when fetching data:", result);
                }
            } catch (error) {
                setError(error.message || error);
            }
            setLoading(false);
        }
        fetchProducts();
    }, [])
    if (loading) return (<Loading></Loading>);
    if (error) {
        console.log("error from product slider container:", error);
    }
    console.log("check products:", products)
    return (
        <>
            <div className="product-slider-container">
                <div className="product-slider-wrapper">
                    <div className="product-slider">
                        <div className='heading'>
                            <div className='vertical-bar'></div>
                            <h1 className='header'>Hàng mới về</h1>
                        </div>
                        <Slider {...settings}>
                            {
                                products.map(product => (
                                    <ProductCard product={product} key={product._id}></ProductCard>
                                ))
                            }
                            {/* <div className='product-item'>
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
                            </div> */}
                        </Slider>
                    </div>
                </div>
            </div>
        </>
    )
}