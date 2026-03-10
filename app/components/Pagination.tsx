"use client";

import React from "react";
import { pageRange } from "../utils/helpers";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="pg-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                ‹
            </button>

            {pageRange(currentPage, totalPages).map((p, i) => {
                if (p === '…') return <span key={`ellipsis-${i}`} className="pg-info">…</span>;
                return (
                    <button
                        key={p}
                        className={`pg-btn ${p === currentPage ? 'active' : ''}`}
                        onClick={() => onPageChange(p as number)}
                    >
                        {p}
                    </button>
                );
            })}

            <button
                className="pg-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                ›
            </button>
        </div>
    );
}