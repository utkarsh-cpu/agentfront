import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { CaretUp, CaretDown } from "@phosphor-icons/react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  isLoading?: boolean
  emptyMessage?: string
  enableRowSelection?: boolean
  onRowSelectionChange?: (selection: RowSelectionState) => void
  className?: string
}

export function DataTable<TData>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available.",
  enableRowSelection = false,
  onRowSelectionChange,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

  const handleRowSelectionChange = React.useCallback(
    (updater: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)) => {
      setRowSelection((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater
        onRowSelectionChange?.(next)
        return next
      })
    },
    [onRowSelectionChange],
  )

  const table = useReactTable({
    data,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: enableRowSelection
      ? handleRowSelectionChange
      : undefined,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection,
  })

  return (
    <div
      className={cn(
        "w-full overflow-auto border border-border/50 font-mono",
        className,
      )}
    >
      <table className="w-full caption-bottom text-xs">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className="border-b border-border/50 bg-muted/30"
            >
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                return (
                  <th
                    key={header.id}
                    className={cn(
                      "px-3 py-2 text-left text-xs font-medium tracking-wider text-muted-foreground uppercase",
                      canSort && "cursor-pointer select-none",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {canSort && (
                        <span className="inline-flex flex-col text-muted-foreground/40">
                          <CaretUp
                            weight="fill"
                            className={cn(
                              "size-2.5 -mb-0.5",
                              sorted === "asc" && "text-terminal",
                            )}
                          />
                          <CaretDown
                            weight="fill"
                            className={cn(
                              "size-2.5",
                              sorted === "desc" && "text-terminal",
                            )}
                          />
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>

        <tbody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="border-b border-border/30">
                  {columns.map((_, j) => (
                    <td key={`skeleton-${i}-${j}`} className="px-3 py-2.5">
                      <Skeleton className="h-3.5 w-full" />
                    </td>
                  ))}
                </tr>
              ))
            : table.getRowModel().rows.length > 0
              ? table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    className="border-b border-border/30 transition-colors hover:bg-muted/20 data-[state=selected]:bg-terminal/5"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-3 py-8 text-center text-xs text-muted-foreground"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )}
        </tbody>
      </table>
    </div>
  )
}
