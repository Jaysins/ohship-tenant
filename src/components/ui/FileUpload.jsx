import React, { useState, useRef } from 'react';
import { useTenantConfig } from '../../context/TenantConfigContext';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { validateFile } from '../../utils/validation';
import { formatFileSize } from '../../utils/format';

/**
 * FileUpload Component
 * File picker with validation and preview
 *
 * @param {function} onFileSelect - File select handler
 * @param {Array<string>} acceptedTypes - Accepted MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @param {string} label - Upload label text
 * @param {string} description - Upload description
 * @param {boolean} disabled - Disabled state
 * @param {string} error - Error message
 * @param {string} className - Additional CSS classes
 */
const FileUpload = ({
  onFileSelect,
  acceptedTypes = ['application/pdf', 'image/png', 'image/jpeg'],
  maxSizeMB = 5,
  label = 'Upload Payment Proof',
  description = 'PDF, PNG, or JPEG (max 5MB)',
  disabled = false,
  error = '',
  className = ''
}) => {
  const { theme, getBorderRadius } = useTenantConfig();
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;

    // Validate file
    const validation = validateFile(file, { allowedTypes: acceptedTypes, maxSizeMB });

    if (!validation.valid) {
      setValidationError(validation.error);
      setSelectedFile(null);
      onFileSelect && onFileSelect(null);
      return;
    }

    // Valid file
    setValidationError('');
    setSelectedFile(file);
    onFileSelect && onFileSelect(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    handleFileChange(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    handleFileChange(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    onFileSelect && onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const displayError = error || validationError;

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block mb-2 text-sm font-medium" style={{ color: theme.text.primary }}>
          {label}
        </label>
      )}

      {/* Upload area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed p-6 text-center transition-all cursor-pointer ${getBorderRadius()}`}
        style={{
          backgroundColor: isDragging
            ? `${theme.primary_color}10`
            : disabled
            ? theme.background.subtle
            : theme.background.card,
          borderColor: displayError
            ? theme.danger_color
            : isDragging
            ? theme.primary_color
            : theme.border.color,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {selectedFile ? (
          /* File selected view */
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${theme.success_color}20` }}
              >
                <File size={24} style={{ color: theme.success_color }} />
              </div>
              <div className="text-left flex-1">
                <p className="font-medium text-sm truncate" style={{ color: theme.text.primary }}>
                  {selectedFile.name}
                </p>
                <p className="text-xs" style={{ color: theme.text.muted }}>
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <CheckCircle size={20} style={{ color: theme.success_color }} />
            </div>

            {!disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                className="p-1 rounded transition-colors"
                style={{
                  backgroundColor: `${theme.danger_color}15`,
                  color: theme.danger_color,
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        ) : (
          /* Empty state */
          <div>
            <div
              className="inline-flex p-3 rounded-full mb-3"
              style={{ backgroundColor: `${theme.primary_color}15` }}
            >
              <Upload size={24} style={{ color: theme.primary_color }} />
            </div>
            <p className="font-medium mb-1" style={{ color: theme.text.primary }}>
              Click to upload or drag and drop
            </p>
            <p className="text-sm" style={{ color: theme.text.muted }}>
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleInputChange}
        accept={acceptedTypes.join(',')}
        disabled={disabled}
        className="hidden"
      />

      {/* Error message */}
      {displayError && (
        <p className="mt-2 text-sm" style={{ color: theme.danger_color }}>
          {displayError}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
