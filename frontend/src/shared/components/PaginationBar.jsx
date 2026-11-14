import React, { useEffect, useMemo, useState } from 'react';

export function usePagination(items = [], defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const totalItems = Array.isArray(items) ? items.length : 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const safePage = Math.min(page, totalPages);

  const pagedItems = useMemo(() => {
    if (!Array.isArray(items) || items.length === 0) return [];
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (nextSize) => {
      setPageSize(nextSize);
      setPage(1);
    },
    totalItems,
    totalPages,
    pagedItems,
    resetPage: () => setPage(1),
  };
}

export function PaginationBar({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [6, 10, 12, 20, 50],
  itemLabel = 'items',
}) {
  if (totalItems <= 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  const buildPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (page > 3) pages.push('…');
    const lo = Math.max(2, page - 1);
    const hi = Math.min(totalPages - 1, page + 1);
    for (let p = lo; p <= hi; p += 1) pages.push(p);
    if (page < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
  };

  const navBtnStyle = (disabled, active = false) => ({
    padding: '5px 10px',
    borderRadius: '9999px',
    border: active ? '1px solid #164230' : '1px solid #DFD8CA',
    backgroundColor: active ? '#164230' : disabled ? '#F9F6F0' : '#FFFFFF',
    color: active ? '#FFFFFF' : disabled ? '#9CA3AF' : '#164230',
    fontSize: '0.78rem',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    minWidth: '30px',
    lineHeight: 1.2,
  });

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '10px',
        padding: '12px 16px',
        borderTop: '1px solid #ECE7DC',
        backgroundColor: '#FAF8F3',
        borderRadius: '0 0 16px 16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#4B5752' }}>
        <span>
          Showing <strong>{start}–{end}</strong> of <strong>{totalItems}</strong> {itemLabel}
        </span>
        {onPageSizeChange && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span>Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              style={{
                padding: '4px 8px',
                borderRadius: '8px',
                border: '1px solid #DFD8CA',
                backgroundColor: '#FFFFFF',
                color: '#19201C',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            style={navBtnStyle(page <= 1)}
          >
            Prev
          </button>
          {buildPageNumbers().map((p, idx) =>
            p === '…' ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#7A8680', fontSize: '0.8rem' }}>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                style={navBtnStyle(false, p === page)}
              >
                {p}
              </button>
            )
          )}
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            style={navBtnStyle(page >= totalPages)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
