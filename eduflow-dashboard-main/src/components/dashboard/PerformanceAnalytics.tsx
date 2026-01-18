import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export function PerformanceAnalytics({ filters }: { filters?: { coursId?: string; formateurId?: string; formateurEmail?: string; etudiantEmail?: string } }) {
    const [data, setData] = useState<Array<{ range: string; count: number }>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.coursId) params.append("coursId", filters.coursId);
        if (filters?.formateurId) params.append("formateurId", filters.formateurId);
        if (filters?.formateurEmail) params.append("formateurEmail", filters.formateurEmail);
        if (filters?.etudiantEmail) params.append("etudiantEmail", filters.etudiantEmail);

        apiFetch(`http://localhost:8080/api/dashboard/performance?${params.toString()}`)
            .then(res => res.json())
            .then(distribution => {
                setData(distribution);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching performance distribution:", err);
                setLoading(false);
            });
    }, [filters]);

    return (
        <div className="bg-card rounded-xl border shadow-card p-6">
            <div className="mb-6">
                <h3 className="font-semibold text-foreground">Distribution des performances</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Répartition des notes par tranches
                </p>
            </div>
            <div className="h-[300px]">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Chargement...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" vertical={false} />
                            <XAxis
                                dataKey="range"
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
                                formatter={(value: number) => [`${value} étudiant${value > 1 ? 's' : ''}`, "Nombre"]}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={() => <span className="text-sm text-muted-foreground">Notes (/20)</span>}
                            />
                            <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
