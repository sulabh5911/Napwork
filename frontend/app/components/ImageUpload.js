'use client';

import { useRef } from 'react';

const ALLOWED_TYPES = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 4;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export default function ImageUpload({ images, onChange }) {
  const fileInputRefs = useRef([]);

  const handleClick = (index) => {
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].click();
    }
  };

  const handleFileSelect = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload SVG, PNG, or JPG files only.');
      e.target.value = '';
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      alert(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      e.target.value = '';
      return;
    }

    const newImages = [...images];
    newImages[index] = {
      file,
      preview: URL.createObjectURL(file),
    };
    onChange(newImages);

    // Reset input for re-selection
    e.target.value = '';
  };

  const handleRemove = (index, e) => {
    e.stopPropagation();
    const newImages = [...images];

    // Revoke object URL to free memory
    if (newImages[index] && newImages[index].preview) {
      URL.revokeObjectURL(newImages[index].preview);
    }

    newImages[index] = null;
    onChange(newImages);
  };

  const slots = [0, 1, 2, 3];

  return (
    <div>
      <p className="image-upload-note">
        <span className="note-label">Note :</span> Format photos SVG, PNG, or JPG (Max size 4mb)
      </p>
      <div className="image-upload-grid">
        {slots.map((index) => {
          const image = images[index];
          const hasImage = image && image.preview;

          return (
            <div
              key={index}
              className={`image-upload-slot ${hasImage ? 'has-image' : ''}`}
              onClick={() => handleClick(index)}
            >
              {hasImage ? (
                <>
                  <img
                    src={image.preview}
                    alt={`Photo ${index + 1}`}
                    className="image-upload-preview"
                  />
                  <button
                    className="image-upload-remove"
                    onClick={(e) => handleRemove(index, e)}
                    type="button"
                    aria-label={`Remove photo ${index + 1}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="image-upload-placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="image-upload-placeholder-text">
                    Photo {index + 1}
                  </span>
                </div>
              )}

              <input
                ref={(el) => (fileInputRefs.current[index] = el)}
                type="file"
                className="image-upload-input"
                accept=".svg,.png,.jpg,.jpeg"
                onChange={(e) => handleFileSelect(index, e)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
