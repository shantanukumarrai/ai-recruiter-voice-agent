"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterviewCompletionStats } from "@/services/analytics.service";

export function InterviewCompletionChart({ stats }: { stats: InterviewCompletionStats }) {
  const data = [
    { name: "Completed", value: stats.completed, color: "hsl(var(--success))" },
    { name: "Remaining", value: stats.total - stats.completed, color: "hsl(var(--muted))" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Interview Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.total === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex items-center gap-6">
            <div className="relative h-40 w-40 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={55}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold">{stats.completionRate}%</span>
                <span className="text-[10px] text-muted-foreground">completed</span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <StatRow label="Total Interviews" value={stats.total} />
              <StatRow label="Completed" value={stats.completed} />
              <StatRow label="In Progress" value={stats.inProgress} />
              <StatRow label="Scheduled" value={stats.scheduled} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-8">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No interviews yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        Send interview invites to start tracking completion rate.
      </p>
    </div>
  );
}

export function InterviewCompletionChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Interview Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
