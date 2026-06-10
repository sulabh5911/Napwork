'use client';

export default function FilterPanel({ filters, onChange, onApply, onClear }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <h3 className="filter-panel-title">Filters</h3>
      </div>
      <div className="filter-panel-grid">
        <div className="filter-group">
          <label className="filter-label">Product Name</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Filter by name..."
            value={filters.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Min Price ($)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={filters.minPrice || ''}
            onChange={(e) => handleChange('minPrice', e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Max Price ($)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={filters.maxPrice || ''}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
          />
        </div>
      </div>
      <div className="filter-actions">
        <button className="btn btn-secondary" onClick={onClear}>
          Clear
        </button>
        <button className="btn btn-primary" onClick={onApply}>
          Apply Filters
        </button>
      </div>
    </div>
  );
}
