import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from './Table';
import { Input } from './Input';
import { Button } from './Button';

/**
 * Enterprise Dark-First DataGrid Component
 * Supports density toggle (compact, normal, spacious), client-side search, sorting, and pagination.
 */
export function DataGrid({
  columns = [],
  data = [],
  keyField = 'id',
  initialSort = { key: null, direction: 'asc' },
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchFields = [],
  defaultDensity = 'normal', // 'compact' | 'normal' | 'spacious'
  allowDensityToggle = true,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 10,
  emptyMessage = 'No records found',
  onRowClick,
  selectable = false,
  selectedKeys = [],
  onSelectionChange,
  className = '',
}) {
  const [density, setDensity] = useState(defaultDensity);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Density mapping to dense prop or padding
  const isDense = density === 'compact';

  // 1. Search Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      const fieldsToScan = searchFields.length > 0 ? searchFields : columns.map((col) => col.key);
      return fieldsToScan.some((field) => {
        const val = row[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields, columns]);

  // 2. Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const { key, direction } = sortConfig;

    return [...filteredData].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const totalItems = sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const startIndex = (effectivePage - 1) * pageSize;
  const paginatedData = sortedData.slice(startIndex, startIndex + pageSize);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === 'asc') return { key, direction: 'desc' };
        return { key: null, direction: 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleSelectAll = (e) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allKeys = paginatedData.map((item) => item[keyField]);
      onSelectionChange(Array.from(new Set([...selectedKeys, ...allKeys])));
    } else {
      const pageKeySet = new Set(paginatedData.map((item) => item[keyField]));
      onSelectionChange(selectedKeys.filter((k) => !pageKeySet.has(k)));
    }
  };

  const handleSelectRow = (key, e) => {
    e.stopPropagation();
    if (!onSelectionChange) return;
    if (selectedKeys.includes(key)) {
      onSelectionChange(selectedKeys.filter((k) => k !== key));
    } else {
      onSelectionChange([...selectedKeys, key]);
    }
  };

  const isAllPageSelected =
    paginatedData.length > 0 &&
    paginatedData.every((item) => selectedKeys.includes(item[keyField]));

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          {searchable && (
            <Input
              dense={isDense}
              icon={Search}
              clearable
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              onClear={() => setSearchTerm('')}
              placeholder={searchPlaceholder}
            />
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {allowDensityToggle && (
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setDensity('compact')}
                className={`px-2 py-1 rounded transition-colors ${
                  density === 'compact'
                    ? 'bg-slate-800 text-emerald-400 font-medium'
                    : 'hover:text-slate-200'
                }`}
                title="Compact density for TPO high-data view"
              >
                Compact
              </button>
              <button
                type="button"
                onClick={() => setDensity('normal')}
                className={`px-2 py-1 rounded transition-colors ${
                  density === 'normal'
                    ? 'bg-slate-800 text-emerald-400 font-medium'
                    : 'hover:text-slate-200'
                }`}
              >
                Normal
              </button>
              <button
                type="button"
                onClick={() => setDensity('spacious')}
                className={`px-2 py-1 rounded transition-colors ${
                  density === 'spacious'
                    ? 'bg-slate-800 text-emerald-400 font-medium'
                    : 'hover:text-slate-200'
                }`}
              >
                Spacious
              </button>
            </div>
          )}

          <div className="text-xs text-slate-400">
            {totalItems} record{totalItems === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <Table dense={isDense}>
        <TableHeader dense={isDense}>
          <tr>
            {selectable && (
              <th className={`w-10 ${isDense ? 'px-2 py-2' : 'px-3 py-3'} text-center`}>
                <input
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={handleSelectAll}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  aria-label="Select all on page"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sortConfig.key === col.key;
              return (
                <TableHead
                  key={col.key}
                  dense={isDense}
                  align={col.align || 'left'}
                  sortable={col.sortable !== false}
                  sorted={isSorted ? sortConfig.direction : null}
                  onSort={() => handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  {col.header}
                </TableHead>
              );
            })}
          </tr>
        </TableHeader>

        <TableBody dense={isDense}>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="py-12 text-center text-slate-500"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row, idx) => {
              const rowKey = row[keyField] || idx;
              const isSelected = selectedKeys.includes(rowKey);

              return (
                <TableRow
                  key={rowKey}
                  dense={isDense}
                  selected={isSelected}
                  clickable={Boolean(onRowClick)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={density === 'spacious' ? 'h-14' : ''}
                >
                  {selectable && (
                    <TableCell align="center" className="w-10">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(rowKey, e)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        aria-label={`Select row ${rowKey}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={col.key} align={col.align || 'left'} dense={isDense}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>
              Showing {totalItems === 0 ? 0 : startIndex + 1}–
              {Math.min(startIndex + pageSize, totalItems)} of {totalItems}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="xs"
              variant="outline"
              disabled={effectivePage === 1}
              onClick={() => setCurrentPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={effectivePage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 font-medium text-slate-300">
              Page {effectivePage} of {totalPages}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={effectivePage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="xs"
              variant="outline"
              disabled={effectivePage === totalPages}
              onClick={() => setCurrentPage(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
