'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';

const API_BASE = 'http://localhost:5000/api/products';
const ITEMS_PER_PAGE = 10;

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ name: '', minPrice: '', maxPrice: '' });
  const [appliedFilters, setAppliedFilters] = useState({ name: '', minPrice: '', maxPrice: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', currentPage);
      params.set('limit', ITEMS_PER_PAGE);

      if (debouncedSearch) params.set('search', debouncedSearch);
      if (appliedFilters.minPrice) params.set('minPrice', appliedFilters.minPrice);
      if (appliedFilters.maxPrice) params.set('maxPrice', appliedFilters.maxPrice);
      if (appliedFilters.name) params.set('search', appliedFilters.name);

      const response = await fetch(`${API_BASE}?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch products (${response.status})`);
      }

      const data = await response.json();

      // Handle different API response shapes
      if (Array.isArray(data)) {
        setProducts(data);
        setTotalItems(data.length);
      } else if (data.products) {
        setProducts(data.products);
        setTotalItems(data.total || data.totalProducts || data.products.length);
      } else if (data.data) {
        setProducts(data.data);
        setTotalItems(data.total || data.totalItems || data.data.length);
      } else {
        setProducts([]);
        setTotalItems(0);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      setProducts([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteClick = (id) => {
    setProductToDelete(id);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`${API_BASE}/${productToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Failed to delete product', 'error');
    } finally {
      setProductToDelete(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    const cleared = { name: '', minPrice: '', maxPrice: '' };
    setFilters(cleared);
    setAppliedFilters(cleared);
    setCurrentPage(1);
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard" className="breadcrumb-item">Dashboard</Link>
        <span className="breadcrumb-separator">›</span>
        <Link href="/products" className="breadcrumb-item">Product</Link>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-item active">Sneakers</span>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Products</h1>
        </div>
        <div className="page-header-right">
          <SearchBar value={search} onChange={setSearch} />
          <button
            className={`btn btn-secondary btn-icon`}
            onClick={() => setShowFilter(!showFilter)}
            title="Toggle filters"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
          <Link href="/products/add" className="btn btn-primary">
            New Product
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilter && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <div className="error-state-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h3 className="error-state-title">Unable to load products</h3>
          <p className="error-state-message">{error}</p>
          <div className="error-state-action">
            <button className="btn btn-primary" onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Product Table Card */}
      {!error && (
        <div className="card">
          <ProductTable
            products={products}
            onDelete={handleDeleteClick}
            loading={loading}
          />
          {!loading && products.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Delete Product</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this product?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
