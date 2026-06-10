'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUpload from '../../components/ImageUpload';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`;

export default function AddProductPage() {
  const router = useRouter();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState([null, null, null, null]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const validate = () => {
    const newErrors = {};
    if (!productName.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!price || isNaN(price) || Number(price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', productName.trim());
      formData.append('price', Number(price));

      // Append images
      images.forEach((img) => {
        if (img && img.file) {
          formData.append('images', img.file);
        }
      });

      const response = await fetch(API_BASE, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create product');
      }

      showToast('Product created successfully!', 'success');

      // Redirect after short delay so toast is visible
      setTimeout(() => {
        router.push('/products');
      }, 1200);
    } catch (err) {
      console.error('Error creating product:', err);
      showToast(err.message || 'Failed to create product', 'error');
    } finally {
      setSaving(false);
    }
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
        <span className="breadcrumb-item active">Add Product</span>
      </div>

      {/* Page Title */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Add Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="add-product-grid">
          {/* Left Column - Product Information */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Product Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label" htmlFor="productName">
                  Product Name
                </label>
                <input
                  id="productName"
                  type="text"
                  className="form-input"
                  placeholder="Enter product name"
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="price">
                  Price
                </label>
                <input
                  id="price"
                  type="number"
                  className="form-input"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
                  }}
                />
                {errors.price && <p className="form-error">{errors.price}</p>}
              </div>
            </div>
          </div>

          {/* Right Column - Image Upload */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Image Product</h2>
            </div>
            <div className="card-body">
              <ImageUpload images={images} onChange={setImages} />
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="form-footer">
          <Link href="/products" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="loading-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                Saving...
              </>
            ) : (
              'Save Product'
            )}
          </button>
        </div>
      </form>

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
