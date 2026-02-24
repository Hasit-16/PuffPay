"use client";

import { AnalyticsPayload } from "@/app/analytics/actions";
import {
    PieChart, Pie, Cell, Tooltip as PieTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as BarTooltip, ResponsiveContainer,
    LineChart, Line
} from "recharts";

const COLORS = ['#22C55E', '#EAB308', '#06B6D4', '#EF4444', '#71717A'];

export default function AnalyticsCharts({ data }: { data: AnalyticsPayload }) {

    return (
        <div className="space-y-8">
            {/* Chart 1: Category Pie Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mb-6">
                <h3 className="text-zinc-50 font-bold text-lg mb-4">Where Does My Money Go?</h3>
                {data.categories.length > 0 ? (
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart style={{ outline: 'none' }}>
                                <defs>
                                    <filter id="neonGreen" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22C55E" floodOpacity="0.8" />
                                    </filter>
                                    <filter id="neonYellow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EAB308" floodOpacity="0.8" />
                                    </filter>
                                    <filter id="neonBlue" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#06B6D4" floodOpacity="0.8" />
                                    </filter>
                                    <filter id="neonRed" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.8" />
                                    </filter>
                                    <filter id="neonZinc" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#71717A" floodOpacity="0.5" />
                                    </filter>
                                </defs>
                                <Pie
                                    data={data.categories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.categories.map((entry, index) => {
                                        const filters = ['url(#neonGreen)', 'url(#neonYellow)', 'url(#neonBlue)', 'url(#neonRed)', 'url(#neonZinc)'];
                                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} filter={filters[index % filters.length]} stroke="none" style={{ outline: 'none' }} />
                                    })}
                                </Pie>
                                <PieTooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fafafa' }} itemStyle={{ color: '#fafafa' }} />
                                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-zinc-400 text-xs py-10">No expense data yet.</p>
                )}
            </div>

            {/* Chart 2: Friendship Graph */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mb-6">
                <h3 className="text-zinc-50 font-bold text-lg mb-4">The Friendship Graph</h3>
                {data.friendships.length > 0 ? (
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.friendships} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} style={{ outline: 'none' }}>
                                <defs>
                                    <filter id="neonRedBar" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#EF4444" floodOpacity="0.8" />
                                    </filter>
                                    <filter id="neonGreenBar" x="-20%" y="-20%" width="140%" height="140%">
                                        <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#22C55E" floodOpacity="0.8" />
                                    </filter>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                                <BarTooltip cursor={{ fill: 'transparent' }} formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fafafa' }} itemStyle={{ color: '#fafafa' }} />
                                <Legend wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }} />
                                <Bar dataKey="I Owe" fill="#EF4444" radius={[4, 4, 0, 0]} filter="url(#neonRedBar)" activeBar={{ strokeWidth: 0 }} />
                                <Bar dataKey="They Owe Me" fill="#22C55E" radius={[4, 4, 0, 0]} filter="url(#neonGreenBar)" activeBar={{ strokeWidth: 0 }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <p className="text-center text-zinc-400 text-xs py-10">All settled up! No active debts.</p>
                )}
            </div>

            {/* Chart 3: Weekly Spending Trend */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl mb-6">
                <h3 className="text-zinc-50 font-bold text-lg mb-4">Weekly Spending Trend</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.weekly} margin={{ top: 20, right: 20, left: 0, bottom: 5 }} style={{ outline: 'none' }}>
                            <defs>
                                <filter id="neonLine" x="-10%" y="-10%" width="120%" height="120%">
                                    <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#22C55E" floodOpacity="0.9" />
                                </filter>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="week" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                            <BarTooltip formatter={(value) => `₹${value}`} contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fafafa' }} itemStyle={{ color: '#fafafa' }} />
                            <Line type="monotone" dataKey="spending" stroke="#22C55E" strokeWidth={4} dot={{ r: 5, fill: '#14532d', stroke: '#22C55E', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#22C55E', stroke: 'none' }} filter="url(#neonLine)" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
