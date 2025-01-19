import { createPortal } from "react-dom";
import { useState } from "react";
import './NewProductModal.scss';
import { useEffect } from "react";
import { getCategory, createProduct } from '../../../../services/userService';
import { toast, Bounce } from 'react-toastify';

export default function NewProductModal({ isOpen, onClose }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const [images, setImages] = useState([]);
    const MAX_IMAGES = 5;

    const [categoriesList, setCategoriesList] = useState([]);
    const [subcategoriesList, setSubcategoriesList] = useState([]);

    const [skus, setSkus] = useState([]);
    const [newSku, setNewSku] = useState({
        name: '',
        price: '',
    });

    const handleAddSku = () => {
        
        if (!newSku.name || !newSku.price) {
            toast.error('Vui lòng điền thông tin cho Sku');
            return;
        }
        setSkus([...skus, { ...newSku }]);
        setNewSku({ name: '', price: '' });
    };

    const handleRemoveSku = (skuName) => {
        setSkus(skus.filter(sku => sku.name !== skuName));
    };
    useEffect(() => {
        const fetchCategoriesList = async () => {
            let categories = await getCategory();
            setCategoriesList(categories);
        }
        fetchCategoriesList();
    }, [])

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > MAX_IMAGES) {
            alert(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }

        const validFiles = files.filter(file => file.type.startsWith('image/'));

        try {
            const base64Images = await Promise.all(
                validFiles.map(file => convertToBase64(file))
            );

            setImages(prev => [...prev, ...base64Images]);
        } catch (error) {
            console.error('Error converting images:', error);
        }
    };

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index));
    };


    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedSubcategory('');

        const currentCategory = categoriesList.find(cat => cat._id === e.target.value);
        setSubcategoriesList(currentCategory?.subcategories || []);
    }

    const resetForm = () => {
        setName('');
        setDescription('');
        setSelectedCategory('');
        setSelectedSubcategory('');
        setImages([]);
        setSkus([]);
        setNewSku({
            name: '',
            price: ''
        });
    };

    const handleSaveProduct = async () => {
        try {
            const productData = {
                name,
                images,
                description,
                category: selectedCategory,
                subcategory: selectedSubcategory,
                skus
            };

            console.log("check Product Data:", productData);
                return;
            let response = await createProduct(productData);
            // Reset form and close modal on success
            resetForm();
            onClose();
            toast.success('Tạo sản phẩm thành công!');
        } catch (error) {
            toast.error('Tạo sản phẩm thất bại');
            console.error('Failed to create product:', error);
            // Handle error (show error message)
        }
    };
    if (!isOpen) return null;

    return createPortal(
        <>
            {/* <ToastContainer
                position="bottom-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss={true}
                draggable={true}
                pauseOnHover={true}
                theme="colored"
                transition={Bounce}
            /> */}
            <div className="modal-container">
                <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="header">
                            <h2>Thêm thông tin sản phẩm</h2>
                            <button
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <span className="material-symbols-outlined">
                                    close
                                </span>
                            </button>
                        </div>
                        <div className="body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Tên sản phẩm</label>
                                    <input id="name" value={name} onChange={e => setName(e.target.value)}></input>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Danh mục</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => handleCategoryChange(e)}
                                    >
                                        <option value={""}>Chọn danh mục mặt hàng</option>
                                        {categoriesList.map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Loại mặt hàng</label>
                                    <select
                                        value={selectedSubcategory}
                                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                                        className="form-control"
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">Chọn loại mặt hàng</option>
                                        {subcategoriesList.map(sub => (
                                            <option key={sub._id} value={sub.name}>
                                                {sub.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group sku-section">
                                    <label>SKUs</label>

                                    <div className="add-sku-form">
                                        <input
                                            placeholder="SKU Name"
                                            value={newSku.name}
                                            onChange={e => setNewSku({ ...newSku, name: e.target.value })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price"
                                            value={newSku.price}
                                            onChange={e => setNewSku({ ...newSku, price: e.target.value })}

                                        />
                                        <button onClick={handleAddSku} className="btn-add-sku">
                                            Thêm SKU
                                        </button>
                                    </div>
                                    <div className="sku-list">
                                        {skus.map((sku, index) => (
                                            <div key={index} className="sku-item">
                                                <span className="sku-view">{sku.name}</span>
                                                <span className="sku-view">${sku.price}</span>
                                                <button
                                                    onClick={() => handleRemoveSku(sku.name)}
                                                    className="remove-sku"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label >Hình ảnh sản phẩm (tối đa 5 ảnh)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        disabled={images.length >= MAX_IMAGES}
                                    ></input>
                                    <div className="image-preview-container">
                                        {
                                            images.map((image, index) => (
                                                <div key={index} className="image-preview">
                                                    <img src={image} alt={`Product ${index + 1}`} />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="remove-image"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="description">Mô tả</label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        rows="10"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="footer">
                            <button className="btn-save" onClick={() => handleSaveProduct()}>Lưu</button>
                        </div>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}