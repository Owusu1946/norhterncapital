"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface IncomeDataPoint {
    name: string;
    value: number;
}

interface IncomeChartProps {
    data?: IncomeDataPoint[];
    totalIncome?: number;
}

const COLORS = ["#22C55E", "#3B82F6", "#EAB308", "#EF4444", "#8B5CF6"];

export function IncomeChart({ data = [], totalIncome = 0 }: IncomeChartProps) {
    // Use provided data or default
    const chartData = data.length > 0 ? data.map((item, index) => ({
        ...item,
        color: COLORS[index % COLORS.length],
    })) : [
        { name: "Cash", value: 0, color: "#22C55E" },
        { name: "Card", value: 0, color: "#3B82F6" },
        { name: "Momo", value: 0, color: "#EAB308" },
    ];

    const formattedTotal = totalIncome >= 1000
        ? `GH₵${(totalIncome / 1000).toFixed(1)}k`
        : `GH₵${totalIncome.toFixed(0)}`;

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50 h-[300px] flex flex-col">
            <div className="mb-2">
                <h3 className="font-bold text-lg text-gray-800">Total Income</h3>
            </div>

            <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={450}
                            cornerRadius={10}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                            formatter={(value, entry: any) => (
                                <span className="text-gray-600">
                                    {value} ({entry.payload?.value ? `GH₵${entry.payload.value.toFixed(0)}` : '0'})
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center -mt-8 pointer-events-none">
                    <span className="text-xl font-black text-gray-800">{formattedTotal}</span>
                </div>
            </div>
        </div>
    );
}
