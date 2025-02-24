import React, { useState, useEffect } from 'react';
import UserHeader from "../containers/Header/UserHeader";
import Footer from "./Footer";
import './AllProducts.scss';
import { getProducts, getCategory } from '../services/userService';
import ProductCard from '../containers/HomePage/ProductCard';
import Loading from './Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        category: 'all',
        subcategory: 'all',
        search: '',
        sort: 'newest'
    });
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeSubcategories, setActiveSubcategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsResponse, categoriesResponse] = await Promise.all([
                    getProducts(),
                    getCategory()
                ]);

                if (productsResponse.errCode === 0) {
                    setProducts(productsResponse.data);
                    setFilteredProducts(productsResponse.data);
                }
                if (categoriesResponse) {
                    setCategories(categoriesResponse);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (filters.category !== 'all') {
            const category = categories.find(cat => cat._id === filters.category);
            setActiveSubcategories(category?.subcategories || []);
        } else {
            setActiveSubcategories([]);
        }
    }, [filters.category, categories]);

    useEffect(() => {
        let result = [...products];

        // Apply category filter
        if (filters.category !== 'all') {
            result = result.filter(product => product.category === filters.category);
        }

        // Apply subcategory filter
        if (filters.subcategory !== 'all') {
            result = result.filter(product => product.subcategory === filters.subcategory);
        }

        // Apply search filter
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            result = result.filter(product => 
                product.name.toLowerCase().includes(searchLower) ||
                product.description.toLowerCase().includes(searchLower)
            );
        }

        // Apply sorting
        switch (filters.sort) {
            case 'price-asc':
                result.sort((a, b) => a.minPrice - b.minPrice);
                break;
            case 'price-desc':
                result.sort((a, b) => b.minPrice - a.minPrice);
                break;
            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        setFilteredProducts(result);
    }, [filters, products]);

    if (loading) return <Loading />;

    return (
        <>
            <UserHeader />
            <div className="products-page">
                <div className="filters-section">
                    <div className="search-bar">
                        <FontAwesomeIcon icon="search" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>

                    <div className="filter-group">
                        <h3>Danh mục</h3>
                        <select 
                            value={filters.category}
                            onChange={(e) => setFilters({ 
                                ...filters, 
                                category: e.target.value,
                                subcategory: 'all'
                            })}
                        >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {activeSubcategories.length > 0 && (
                        <div className="filter-group">
                            <h3>Loại sản phẩm</h3>
                            <select
                                value={filters.subcategory}
                                onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
                            >
                                <option value="all">Tất cả loại</option>
                                {activeSubcategories.map(sub => (
                                    <option key={sub._id} value={sub.name}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="filter-group">
                        <h3>Sắp xếp theo</h3>
                        <select
                            value={filters.sort}
                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                        >
                            <option value="newest">Mới nhất</option>
                            <option value="price-asc">Giá tăng dần</option>
                            <option value="price-desc">Giá giảm dần</option>
                            <option value="name-asc">Tên A-Z</option>
                            <option value="name-desc">Tên Z-A</option>
                        </select>
                    </div>
                </div>

                <div className="products-grid">
                    {filteredProducts.length === 0 ? (
                        <div className="no-products">
                            <FontAwesomeIcon icon="box-open" />
                            <p>Không tìm thấy sản phẩm nào</p>
                        </div>
                    ) : (
                        filteredProducts.map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Products;