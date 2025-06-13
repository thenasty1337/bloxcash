'use client';

import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  flexRender,
} from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import { User } from '../user-listing';
import { columns } from './columns';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface UserTableProps {
  data: User[];
  totalItems: number;
}

export function UserTable({ data, totalItems }: UserTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Add debugging
  console.log('📊 UserTable received props:', {
    dataLength: data?.length || 0,
    totalItems,
    data: data?.slice(0, 2) // Log first 2 items for debugging
  });
  
  // Initialize sorting from URL params
  const initialSortBy = searchParams.get('sortBy') || 'balance';
  const initialSortOrder = searchParams.get('sortOrder') || 'DESC';
  
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: initialSortBy,
      desc: initialSortOrder === 'DESC'
    }
  ]);
  
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Update URL when sorting changes
  useEffect(() => {
    if (sorting.length > 0) {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      current.set('sortBy', sorting[0].id);
      current.set('sortOrder', sorting[0].desc ? 'DESC' : 'ASC');
      
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${window.location.pathname}${query}`);
    }
  }, [sorting, router, searchParams]);

  const table = useReactTable({
    data: data || [], // Ensure data is never undefined
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    manualSorting: true, // We handle sorting server-side
    manualPagination: true, // We handle pagination server-side
    pageCount: Math.ceil(totalItems / 10),
  });

  console.log('🎯 UserTable table state:', {
    rowCount: table.getRowModel().rows.length,
    pageCount: table.getPageCount(),
    sorting,
    columnFilters
  });

  // Show a message if no data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-muted-foreground">No users found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or search terms
          </p>
        </div>
      </div>
    );
  }

  // Use a simple table implementation instead of the complex DataTable
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Simple pagination info */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {totalItems} users
        </div>
        <div className="text-sm text-muted-foreground">
          Page {Math.ceil(totalItems / 10) > 0 ? 1 : 0} of {Math.ceil(totalItems / 10)}
        </div>
      </div>
    </div>
  );
} 