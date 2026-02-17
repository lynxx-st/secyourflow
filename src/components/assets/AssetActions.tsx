"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2, Loader2 } from "lucide-react";
import { Asset } from "@/types";
import { cn } from "@/lib/utils";

interface AssetActionsProps {
    asset: Asset;
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function AssetActions({ 
    asset, 
    onEdit, 
    onDelete,
    isDeleting = false
}: AssetActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setIsConfirming(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (isOpen) setIsConfirming(false);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsConfirming(true);
    };

    const handleCancelDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsConfirming(false);
    };

    const handleFinalDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete();
        setIsOpen(false);
        setIsConfirming(false);
    };

    return (
        <div className="relative inline-block" ref={dropdownRef} style={{ zIndex: 1000 }}>
            <button
                type="button"
                onClick={handleToggle}
                className={cn(
                    "p-2 rounded-lg transition-all duration-300 ease-in-out border",
                    isOpen 
                        ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] border-[var(--border-color)]" 
                        : "bg-transparent text-[var(--text-muted)] border-transparent hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                )}
                disabled={isDeleting}
                title="Asset Actions"
            >
                {isDeleting ? (
                    <Loader2 size={18} className="animate-spin text-[var(--accent-1)]" />
                ) : (
                    <MoreVertical size={18} />
                )}
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 z-[1000] w-64 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)]"
                >
                    {!isConfirming ? (
                        <div className="p-1 space-y-1">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEdit();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--text-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                            >
                                <Edit2 size={14} className="text-[var(--accent-1)]" />
                                Edit Asset
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteClick}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-[var(--badge-critical-text)] transition-all duration-300 ease-in-out hover:bg-[var(--badge-critical-bg)]"
                            >
                                <Trash2 size={14} />
                                Delete Asset
                            </button>
                        </div>
                    ) : (
                        <div className="border-t-2 border-[var(--badge-critical-border)] bg-[var(--badge-critical-bg)] p-4">
                            <p className="mb-2 text-sm font-bold text-[var(--text-primary)]">
                                Confirm Deletion
                            </p>
                            <p className="text-xs text-[var(--text-muted)] mb-4">
                                This will permanently remove &quot;{asset.name}&quot;.
                            </p>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={handleFinalDelete}
                                    className="w-full rounded-lg bg-[var(--state-critical)] py-2.5 text-xs font-bold text-white transition-all duration-300 ease-in-out hover:opacity-90"
                                >
                                    Yes, Delete Asset
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelDelete}
                                    className="w-full rounded-lg bg-[var(--bg-tertiary)] py-2 text-xs text-[var(--text-primary)] transition-all duration-300 ease-in-out hover:bg-[var(--bg-secondary)]"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
