import { useState, useRef } from 'react';

export default function FileDropzone({ files, setFiles, accept = ".pdf", maxFiles = 5 }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isDragging) {
            setIsDragging(true);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).filter(file =>
                accept.includes(file.name.substring(file.name.lastIndexOf('.')))
            );

            if (files.length + newFiles.length > maxFiles) {
                alert(`You can only upload up to ${maxFiles} files.`);
                return;
            }

            setFiles([...files, ...newFiles]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);

            if (files.length + newFiles.length > maxFiles) {
                alert(`You can only upload up to ${maxFiles} files.`);
                return;
            }

            setFiles([...files, ...newFiles]);
        }
    };

    const removeFile = (indexToRemove) => {
        setFiles(files.filter((_, index) => index !== indexToRemove));
    };

    return (
        <div className="file-dropzone-container" style={{ margin: '16px 0' }}>
            <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                style={{
                    border: isDragging ? '2px dashed var(--primary)' : '2px dashed var(--glass-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: isDragging ? 'rgba(108, 93, 211, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s ease',
                    color: 'var(--text-secondary)'
                }}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept={accept}
                    multiple
                    style={{ display: 'none' }}
                />
                <p>Drag and drop PDF files here, or click to select files</p>
            </div>

            {files.length > 0 && (
                <div className="file-list" style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map((file, index) => (
                        <div key={index} className="file-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: 'var(--surface-highlight)',
                            borderRadius: '8px',
                            fontSize: '14px'
                        }}>
                            <span style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '80%'
                            }}>📄 {file.name}</span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--danger)',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
