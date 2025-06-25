'use client';

import { useState, useEffect } from 'react';
import "remixicon/fonts/remixicon.css";
import api from '../../../lib/api';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

type StartCardProps = {
    title: string;
    value: number | string;
    icon: string;
    trend?: {
        value: number;
        positive: boolean;
    };
    color?: 'indigo' | 'green' | 'amber' | 'blue';
};

type TranslationProgress = {
    name: string;
    translations: number;
    score: number;
};

type ScoreDistribution = {
    name: string;
    value: number;
    color: string;
};

type LanguageBreakdown = {
    name: string;
    value: number;
};

type RecentActivity = {
    date: string;
    bookTitle: string;
    paragraphs: number;
    score: number;
};

export default function ChartPage() {
    // State for different chart data
    const [translationProgress, setTranslationProgress] = useState<TranslationProgress[]>([]);
    const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
    const [languageBreakdown, setLanguageBreakdown] = useState<LanguageBreakdown[]>([]);
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
    const [summaryStats, setSummaryStats] = useState({
        totalTranslations: 0,
        averageScore: 0,
        completedBooks: 0,
        streakDays: 0,
        trends: {
            translations: { value: 0, positive: true },
            score: { value: 0, positive: true },
            books: { value: 0, positive: true },
        }
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<String | null>(null);
    const [selectedTimeFrame, setSelectedTimeFrame] = useState<'week' | 'month' | 'year'>('month');
    const [selectedChart, setSelectedChart] = useState('progress');

    // Colors for charts
    const COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'];
    const SCORE_COLORS = {
        excellent: '#4ade80',
        good: '#a3e635',
        average: '#facc15',
        fair: '#fb923c',
        poor: '#f87171'
    };

    // Fetch summary stats
    const fetchSummaryStats = async () => {
        try {
            const response = await api.get('api/stats/summary');
            setSummaryStats(response.data);
        } catch (error) {
            console.error("Error fetching summary stats:", error);
            setError("統計サマリーの取得に失敗しました");
        }
    };

    // Fetch translation progress
    const fetchTranslationProgress = async (timeframe: 'week' | 'month' | 'year') => {
        try {
            const response = await api.get(`api/stats/progress?timeframe=${timeframe}`);
            // API response format: { data: [{ period, translations, score }], timeframe }
            const formattedData = response.data.data.map((item: { period: string; translations: number; score: number }) => ({
                name: formatPeriodLabel(item.period, timeframe),
                translations: item.translations,
                score: item.score
            }));
            setTranslationProgress(formattedData);
        } catch (error) {
            console.error("Error fetching translation progress:", error);
            setError("翻訳進捗の取得に失敗しました");
        }
    };

    // Fetch score distribution
    const fetchScoreDistribution = async () => {
        try {
            const response = await api.get('api/stats/scoreDistribution');
            // API response format: { distribution: [{ range, label, count }] }
            const formattedData = response.data.distribution.map((item: { label: string; range: string; count: number; }) => ({
                name: `${item.label} (${item.range})`,
                value: item.count,
                color: getScoreColor(item.range)
            }));
            setScoreDistribution(formattedData);
        } catch (error) {
            console.error("Error fetching score distribution:", error);
            setError("スコア分布の取得に失敗しました");
        }
    };

    // Fetch language breakdown
    const fetchLanguageBreakdown = async () => {
        try {
            const response = await api.get('api/stats/languages');
            // API response format: { languages: [{ language, bookCount }] }
            const formattedData = response.data.languages.map((item: { language: string; bookCount: number }) => ({
                name: item.language,
                value: item.bookCount
            }));
            setLanguageBreakdown(formattedData);
        } catch (error) {
            console.error("Error fetching language breakdown:", error);
            setError("言語別統計の取得に失敗しました");
        }
    };

    // Fetch recent activity
    const fetchRecentActivity = async () => {
        try {
            const response = await api.get('api/stats/recentActivity?limit=10');
            // API response format: { activities: [{ date, bookTitle, paragraphsTranslated, score, bookId }] }
            const formattedData = response.data.activities.map((item: { date: string; bookTitle: string; paragraphsTranslated: number; score: number; bookId: number; }) => ({
                date: item.date,
                bookTitle: item.bookTitle,
                paragraphs: item.paragraphsTranslated,
                score: item.score,
                bookId: item.bookId
            }));
            setRecentActivity(formattedData);
        } catch (error) {
            console.error("Error fetching recent activity:", error);
            setError("最近の活動の取得に失敗しました");
        }
    };

    // Helper function to format period labels
    const formatPeriodLabel = (period: string, timeframe: string) => {
        const date = new Date(period);
        switch (timeframe) {
            case 'week':
                return `${date.getMonth() + 1}/${date.getDate()}`;
            case 'month':
                return `${date.getMonth() + 1}/${date.getDate()}`;
            case 'year':
                const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
                return monthNames[date.getMonth()];
            default:
                return period;
        }
    };

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };

    // Helper function to get color based on score range
    const getScoreColor = (range: string) => {
        if (range.startsWith('90')) return SCORE_COLORS.excellent;
        if (range.startsWith('80')) return SCORE_COLORS.good;
        if (range.startsWith('70')) return SCORE_COLORS.average;
        if (range.startsWith('60')) return SCORE_COLORS.fair;
        return SCORE_COLORS.poor;
    };

    // Fetch all data
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await Promise.all([
                    fetchSummaryStats(),
                    fetchTranslationProgress(selectedTimeFrame),
                    fetchScoreDistribution(),
                    fetchLanguageBreakdown(),
                    fetchRecentActivity()
                ]);
            } catch (error) {
                console.error("Error fetching data:", error);
                setError("データの取得に失敗しました");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    // Refetch progress data when timeframe changes
    useEffect(() => {
        if (!isLoading) {
            fetchTranslationProgress(selectedTimeFrame);
        }
    }, [selectedTimeFrame]);

    // Time frame selector
    const TimeFrameSelector = () => (
        <div className="flex space-x-4 mb-4">
            <button
                onClick={() => setSelectedTimeFrame('week')}
                className={`px-4 py-2 rounded-md transition-all ${selectedTimeFrame === 'week'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-100'
                    }`}
            >
                週間
            </button>
            <button
                onClick={() => setSelectedTimeFrame('month')}
                className={`px-4 py-2 rounded-md transition-all ${selectedTimeFrame === 'month'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-100'
                    }`}
            >
                月間
            </button>
            <button
                onClick={() => setSelectedTimeFrame('year')}
                className={`px-4 py-2 rounded-md transition-all ${selectedTimeFrame === 'year'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-indigo-100'
                    }`}
            >
                年間
            </button>
        </div>
    );

    // Chart type selector
    const ChartTypeSelector = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
                { id: 'progress', label: '進捗状況', icon: 'ri-line-chart-line' },
                { id: 'scores', label: '得点分布', icon: 'ri-pie-chart-line' },
                { id: 'languages', label: '言語内訳', icon: 'ri-donut-chart-line' },
                { id: 'activity', label: '最近の活動', icon: 'ri-bar-chart-grouped-line' }
            ].map(chart => (
                <button
                    key={chart.id}
                    onClick={() => setSelectedChart(chart.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${selectedChart === chart.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    <span className={`${chart.icon} text-2xl mb-2`}></span>
                    <span className="text-sm font-medium">{chart.label}</span>
                </button>
            ))}
        </div>
    );

    // Render loading state
    if (isLoading) {
        return (
            <div className="pl-16 lg:pl-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">データを読み込み中...</p>
                </div>
            </div>
        );
    }

    // Render error state
    if (error) {
        return (
            <div className="pl-16 lg:pl-16 min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">
                        <span className="ri-error-warning-line"></span>
                    </div>
                    <p className="text-gray-800 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        再読み込み
                    </button>
                </div>
            </div>
        );
    }

    // Helper component for stat cards
    const StatCard = ({ title, value, icon, trend, color = 'indigo' }: StartCardProps) => {
        const colorClasses = {
            indigo: 'bg-indigo-50 text-indigo-700',
            green: 'bg-green-50 text-green-700',
            amber: 'bg-amber-50 text-amber-700',
            blue: 'bg-blue-50 text-blue-700'
        };

        return (
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
                <div className="flex justify-between items-start">
                    <div className="text-gray-500 text-sm font-medium">{title}</div>
                    <div className={`p-2 rounded-md ${colorClasses[color]}`}>
                        <span className={`${icon} text-lg`}></span>
                    </div>
                </div>
                <div className="mt-2 text-3xl font-semibold">{value}</div>
                {trend && (
                    <div className="mt-2 flex items-center text-sm">
                        <span className={trend.positive ? 'text-green-500 ri-arrow-up-line' : 'text-red-500 ri-arrow-down-line'}></span>
                        <span className={trend.positive ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                            {trend.value}% {trend.positive ? '上昇' : '下降'}
                        </span>
                        <span className="text-gray-400 ml-1">（前期比）</span>
                    </div>
                )}
            </div>
        );
    };

    // Render different charts based on selection
    const renderSelectedChart = () => {
        switch (selectedChart) {
            case 'progress':
                return (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">翻訳進捗状況</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={translationProgress}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" interval={0} tickFormatter={(value,index) => index % 2 === 0 ? value : ''} />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="translations"
                                    name="翻訳数"
                                    stroke="#4f46e5"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="score"
                                    name="平均スコア"
                                    stroke="#46e5a8"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'scores':
                return (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">得点分布</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={scoreDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={true}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {scoreDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}件`, '件数']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'languages':
                return (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">翻訳言語内訳</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={languageBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {languageBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}冊`, '書籍数']} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'activity':
                return (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">最近の翻訳活動</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 mb-6">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日付</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">書籍</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ページ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スコア</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentActivity.map((item, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.bookTitle}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.paragraphs}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${item.score >= 90 ? 'bg-green-100 text-green-800' :
                                                    item.score >= 80 ? 'bg-lime-100 text-lime-800' :
                                                        item.score >= 70 ? 'bg-amber-100 text-amber-800' :
                                                            item.score >= 60 ? 'bg-orange-100 text-orange-800' :
                                                                'bg-red-100 text-red-800'
                                                    }`}>
                                                    {item.score}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="pl-16 lg:pl-16 min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">翻訳分析ダッシュボード</h1>
                    <p className="text-gray-600">翻訳の進捗と成績の統計情報</p>
                </div>

                {/* Stats summary row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="総翻訳数"
                        value={summaryStats.totalTranslations}
                        icon="ri-translate-ai-2"
                        trend={summaryStats.trends.translations}
                        color="indigo"
                    />
                    <StatCard
                        title="平均スコア"
                        value={summaryStats.averageScore}
                        icon="ri-medal-line"
                        trend={summaryStats.trends.score}
                        color="green"
                    />
                    <StatCard
                        title="読了書籍"
                        value={summaryStats.completedBooks}
                        icon="ri-book-read-line"
                        trend={summaryStats.trends.books}
                        color="amber"
                    />
                    <StatCard
                        title="連続日数"
                        value={summaryStats.streakDays}
                        icon="ri-calendar-check-line"
                        color="blue"
                    />
                </div>

                {/* Chart selector and time frame */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-medium text-gray-800 mb-4">チャート表示</h2>
                    <ChartTypeSelector />
                    {selectedChart === 'progress' && <TimeFrameSelector />}
                </div>

                {/* Selected chart display */}
                {renderSelectedChart()}
            </div>
        </div>
    );
}