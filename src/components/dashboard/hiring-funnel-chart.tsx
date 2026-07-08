"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FunnelStage } from "@/services/analytics.service";

export function HiringFunnelChart({ stages, rejected }: { stages: FunnelStage[]; rejected: number }) {
  const total = stages.reduce((sum, s) => sum + s.count, 0) + rejected;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stages} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted))" }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Candidates" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {rejected > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                {rejected} candidate{rejected === 1 ? "" : "s"} rejected along the way (not shown above).
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Filter className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No applications yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        Once candidates apply, you&apos;ll see them move through your hiring stages here.
      </p>
    </div>
  );
}

export function HiringFunnelChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Hiring Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
