"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { Download, FileText, History, Trash2 } from "lucide-react";
import ManageDocumentsModal from "./ManageDocumentsModal";
import { formatCurrency } from "@/utils/format";
import { EXPORT_FILE_NAME, EXPORT_SHEET_NAME } from "@/utils/constants";

// Click-to-edit cell
const EditableCell = ({ value, type = "text", onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempValue, setTempValue] = useState(value);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) inputRef.current.focus();
    }, [isEditing]);

    const handleClick = () => {
        setTempValue(value);
        setIsEditing(true);
    };
    const handleBlur = () => {
        setIsEditing(false);
        if (tempValue !== value) onSave(tempValue);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") handleBlur();
        else if (e.key === "Escape") {
            setIsEditing(false);
            setTempValue(value);
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type={type}
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                step="0.01"
                className="w-full rounded-lg border border-primary/50 bg-surface-hi px-2 py-1 text-sm text-main outline-none focus:ring-1 focus:ring-primary/40"
            />
        );
    }
    return (
        <button
            type="button"
            onClick={handleClick}
            className="-mx-2 block w-[calc(100%+1rem)] truncate rounded-lg px-2 py-1 text-left text-sm font-medium text-main transition-colors hover:bg-surface"
            title="Click to edit"
        >
            {type === "number" ? formatCurrency(value) : value}
        </button>
    );
};

function Field({ label, children }) {
    return (
        <div className="min-w-0">
            <p className="stat-label">{label}</p>
            <div className="mt-0.5">{children}</div>
        </div>
    );
}

export default function HistoryList({ schedule, onDelete, onUpdate, onUploadDocuments, onDeleteDocument }) {
    const [activePaymentForDocs, setActivePaymentForDocs] = useState(null);

    const exportToExcel = () => {
        if (!schedule || schedule.length === 0) {
            alert("No data to export");
            return;
        }
        const dataToExport = schedule.map((item) => ({
            Date: new Date(item.date).toLocaleDateString("ro-RO"),
            Principal: item.principal,
            Interest: item.interest,
            Fees: item.fees,
            Total: item.amount,
            RemainingBalance: item.remainingBalance,
        }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, EXPORT_SHEET_NAME);
        XLSX.writeFile(workbook, EXPORT_FILE_NAME);
    };

    const processedSchedule = useMemo(() => {
        return schedule.map((item) => {
            const isMonthly = item.date && parseInt(item.date.split("-")[2], 10) === 10;
            const hasDocs = item.documents && item.documents.length > 0;
            return {
                ...item,
                isMonthly,
                hasDocs,
                docsTitle: hasDocs ? item.documents.map((d) => d.name).join("\n") : "No documents (click to add)"
            };
        });
    }, [schedule]);

    return (
        <section className="card p-5 sm:p-6">
            <header className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <History size={18} className="text-primary" />
                    <h2 className="text-base font-semibold text-main">History</h2>
                    <span className="rounded-full bg-surface-hi px-2 py-0.5 text-xs text-secondary">
                        {schedule.length}
                    </span>
                </div>
                <button onClick={exportToExcel} className="btn-ghost">
                    <Download size={15} />
                    <span className="hidden sm:inline">Export</span>
                </button>
            </header>

            {processedSchedule.length === 0 ? (
                <div className="py-12 text-center text-sm text-secondary">
                    No payments yet. Add your first payment above.
                </div>
            ) : (
                <div className="space-y-2">
                    {processedSchedule.map((item) => {
                        const { isMonthly, hasDocs, docsTitle } = item;
                        return (
                            <div
                                key={item.id}
                                className="rounded-2xl border border-hairline/10 bg-surface-hi/40 p-4"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="h-2 w-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: isMonthly ? "#6C5DD3" : "#FF754C" }}
                                            title={isMonthly ? "Monthly payment" : "Additional payment"}
                                        />
                                        <span className="text-sm font-semibold text-main">
                                            {new Date(item.date).toLocaleDateString("ro-RO")}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="mr-1 text-sm font-semibold text-success tabular">
                                            {formatCurrency(item.amount)}
                                        </span>
                                        <button
                                            onClick={() => setActivePaymentForDocs(item)}
                                            className={`rounded-lg p-1.5 transition-colors hover:bg-surface ${
                                                hasDocs ? "text-primary" : "text-dim"
                                            }`}
                                            title={docsTitle}
                                        >
                                            <FileText size={16} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(item.id)}
                                            className="rounded-lg p-1.5 text-dim transition-colors hover:bg-danger/10 hover:text-danger"
                                            title="Delete payment"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                                    <Field label="Principal">
                                        <EditableCell
                                            value={item.principal}
                                            type="number"
                                            onSave={(val) =>
                                                onUpdate(item.id, {
                                                    principal: parseFloat(val),
                                                    amount: parseFloat(val) + parseFloat(item.interest) + parseFloat(item.fees),
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field label="Interest">
                                        <EditableCell
                                            value={item.interest}
                                            type="number"
                                            onSave={(val) =>
                                                onUpdate(item.id, {
                                                    interest: parseFloat(val),
                                                    amount: parseFloat(item.principal) + parseFloat(val) + parseFloat(item.fees),
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field label="Fees">
                                        <EditableCell
                                            value={item.fees}
                                            type="number"
                                            onSave={(val) =>
                                                onUpdate(item.id, {
                                                    fees: parseFloat(val),
                                                    amount: parseFloat(item.principal) + parseFloat(item.interest) + parseFloat(val),
                                                })
                                            }
                                        />
                                    </Field>
                                    <Field label="Remaining">
                                        <span className="block truncate py-1 text-sm text-dim tabular">
                                            {formatCurrency(item.remainingBalance)}
                                        </span>
                                    </Field>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activePaymentForDocs && (
                <ManageDocumentsModal
                    payment={activePaymentForDocs}
                    onClose={() => setActivePaymentForDocs(null)}
                    onUpload={onUploadDocuments}
                    onDeleteDocument={onDeleteDocument}
                />
            )}
        </section>
    );
}
