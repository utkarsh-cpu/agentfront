import * as React from "react"
import { formatDistanceToNow, format } from "date-fns"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { cn } from "@workspace/ui/lib/utils"

interface RelativeTimeProps {
  date: string | Date
  className?: string
}

export function RelativeTime({ date, className }: RelativeTimeProps) {
  const dateObj = React.useMemo(
    () => (typeof date === "string" ? new Date(date) : date),
    [date],
  )

  const relative = React.useMemo(
    () => formatDistanceToNow(dateObj, { addSuffix: true }),
    [dateObj],
  )

  const absolute = React.useMemo(
    () => format(dateObj, "MMM d, yyyy 'at' HH:mm:ss"),
    [dateObj],
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <time
            dateTime={dateObj.toISOString()}
            className={cn(
              "cursor-default font-mono text-xs text-muted-foreground",
              className,
            )}
          >
            {relative}
          </time>
        </TooltipTrigger>
        <TooltipContent className="rounded-none font-mono text-xs">
          {absolute}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
