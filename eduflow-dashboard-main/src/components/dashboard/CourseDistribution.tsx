import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(160, 84%, 39%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 80%, 50%)",
  "hsl(215, 16%, 47%)",
];

export function CourseDistribution({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters?.coursId) params.append("coursId", filters.coursId);
    if (filters?.formateurId) params.append("formateurId", filters.formateurId);
    if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
    if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

    apiFetch(`http://localhost:8080/api/dashboard/distribution?${params.toString()}`)
      .then(res => res.json())
      .then(distData => {
        setData(distData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching distribution data:", err);
        setLoading(false);
      });
  }, [filters]);

  return (
    <div className="bg-card rounded-xl border shadow-card p-6">
      <div className="mb-6">
        <h3 className="font-semibold text-foreground">Répartition des Inscriptions</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Nombre d'étudiants par cours
        </p>
      </div>
      <div className="h-[300px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Chargement...
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucune donnée de domaine
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(215, 20%, 90%)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                }}
                formatter={(value: number) => [value, "Étudiants"]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
