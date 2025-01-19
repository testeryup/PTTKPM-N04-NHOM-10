import './SellerProduct.scss';
import NewProductModal from './Modal/NewProductModal';
import { useState, useEffect } from 'react';
import { toast, Bounce } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Add this import

export default function SellerProducts() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    }
    return (<>
        <div className="seller-product-container">
            <div className="seller-product-wrapper">
                <div className="seller-product">
                    <div className='heading'>
                        <span><h1 className='title'>Sản phẩm</h1></span>
                        <button className='btn-add-product' onClick={toggleModal}>
                            <span className="material-symbols-outlined">add</span>
                            Thêm sản phẩm</button>
                    </div>
                </div>
            </div>
        </div>
        <NewProductModal
            isOpen={isModalOpen}
            onClose={toggleModal}
        ></NewProductModal>

    </>)
}