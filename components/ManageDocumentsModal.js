import { useState } from 'react';
import FileDropzone from './FileDropzone';

export default function ManageDocumentsModal({ payment, onClose, onUpload, onDeleteDocument }) {
    const [filesToAdd, setFilesToAdd] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (filesToAdd.length === 0) return;
        setIsUploading(true);
        await onUpload(payment.id, filesToAdd, payment.documents || []);
        setFilesToAdd([]);
        setIsUploading(false);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }} onClick={onClose}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--surface)',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                width: '90%',
                maxWidth: '500px',
                boxShadow: 'var(--shadow-card)',
                border: 'var(--glass-border)'
            }} onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0 }}>Manage Documents</h2>
                    <button onClick={onClose} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontSize: '20px'
                    }}>✕</button>
                </div>

                <div className="existing-documents" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Existing Documents</h3>
                    {(!payment.documents || payment.documents.length === 0) ? (
                        <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '14px' }}>No documents attached.</p>
                    ) : (
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {payment.documents.map((doc, idx) => (
                                <li key={idx} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '10px 12px', backgroundColor: 'var(--surface-highlight)',
                                    borderRadius: '8px', fontSize: '14px'
                                }}>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{
                                        color: 'var(--primary)', textDecoration: 'none',
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '85%'
                                    }}>
                                        📄 {doc.name}
                                    </a>
                                    <button onClick={() => onDeleteDocument(payment.id, doc.refPath, payment.documents)} style={{
                                        background: 'none', border: 'none', color: 'var(--danger)',
                                        cursor: 'pointer', fontSize: '16px', padding: '0 4px'
                                    }} title="Delete Document">
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="add-documents">
                    <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Add New Documents</h3>
                    <FileDropzone files={filesToAdd} setFiles={setFilesToAdd} />
                    {filesToAdd.length > 0 && (
                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                            onClick={handleUpload}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Documents'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
