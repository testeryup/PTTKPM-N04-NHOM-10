import './SellerProduct.scss';
import NewProductModal from './Modal/NewProductModal';
import InventoryModal from './Modal/InventoryModal';

import { useState, useEffect } from 'react';
import { getCategory } from '../../../services/userService';
import { getAllProducts, deleteProduct } from '../../../services/sellerService';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../../ultils';

const ModalTypes = {
    NONE: 'NONE',
    NEW_PRODUCT: 'NEW_PRODUCT',
    INVENTORY: 'INVENTORY'
};

export default function SellerProducts() {
    const [categoriesList, setCategoriesList] = useState([]);
    const [products, setProducts] = useState([]);

    const [activeModal, setActiveModal] = useState(ModalTypes.NONE);
    const [mode, setMode] = useState('create');
    const [selectedProductId, setSelectedProductId] = useState(null);
    const handleDeleteProduct = async (productId) => {
        try {
            const result = await deleteProduct(productId);
            console.log("check delete result:", result);
            if (result?.errCode === 0) {
                toast.success("Xoá sản phẩm thành công")
                setProducts(products => products.filter(p => p._id !== productId));
                return;
            }
            throw new Error("Xoá sản phẩm thất bại");

        } catch (error) {
            toast.error("Xoá sản phẩm thất bại");
            console.log("delete product error:", error);
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            let products = await getAllProducts();
            setProducts(products?.data || []);
        }

        if (activeModal === ModalTypes.NONE) {
            fetchProducts();
        }
    }, [activeModal]);

    useEffect(() => {
        const fetchCategoriesList = async () => {
            let categories = await getCategory();
            console.log("Category List:", categories);
            setCategoriesList(categories);
        }
        fetchCategoriesList();
    }, []);


    const openUpdateModal = (productId) => {
        setSelectedProductId(productId);
        setMode('update');
        setActiveModal(ModalTypes.NEW_PRODUCT);
    };
    const openCreateModal = () => {
        setActiveModal(ModalTypes.NEW_PRODUCT);
        setMode('create');
    }
    const closeModal = () => {
        setActiveModal(ModalTypes.NONE);
        setSelectedProductId(null);
    }
    const openInventoryModal = (productId) => {
        console.log("check product Id:", productId);
        setSelectedProductId(productId);
        setActiveModal(ModalTypes.INVENTORY);
    }



    return (<>
        <div className="seller-product-container">
            <div className="seller-product-wrapper">
                <div className="seller-product">
                    <div className='heading'>
                        <span><h1 className='title'>Sản phẩm</h1></span>
                        <button className='btn-add-product' onClick={openCreateModal}>
                            <span className="material-symbols-outlined">add</span>
                            Thêm sản phẩm</button>
                    </div>
                    <div className='seller-products-container'>
                        <div className='seller-products'>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Hình ảnh</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Doanh số</th>
                                        <th>Doanh thu</th>
                                        <th>Kho hàng</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        products && products.map(
                                            product =>
                                            (
                                                <tr key={product._id}>
                                                    <td>
                                                        <div
                                                            className="td-image"
                                                            style={{
                                                                backgroundImage: `url(${product.thumbnail})`,
                                                                backgroundPosition: 'center',
                                                                backgroundSize: 'contain',
                                                                backgroundRepeat: 'no-repeat',
                                                                width: '125px',
                                                                height: '75px',
                                                                borderRadius: '8px'
                                                            }}
                                                        />
                                                    </td>
                                                    <td className='pd-name'>
                                                        <strong>{product.name}</strong>
                                                        <div className='pd-description'>
                                                            {product?.description ?? ''}
                                                        </div>
                                                    </td>
                                                    <td className='pd-sales'>
                                                        {product?.totalSales?.count ?? ''}
                                                    </td>
                                                    <td className='pd-revenue'>{`${formatCurrency(product?.totalSales?.revenue) ?? ''} đ`}</td>
                                                    <td className='pd-stock'>{product.totalStock ?? ''}</td>
                                                    <td className='pd-action'>
                                                        <div className='btn publish' onClick={() => openInventoryModal(product._id)}>
                                                            <span className="material-symbols-outlined">publish</span>
                                                        </div>
                                                        <div className=' btn edit' onClick={() => openUpdateModal(product._id)}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                        </div>
                                                        <div className=' btn delete' onClick={() => handleDeleteProduct(product._id)}>
                                                            <span className="material-symbols-outlined">delete</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )

                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <NewProductModal
            isOpen={activeModal === ModalTypes.NEW_PRODUCT}
            onClose={closeModal}
            categoriesList={categoriesList}
            mode={mode}
            productId={selectedProductId}
        ></NewProductModal>
        <InventoryModal
            isOpen={activeModal === ModalTypes.INVENTORY}
            onClose={closeModal}
            productId={selectedProductId}
        >
        </InventoryModal>
    </>)
}