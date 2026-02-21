"use client";

import { AnalyticsPayload } from "@/app/analytics/actions";
import {
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#64748b'];

export default function AnalyticsCharts({ data }: { data: AnalyticsPayload }) {

    return (
        <div className="space-y-8">
            {/* Chart 1: Category Pie Chart */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Where Does My Money Go?</h3>
                {data.categories.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <PieTooltip formatter={(value) => `₹${value}`} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-10">No expense data yet.</p>
                )}
            </div>

            {/* Chart 2: Friendship Graph */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">The Friendship Graph</h3>
                {data.friendships.length > 0 ? (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.friendships} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#888' }} />
                                <YAxis tick={{ fill: '#888' }} />
                                <BarTooltip cursor={{ fill: 'transparent' }} formatter={(value) => `₹${value}`} />
                                <Legend />
                                <Bar dataKey="I Owe" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="They Owe Me" fill="#22c55e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-slate-500 py-10">All settled up! No active debts.</p>
                )}
            </div>

            {/* Chart 3: Monthly Spending Trend */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Monthly Spending Trend</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.monthly} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="month" tick={{ fill: '#888' }} />
                            <YAxis tick={{ fill: '#888' }} />
                            <BarTooltip formatter={(value) => `₹${value}`} />
                            <Line type="monotone" dataKey="spending" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
