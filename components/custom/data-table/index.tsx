"use client";

import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

import useDebounceValue from "@/hooks/useDebounceValue";
import { useColumnAutoWidth } from "@/hooks/useColumnAutoWidth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServerTableProps } from "@/types/general";
import { Input } from "@/components/ui/input";

export function ServerTable<T>({
  columns,
  data,
  pageCount,
  total,
  isLoading = false,
  pagination,
  onPaginationChange,
  onSortChange,
  onSearch,
}: ServerTableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const debounceValue = useDebounceValue(search);

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination: {
        pageIndex,
        pageSize: pagination?.pageSize ?? 10,
      },
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      const newSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(newSorting);
      if (onSortChange && newSorting[0]) {
        onSortChange({
          key: newSorting[0].id,
          desc: newSorting[0].desc,
        });
      }
    },
    onPaginationChange: (updaterOrValue) => {
      const newPagination = typeof updaterOrValue === "function"
        ? updaterOrValue({ pageIndex, pageSize: pagination?.pageSize ?? 10 })
        : updaterOrValue;
      setPageIndex(newPagination.pageIndex);
      onPaginationChange?.(newPagination);
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (onSearch) onSearch(debounceValue);
  }, [debounceValue, onSearch]);

  // const columnIds = table.getAllColumns().map((col) => col.id);
  // const { ref: shadowRef, colWidths } = useColumnAutoWidth(data, columnIds);

  return (
    <div className="max-w-full overflow-x-scroll rounded-lg shadow bg-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <Input
          type="text"
          value={search}
          onChange={handleSearch}
          placeholder="🔍 Cari kata kunci..."
          className="border border-gray-300 p-2 rounded-md w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <div className="text-gray-600 text-sm">
          Total: <span className="font-medium">{total}</span> records
        </div>
      </div>

      <Table>
        <TableHeader className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  // style={{ width: colWidths[header.id as any] }}
                  className="text-left p-4 cursor-pointer select-none font-semibold text-gray-700 border-b border-gray-200 transition-colors hover:bg-gray-100"
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: <FaArrowUp className="text-xs" />,
                      desc: <FaArrowDown className="text-xs" />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500 animate-pulse">
                Loading data...
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row, idx) => (
              <TableRow
                key={row.id}
                className={`border-t transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50`}
              >
                {row.getVisibleCells().map(cell => {
                  return (
                    <TableCell
                    key={cell.id}
                    // style={{ width: colWidths[cell.column.id as any] }}
                    className="p-4 text-gray-700 break-words"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                  )
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-t">
        <div className="text-sm text-gray-500">
          Showing page <span className="font-semibold">{pageIndex + 1}</span> of <span className="font-semibold">{pageCount}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const newPage = Math.max(pageIndex - 1, 0);
              setPageIndex(newPage);
              onPaginationChange?.({ pageIndex: newPage, pageSize: pagination?.pageSize ?? 10 });
            }}
            disabled={pageIndex === 0}
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Prev
          </button>
          <button
            onClick={() => {
              const newPage = pageIndex + 1;
              setPageIndex(newPage);
              onPaginationChange?.({ pageIndex: newPage, pageSize: pagination?.pageSize ?? 10 });
            }}
            disabled={pageIndex + 1 >= pageCount}
            className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Hidden Shadow Table for Width Calculation */}
      {/* <div className="absolute top-0 left-0 invisible h-0 overflow-hidden">
        <Table ref={shadowRef}>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columnIds.map(id => (
                  <TableCell key={id}>{String((row as any)[id] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div> */}
    </div>
  );
}
