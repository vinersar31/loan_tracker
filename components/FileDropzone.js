"use client";
import { useState, useRef } from 'react';
import { FileText, Upload, X } from 'lucide-react';

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
        <div>
            <div
                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary/10 text-main'
                        : 'border-hairline/20 bg-surface-hi/40 text-secondary hover:border-primary/40'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleChange}
                    accept={accept}
                    multiple
                    className="hidden"
                />
                <Upload size={20} />
                <p>Drag &amp; drop PDFs here, or click to browse</p>
            </div>

            {files.length > 0 && (
                <div className="mt-3 space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between gap-2 rounded-lg bg-surface-hi px-3 py-2 text-sm"
                        >
                            <span className="flex min-w-0 items-center gap-2 text-secondary">
                                <FileText size={15} className="shrink-0" />
                                <span className="truncate">{file.name}</span>
                            </span>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="rounded p-1 text-dim transition-colors hover:text-danger"
                                aria-label="Remove file"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
