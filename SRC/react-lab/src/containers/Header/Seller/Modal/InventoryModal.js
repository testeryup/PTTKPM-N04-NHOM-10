import { createPortal } from "react-dom"
import { useState, useEffect, useCallback } from "react";
import './InventoryModal.scss';
import { userGetProductById } from "../../../../services/userService";
import toast, { Toaster } from 'react-hot-toast';
import { uploadInventory, getInventoryList, deleteInventoryById } from "../../../../services/sellerService";

export default function InventoryModal({ isOpen, onClose, productId }) {
    const [formData, setFormData] = useState({
        selectedSKU: '',
        inventoryList: [],
        skus: [],
        subcategory: '',
        inventoryDataToUpload: [],
        inventoryTextArea: ''
    })
    const setProductState = (data) => {
        setFormData({
            selectedSKU: '',
            inventoryList: ''
        })
    }
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const result = await userGetProductById(productId);
                if (result.errCode === 0 && result.data) {
                    setFormData({
                        ...formData,
                        skus: result.data.skus,
                        subcategory: result.data.subcategory
                    })
                }
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to fetch product data");
            }
        };
        if (productId) {
            fetchProduct();
        }
    }, [productId])
    const resetForm = () => {
        setFormData({
            selectedSKU: '',
            inventoryList: []
        })
    }

    const setField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleClose = () => {
        resetForm();
        onClose();
    }

    const handleSubmit = () => {

    }

    const validateData = () => {

    }
    const handleSelectedSkuChange = async (skuId) => {
        setField('selectedSKU', skuId);
        setField('inventoryList', []);
        const inventoryData = await getInventoryList(skuId);
        if (inventoryData?.errCode === 0 && inventoryData.data) {
            setField('inventoryList', inventoryData.data);
        }

    }

    const handleInventoryChange = (event) => {
        setField('inventoryDataToUpload', event.target.value);
    }
    const parseAccounts = (text) => {
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
    };

    const handleDeleteInventory = async (inventoryId) => {
        if (!inventoryId) {
            toast.error("Không có thông tin tài khoản để xoá")
            return;
        }
        console.log("check inventory to delete:", inventoryId);
        try {
            const result = await deleteInventoryById(inventoryId, formData.selectedSKU);
            if (result.errCode === 0) {
                setFormData(prev => ({
                    ...prev,
                    inventoryList: prev.inventoryList.filter(inv => inv._id !== inventoryId)
                }));
                toast.success('Xóa tài khoản thành công');
            }
            else {
                throw new Error("Xoá tài khoản thất bại [1]");

            }
        } catch (error) {
            toast.error("Xoá tài khoản thất bại")
        }

    }
    const handleUpload = async () => {
        console.log("check inventory to upload:", formData.inventoryDataToUpload);
        const dataToUpload = parseAccounts(formData.inventoryDataToUpload);
        if(!productId || !formData.selectedSKU || !dataToUpload){
            toast.error("Vui lòng nhập thông tin hợp lệ");
            return;
        }
        try {
            
            const result = await uploadInventory({
                productId,
                skuId: formData.selectedSKU,
                credentialsList: dataToUpload
            });
            if (result.errCode === 0) {
                console.log("check to upload:", dataToUpload);
                setFormData(prev => ({
                    ...prev,
                    // inventoryList: [...prev.inventoryList, ...formData.inventoryDataToUpload],
                    inventoryDataToUpload: '' // Clear upload data
                }))
                handleSelectedSkuChange(formData.selectedSKU);
                toast.success("Bổ sung kho hàng thành công");
                console.log("successfully upload new data:", result);
            }
            else {
                throw new Error("Bổ sung kho hàng thất bại");
            }
        } catch (error) {
            toast.error("Bổ sung kho hàng thất bại");
            console.log("error when uploading inventory:", error);
        }
    }

    const inventoryStatus = {
        AVAILABLE: { code: 'available', label: 'sẵn sàng' },
        SOLD: { code: 'sold', label: 'đã bán' },
        INVALID: { code: 'invalid', label: 'đã huỷ' }
    }

    const getStatusLabel = (status) => {
        const statusEntry = Object.values(inventoryStatus).find(
            (entry) => entry.code === status
        );
        return statusEntry.label ?? 'không xác định'
    }
    if (!isOpen) return null;
    return createPortal(
        <>
            <div className="inventory-container">
                <div className={`inventory-overlay ${isOpen ? 'show' : ''}`}>
                    <div
                        className="inventory-content"
                        onClick={e => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="header">
                            <h2>Bổ sung kho hàng</h2>
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
                            <select value={formData.selectedSKU} onChange={(e) => handleSelectedSkuChange(e.target.value)}>
                                <option value={""}>Chọn phân loại sản phẩm</option>
                                {
                                    formData.skus &&
                                    formData.skus.map((sku) => {
                                        return (
                                            <option value={sku._id} key={sku._id}>{sku.name}</option>
                                        )
                                    })
                                }
                            </select>
                            <div className="inventory-section">
                                <div className="upload">
                                    <label htmlFor="inventory">Thêm account</label>
                                    <textarea rows="10" id="inventory"
                                        placeholder="Nhập tài khoản ở đây, mỗi dòng là 1 tài khoản"
                                        value={formData.inventoryDataToUpload}
                                        onChange={e => handleInventoryChange(e)}
                                    ></textarea>
                                </div>
                                <div className="view">
                                    {/* <div className="inventory-title">Danh sách tài khoản</div> */}
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Tài khoản</th>
                                                <th>Trạng thái</th>
                                                <th>Ngày tạo</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {
                                                formData.inventoryList && formData.inventoryList.map(
                                                    inventory => {
                                                        return (
                                                            <tr className={`item ${inventory._id}`} key={inventory._id}>
                                                                <td className="credentials">{inventory.credentials ?? 'error'}</td>
                                                                <td className="status">{getStatusLabel(inventory.status)}</td>
                                                                <td className="createdAt">{inventory?.createdAt ? new Date(inventory.createdAt).toLocaleDateString() : 'error'}</td>
                                                                <td className="delete-btn" onClick={() => handleDeleteInventory(inventory._id)}>❌</td>
                                                            </tr>
                                                        )
                                                    }
                                                )
                                            }
                                        </tbody>
                                    </table>

                                </div>
                            </div>
                        </div>
                        <button className="upload-new-inventory" onClick={handleUpload}>Thêm tài khoản</button>

                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}