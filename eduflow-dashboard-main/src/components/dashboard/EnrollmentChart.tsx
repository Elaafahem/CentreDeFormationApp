import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function EnrollmentChart({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
  const [data, setData] = useState<Array<{ month: string; inscriptions: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.coursId) params.append("coursId", filters.coursId);
    if (filters?.formateurId) params.append("formateurId", filters.formateurId);
    if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
    if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

    apiFetch(`http://localhost:8080/api/dashboard/enrollments-by-month?${params.toString()}`)
      .then(res => res.json())
      .then(chartData => {
        setData(chartData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching enrollment data:", err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <div className="bg-card rounded-xl border shadow-card p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Inscriptions mensuelles</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Évolution des inscriptions sur l'année
        </p>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chargement...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorInscriptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(215, 20%, 90%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                }}
                labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 500 }}
              />
              <Area
                type="monotone"
                dataKey="inscriptions"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInscriptions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
