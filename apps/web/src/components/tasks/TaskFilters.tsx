import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { X } from "@phosphor-icons/react"
import type { TaskFilters as TF } from "@/types"

interface TaskFiltersProps {
  filters: TF
  onFilterChange: (filters: Partial<TF>) => void
  onReset: () => void
}

export function TaskFilters({ filters, onFilterChange, onReset }: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select value={filters.status ?? "all"} onValueChange={(v) => onFilterChange({ status: v === "all" ? undefined : v as TF["status"] })}>
        <SelectTrigger className="w-36 rounded-none text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="queued">Queued</SelectItem>
          <SelectItem value="running">Running</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => onFilterChange({ dateFrom: e.target.value || undefined })}
        className="w-36 rounded-none text-xs"
        placeholder="From"
      />
      <Input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => onFilterChange({ dateTo: e.target.value || undefined })}
        className="w-36 rounded-none text-xs"
        placeholder="To"
      />

      <Button variant="ghost" size="xs" onClick={onReset} className="text-muted-foreground">
        <X className="mr-1 size-3" /> Reset
      </Button>
    </div>
  )
}
