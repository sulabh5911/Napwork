'use client';

import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const hoursStr = String(hours).padStart(2, '0');

  return `${month}/${day}/${year} at ${hoursStr}:${minutes} ${ampm}`;
}

export default function ProductTable({ products, onDelete, loading }) {
  const [selectedIds, setSelectedIds] = useState([]);

  const allSelected = products.length > 0 && selectedIds.length === products.length;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p._id || p.id));
    }
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner"></div>
        <span className="loading-text">Loading products...</span>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        </div>
        <h3 className="empty-state-title">No products found</h3>
        <p className="empty-state-message">
          There are no products matching your criteria. Try adjusting your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="product-table-wrapper">
      <table className="product-table">
        <thead>
          <tr>
            <th style={{ width: 44 }}>
              <input
                type="checkbox"
                className="table-checkbox"
                checked={allSelected}
                onChange={toggleAll}
              />
            </th>
            <th>Product</th>
            <th>Price</th>
            <th>Date</th>
            <th style={{ width: 60 }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const id = product._id || product.id;
            const isSelected = selectedIds.includes(id);

            // Build image URL
            let imageUrl = null;
            if (product.images && product.images.length > 0) {
              const img = product.images[0];
              if (img.startsWith('http')) {
                imageUrl = img;
              } else {
                imageUrl = `${API_BASE}${img.startsWith('/') ? '' : '/'}${img}`;
              }
            }

            return (
              <tr key={id}>
                <td>
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={isSelected}
                    onChange={() => toggleOne(id)}
                  />
                </td>
                <td>
                  <div className="product-cell">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-thumbnail"
                        onError={(e) => {
                          // Replace broken image with a generic placeholder SVG inline
                          e.target.onerror = null; // prevent infinite loop
                          e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="%239CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>';
                          e.target.style.padding = '10px';
                          e.target.style.backgroundColor = '#F8F9FA';
                        }}
                      />
                    ) : (
                      <div
                        className="product-thumbnail"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--color-text-muted)',
                          fontSize: '10px',
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                    )}
                    <span className="product-name">{product.name}</span>
                  </div>
                </td>
                <td>
                  <span className="product-price">{formatPrice(product.price)}</span>
                </td>
                <td>
                  <span className="product-date">
                    {product.createdAt ? formatDate(product.createdAt) : '—'}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => onDelete(id)}
                    title="Delete product"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
