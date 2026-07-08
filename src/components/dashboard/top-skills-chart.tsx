"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Code2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopSkill } from "@/services/analytics.service";

export function TopSkillsChart({ skills }: { skills: TopSkill[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Top Skills Among Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        {skills.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={skills} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="skill"
                width={110}
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
              <Bar dataKey="count" name="Candidates" fill="hsl(243 75% 65%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Code2 className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No skills data yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        Once candidates&apos; resumes are parsed, their top skills will show up here.
      </p>
    </div>
  );
}

export function TopSkillsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Top Skills Among Candidates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
