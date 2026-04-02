import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

const taskData = [
  { date: "Mon", tasks: 4 },
  { date: "Tue", tasks: 7 },
  { date: "Wed", tasks: 5 },
  { date: "Thu", tasks: 12 },
  { date: "Fri", tasks: 8 },
  { date: "Sat", tasks: 3 },
  { date: "Sun", tasks: 6 },
]

const tokenData = [
  { date: "Mon", tokens: 1200 },
  { date: "Tue", tokens: 3400 },
  { date: "Wed", tokens: 2100 },
  { date: "Thu", tokens: 5600 },
  { date: "Fri", tokens: 4200 },
  { date: "Sat", tokens: 1800 },
  { date: "Sun", tokens: 2900 },
]

export function AgentMetricsPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs tracking-wider uppercase">Tasks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "monospace" }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 0,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Bar dataKey="tasks" fill="oklch(0.75 0.18 162)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="font-mono text-xs tracking-wider uppercase">Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={tokenData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: "monospace" }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10, fontFamily: "monospace" }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 0,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              />
              <Area type="monotone" dataKey="tokens" stroke="oklch(0.75 0.18 162)" fill="oklch(0.75 0.18 162 / 0.15)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
