import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from '../../components/Loading';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../../features/cart/cartSlice';
import { userGetProductById } from '../../services/userService';
import { formatCurrency, path } from '../../ultils';
import toast from 'react-hot-toast';
import './ProductDetail.scss';
import UserHeader from '../Header/UserHeader';

export default function ProductDetail() {
    const [selectedImage, setSelectedImage] = useState(0);
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSku, setSelectedSku] = useState({});
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const result = await userGetProductById(productId);
                if (result.errCode === 0) {
                    const sortedSkus = [...result.data.skus].sort((a, b) => a.price - b.price);
                    setProduct({ ...result.data, skus: sortedSkus });
                    setSelectedSku(sortedSkus[0]);
                }
            } catch (error) {
                setError(error.message);
                toast.error('Không thể tải thông tin sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        if (productId) fetchProduct();
    }, [productId]);

    const handleAddToCart = () => {
        dispatch(addToCart({
            product,
            sku: selectedSku,
            quantity: selectedQuantity
        }));
        toast.success('Thêm vào giỏ hàng thành công');
    };

    const handleBuyNow = () => {
        dispatch(addToCart({
            product,
            sku: selectedSku,
            quantity: selectedQuantity
        }));

        navigate(path.CHECKOUT, {
            state: {
                items: [{
                    productId: product._id,
                    skuId: selectedSku._id,
                    name: product.name,
                    skuName: selectedSku.name,
                    price: selectedSku.price,
                    quantity: selectedQuantity,
                    image: product.images[0]
                }]
            }
        });
    };

    const handleSkuChange = (value) => {
        setSelectedSku(product.skus.find(sku => sku._id === value));
    };

    const handleQuantityChange = (value) => {
        setSelectedQuantity(parseInt(value));
    };

    if (loading) return (
        <>
            <UserHeader />
            <div className="loading-container">
                <Loading />
            </div>
        </>
    );

    if (error) return (
        <>
            <UserHeader />
            <div className="error-container">
                <i className="fas fa-exclamation-circle"></i>
                <h2>Đã có lỗi xảy ra</h2>
                <p>{error}</p>
                <button onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        </>
    );

    if (!product) return (
        <>
            <UserHeader />
            <div className="not-found-container">
                <i className="fas fa-search"></i>
                <h2>Không tìm thấy sản phẩm</h2>
                <button onClick={() => navigate('/products')}>Xem sản phẩm khác</button>
            </div>
        </>
    );

    const maxQuantity = Math.min(selectedSku.stock, 10);
    const quantityOptions = Array.from({ length: maxQuantity }, (_, i) => (
        <option key={i + 1} value={i + 1}>
            {i + 1}
        </option>
    ));

    return (
        <>
            <UserHeader />
            <div className="product-detail-container">
                <div className="breadcrumb">
                    <button onClick={() => navigate(-1)}>
                        <i className="fas fa-arrow-left"></i>
                        Quay lại
                    </button>
                    <span>/</span>
                    <span>{product.category}</span>
                    <span>/</span>
                    <span>{product.name}</span>
                </div>

                <div className="product-detail-wrapper">
                    <div className="product-gallery">
                        <div className="image-thumbnails">
                            {product.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                                    onMouseEnter={() => setSelectedImage(index)}
                                >
                                    <img src={img} alt={`${product.name} view ${index + 1}`} />
                                </div>
                            ))}
                        </div>
                        <div 
                            className={`main-image ${isImageZoomed ? 'zoomed' : ''}`}
                            onClick={() => setIsImageZoomed(!isImageZoomed)}
                        >
                            <img src={product.images[selectedImage]} alt={product.name} />
                            <div className="zoom-hint">
                                <i className="fas fa-search-plus"></i>
                                Click để phóng to
                            </div>
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="product-header">
                            <h1>{product.name}</h1>
                            <div className="seller-info">
                                <i className="fas fa-store"></i>
                                <span>Cung cấp bởi</span>
                                <a href="#">{product.seller.username}</a>
                            </div>
                        </div>

                        <div className="product-price">
                            <div className="current-price">
                                <span>{formatCurrency(selectedSku.price)}</span>
                                <span className="currency">₫</span>
                            </div>
                            {selectedSku.originalPrice > selectedSku.price && (
                                <div className="original-price">
                                    <span>{formatCurrency(selectedSku.originalPrice)}₫</span>
                                    <span className="discount">
                                        -{Math.round((1 - selectedSku.price/selectedSku.originalPrice) * 100)}%
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="product-options">
                            <div className="option-group">
                                <label>Chọn gói:</label>
                                <select 
                                    value={selectedSku._id} 
                                    onChange={(e) => handleSkuChange(e.target.value)}
                                    className="sku-select"
                                >
                                    {product.skus.map(sku => (
                                        <option key={sku._id} value={sku._id}>
                                            {sku.name} - {formatCurrency(sku.price)}₫
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="option-group">
                                <label>Số lượng:</label>
                                <div className="quantity-controls">
                                    <button 
                                        onClick={() => handleQuantityChange(Math.max(1, selectedQuantity - 1))}
                                        disabled={selectedQuantity === 1}
                                    >
                                        <i className="fas fa-minus"></i>
                                    </button>
                                    <select 
                                        value={selectedQuantity}
                                        onChange={(e) => handleQuantityChange(e.target.value)}
                                    >
                                        {quantityOptions}
                                    </select>
                                    <button 
                                        onClick={() => handleQuantityChange(Math.min(maxQuantity, selectedQuantity + 1))}
                                        disabled={selectedQuantity === maxQuantity}
                                    >
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="stock-status">
                            <i className={`fas ${selectedSku.stock > 0 ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            <span className={selectedSku.stock > 0 ? 'in-stock' : 'out-of-stock'}>
                                {selectedSku.stock > 0 ? `Còn ${selectedSku.stock} sản phẩm` : 'Hết hàng'}
                            </span>
                        </div>

                        <div className="action-buttons">
                            <button 
                                className="add-to-cart"
                                onClick={handleAddToCart}
                                disabled={selectedSku.stock === 0}
                            >
                                <i className="fas fa-shopping-cart"></i>
                                Thêm vào giỏ hàng
                            </button>
                            <button 
                                className="buy-now"
                                onClick={handleBuyNow}
                                disabled={selectedSku.stock === 0}
                            >
                                <i className="fas fa-bolt"></i>
                                Mua ngay
                            </button>
                        </div>

                        <div className="product-features">
                            <div className="feature">
                                <i className="fas fa-shield-alt"></i>
                                <div>
                                    <h4>Bảo mật thanh toán</h4>
                                    <p>An toàn tuyệt đối</p>
                                </div>
                            </div>
                            <div className="feature">
                                <i className="fas fa-bolt"></i>
                                <div>
                                    <h4>Giao dịch tức thì</h4>
                                    <p>Nhận hàng ngay lập tức</p>
                                </div>
                            </div>
                            <div className="feature">
                                <i className="fas fa-headset"></i>
                                <div>
                                    <h4>Hỗ trợ 24/7</h4>
                                    <p>Luôn sẵn sàng hỗ trợ</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="product-description">
                        <h2>Mô tả sản phẩm</h2>
                        <div className="description-content">
                            {product.description.split('\n').map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}