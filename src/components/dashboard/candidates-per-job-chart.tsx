"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CandidatesPerJob } from "@/services/dashboard.service";

export function CandidatesPerJobChart({ data }: { data: CandidatesPerJob[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Candidates per Job</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyChartState />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis
                dataKey="jobTitle"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="candidateCount" name="Candidates" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChartState() {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Briefcase className="h-5 w-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium">No jobs yet</p>
      <p className="max-w-[220px] text-xs text-muted-foreground">
        Create your first job posting to start seeing candidate data here.
      </p>
    </div>
  );
}

export function CandidatesPerJobChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Candidates per Job</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}
