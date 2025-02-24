import { createPortal } from "react-dom";
import { useState } from "react";
import './NewProductModal.scss';
import { useEffect, useCallback } from "react";
import { createOrUpdateProduct, getProductById } from '../../../../services/userService';
import toast, { Toaster } from 'react-hot-toast';

export default function NewProductModal({ isOpen, onClose, categoriesList, mode = 'create', productId = null }) {
    const MAX_IMAGES = 5;
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        subcategory: '',
        images: [],
        skus: []
    });

    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const setProductStateOnUpdate = useCallback((data) => {
        setFormData({
            name: data.name ?? '',
            description: data.description ?? '',
            category: data.category ?? '',
            subcategory: data.subcategory ?? '',
            images: data.images ?? [],
            skus: data.skus ?? []
        });

        const currentCategory = categoriesList.find(cat => cat._id === data.category);
        setSubcategoriesList(currentCategory?.subcategories || []);
    }, [categoriesList]); // Add categoriesList as dependency

    const updateField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };


    const [newSku, setNewSku] = useState({
        name: '',
        price: '',
    });

    const [subcategoriesList, setSubcategoriesList] = useState([]);
    // const setProductStateOnUpdate = (data) => {
    //     console.log("check data subcategory", data.subcategory);
    //     setFormData({
    //         name: data.name ?? '',
    //         description: data.description ?? '',
    //         category: data.category ?? '',
    //         subcategory: data.subcategory ?? '',
    //         images: data.images ?? [],
    //         skus: data.skus ?? []
    //     });
    //     const currentCategory = categoriesList.find(cat => cat._id === data.category);
    //     setSubcategoriesList(currentCategory?.subcategories || []);
    // }
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const result = await getProductById(productId);
                setProductStateOnUpdate(result.data);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to fetch product data");
            }
        };

        if (mode === 'update' && productId) {
            fetchProduct();
        }
    }, [mode, productId, setProductStateOnUpdate, isOpen]);



    const handleAddSku = () => {

        if (!newSku.name || !newSku.price) {
            toast.error('Vui lòng nhập thông tin của SKU!');
            return;
        }
        updateField('skus', [...formData.skus, { ...newSku }]);
        setNewSku({ name: '', price: '' });
    };

    const handleRemoveSku = (skuName) => {
        updateField('skus', formData.skus.filter(sku => sku.name !== skuName));
    };

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

        if (formData.images.length + files.length > MAX_IMAGES) {
            toast.error(`Bạn chỉ được phép thêm tối đa ${MAX_IMAGES} ảnh`);
            return;
        }

        const validFiles = files.filter(file => file.type.startsWith('image/'));

        try {
            const base64Images = await Promise.all(
                validFiles.map(file => convertToBase64(file))
            );

            updateField('images', [...formData.images, ...base64Images]);
        } catch (error) {
            toast.error('Lỗi convert ảnh')
            console.error('Error converting images:', error);
        }
    };

    const removeImage = (index) => {
        updateField('images', formData.images.filter((_, i) => i !== index))
    };


    const handleCategoryChange = (e) => {
        updateField('category', e.target.value);
        updateField('subcategory', '');

        const currentCategory = categoriesList.find(cat => cat._id === e.target.value);
        setSubcategoriesList(currentCategory?.subcategories || []);
    }

    const resetForm = () => {
        setFormData({
            id: '',
            name: '',
            description: '',
            category: '',
            subcategory: '',
            images: [],
            skus: []
        })
    };

    const validateInput = (data) => {
        const errors = {};
        if (!data.name) errors.name = 'Tên sản phẩm là bắt buộc';
        if (!data.category) errors.category = 'Danh mục là bắt buộc';
        if (!data.description) errors.description = 'Mô tả là bắt buộc';
        if (!data.skus.length) errors.skus = 'Cần ít nhất một SKU';
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const handleSaveProduct = async () => {
        setIsSubmitting(true);
        try {
            const { isValid, errors } = validateInput(formData);
            if (!isValid) {
                setFormErrors(errors);
                toast.error('Vui lòng điền đầy đủ thông tin');
                return;
            }

            const response = await createOrUpdateProduct({ ...formData, id: productId });
            if (response?.errCode === 0) {
                toast.success('Thao tác thành công');
                resetForm();
                onClose();
            }
            else {
                toast.error('Thao tác thất bại');

            }
        } catch (error) {
            toast.error('Thao tác thất bại');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    if (!isOpen) return null;

    const handleClose = () => {
        resetForm();
        onClose();
    }
    return createPortal(
        <>

            <div className="modal-container">
                <div className={`modal-overlay ${isOpen ? 'show' : ''}`} onClick={handleClose}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="header">
                            <h2>{mode === 'create' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</h2>
                            <button
                                className="btn-close"
                                onClick={handleClose}
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
                                    <input id="name" value={formData.name} onChange={(e) => updateField('name', e.target.value)}></input>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category">Danh mục</label>
                                    <select
                                        value={formData.category}
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
                                        value={formData.subcategory}
                                        onChange={(e) => updateField('subcategory', e.target.value)}
                                        className="form-control"
                                    // disabled={!formData.category}
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
                                        <div className="sku-item">
                                            <span className="sku-view">Tên Sku</span>
                                            <span className="sku-view">Giá</span>
                                            <span className="sku-view">Còn lại</span>
                                            <button
                                                className="remove-sku"
                                                style={{ color: '#f5f5f5' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                        {formData.skus.map((sku, index) => (
                                            <div key={index} className="sku-item">
                                                <span className="sku-view">{sku.name}</span>
                                                <span className="sku-view">{sku.price}.đ</span>
                                                <span className="sku-view">{sku.stock}</span>
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
                                        disabled={formData.images.length >= MAX_IMAGES}
                                    ></input>
                                    <div className="image-preview-container">
                                        {
                                            formData.images.map((image, index) => (
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
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        rows="10"
                                        required
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <button className="btn-save" onClick={handleSaveProduct}>{mode === 'create' ? 'Lưu thông tin' : 'Sửa thông tin'}</button>

                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}