"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Trash2, ClipboardCheck, Loader2, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ControlActionsProps {
    control: Record<string, unknown>;
    onAssess: () => void;
    onEvidence?: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

export function ControlActions({ 
    control, 
    onAssess, 
    onEvidence,
    onDelete,
    isDeleting = false
}: ControlActionsProps) {
    void control;
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
            >
                {isDeleting ? (
                    <Loader2 size={16} className="animate-spin text-[var(--accent-1)]" />
                ) : (
                    <MoreVertical size={16} />
                )}
            </button>

            {isOpen && (
                <div 
                    className="absolute right-0 mt-2 z-[1000] w-56 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)]"
                >
                    {!isConfirming ? (
                        <div className="p-1 space-y-1">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAssess();
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--text-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                            >
                                <ClipboardCheck size={14} className="text-[var(--accent-1)]" />
                                Assess Control
                            </button>
                            {onEvidence ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onEvidence();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--text-secondary)] transition-all duration-300 ease-in-out hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                                >
                                    <FileUp size={14} className="text-emerald-400" />
                                    Manage Evidence
                                </button>
                            ) : null}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setIsConfirming(true);
                                }}
                                className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--badge-critical-text)] transition-all duration-300 ease-in-out hover:bg-[var(--badge-critical-bg)]"
                            >
                                <Trash2 size={14} />
                                Delete Control
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[var(--badge-critical-bg)] p-4">
                            <p className="mb-2 text-sm font-bold text-[var(--text-primary)]">Delete Control?</p>
                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDelete();
                                        setIsOpen(false);
                                    }}
                                    className="w-full rounded-lg bg-[var(--state-critical)] py-2 text-xs font-bold text-white transition-all duration-300 ease-in-out hover:opacity-90"
                                >
                                    Confirm Delete
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsConfirming(false);
                                    }}
                                    className="w-full rounded-lg bg-[var(--bg-tertiary)] py-2 text-xs text-[var(--text-primary)] transition-all duration-300 ease-in-out"
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
