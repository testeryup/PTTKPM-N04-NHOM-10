import { Navigate, useNavigate } from 'react-router-dom';
import './ProductCard.scss';

export default function ProductCard({ product }) {
    const navigate = useNavigate();
    const handleGetProduct = (productId) => {
        navigate(`/product/${productId}`);
    };
    return (
        <div className="card-container">
            <div className="card-wrapper">
                <div className="card">
                    <div
                        onClick={() => handleGetProduct(product._id)}

                        className="product-image"
                        style={{
                            backgroundImage: `url(${product.thumbnail})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover',
                            backgroundRepeat: 'no-repeat',
                            width: '100%',
                            height: '150px',
                            // borderRadius: '8px'
                        }}
                    />
                    <div className="infor">
                        <div className="price">{product.minPrice ?? 'undefined'}.₫</div>
                        <div className="action">
                            <div className="meta-data">
                                <div
                                    className="name"
                                    title={product.name ?? 'undefined'}
                                    onClick={() => handleGetProduct(product._id)}
                                >{product.name ?? 'undefined'}</div>
                                <div className="seller">{product.seller?.username ?? 'undefined'}</div>
                            </div>
                            {/* <span className="material-symbols-outlined">
                                add_shopping_cart
                            </span> */}
                        </div>
                    </div>
                    <div className='add-to-cart'>
                        <button className='btn-add-cart' onClick={() => handleGetProduct(product._id)}>
                            Xem ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}