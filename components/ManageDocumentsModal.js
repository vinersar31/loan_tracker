"use client";
import { useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import FileDropzone from "./FileDropzone";

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
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />
      <div
        className="card relative z-10 w-full max-w-md animate-fade-in-up p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-main">Manage documents</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary transition-colors hover:bg-surface-hi hover:text-main"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-6">
          <p className="stat-label mb-2">Existing documents</p>
          {!payment.documents || payment.documents.length === 0 ? (
            <p className="text-sm italic text-dim">No documents attached.</p>
          ) : (
            <ul className="space-y-2">
              {payment.documents.map((doc, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-2 rounded-lg bg-surface-hi px-3 py-2 text-sm"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-0 items-center gap-2 text-primary hover:underline"
                  >
                    <FileText size={15} className="shrink-0" />
                    <span className="truncate">{doc.name}</span>
                  </a>
                  <button
                    onClick={() => onDeleteDocument(payment.id, doc.refPath, payment.documents)}
                    className="rounded p-1 text-dim transition-colors hover:text-danger"
                    title="Delete document"
                  >
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="stat-label mb-2">Add new documents</p>
          <FileDropzone files={filesToAdd} setFiles={setFilesToAdd} />
          {filesToAdd.length > 0 && (
            <button
              className="btn-primary mt-4 w-full"
              onClick={handleUpload}
              disabled={isUploading}
            >
              <Upload size={16} />
              {isUploading ? "Uploading…" : "Upload documents"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
