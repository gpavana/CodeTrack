import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  CheckCircle2,
  Clock,
  CalendarCheck,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { dashboardApi } from '../api/dashboardApi';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { formatDate, formatRelativeDate } from '../utils/formatters';

const DIFFICULTY_COLORS = {
  EASY: '#10b981', // emerald
  MEDIUM: '#f59e0b', // amber
  HARD: '#f43f5e', // rose
};

export const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [topicProgress, setTopicProgress] = useState([]);
  const [difficultyDist, setDifficultyDist] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ recentProblems: [], upcomingRevisions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [sumRes, topicRes, diffRes, actRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getTopicProgress(),
        dashboardApi.getDifficultyDistribution(),
        dashboardApi.getRecentActivity(),
      ]);

      setSummary(sumRes.data);
      // Filter topicProgress for topics that have at least 1 problem for cleaner chart display
      const activeTopics = (topicRes.data || []).filter((t) => t.total > 0);
      setTopicProgress(activeTopics.length > 0 ? activeTopics : topicRes.data.slice(0, 8));
      setDifficultyDist(diffRes.data || []);
      setRecentActivity(actRes.data || { recentProblems: [], upcomingRevisions: [] });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load dashboard metrics. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating preparation metrics..." />;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <AlertCircle size={20} />
        <div>
          <div className="font-semibold">Dashboard Error</div>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    );
  }

  // Prep pie chart data
  const pieData = difficultyDist
    .filter((d) => d.total > 0)
    .map((d) => ({
      name: d.difficulty.charAt(0) + d.difficulty.slice(1).toLowerCase(),
      value: d.total,
      difficulty: d.difficulty,
    }));

  return (
    <div className="dashboard-page">
      {/* Page Title & Quick Actions */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight">
            Preparation Dashboard
          </h1>
          <p className="page-subtitle text-slate-400 text-sm mt-0.5">
            Monitor real-time DSA progress, upcoming spaced revisions, and mastery metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/revisions" className="btn btn-secondary">
            <CalendarCheck size={16} /> Due Revisions
            {summary?.dueRevisions > 0 && (
              <span className="badge badge-rose ml-1 text-xs px-1.5 py-0.2">
                {summary.dueRevisions}
              </span>
            )}
          </Link>
          <Link to="/problems/new" className="btn btn-primary">
            <PlusCircle size={16} /> Add Problem
          </Link>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tracked Problems"
          value={summary?.totalProblems ?? 0}
          subtitle="Problems logged"
          icon={Code2}
          color="blue"
        />
        <StatCard
          title="Solved Problems"
          value={summary?.solvedProblems ?? 0}
          subtitle={`${summary?.completionRate ?? 0}% overall completion`}
          icon={CheckCircle2}
          color="emerald"
          trend={`${summary?.completionRate ?? 0}%`}
        />
        <StatCard
          title="In Progress"
          value={summary?.inProgressProblems ?? 0}
          subtitle="Under active practice"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Due Revisions"
          value={summary?.dueRevisions ?? 0}
          subtitle={summary?.dueRevisions > 0 ? 'Requires attention today' : 'All caught up!'}
          icon={CalendarCheck}
          color={summary?.dueRevisions > 0 ? 'rose' : 'purple'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Topic-Wise Progress Bar Chart (2 Cols) */}
        <div className="card lg:col-span-2">
          <div className="card-header flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Topic Mastery & Progress</h2>
              <p className="text-xs text-slate-400">Total vs Solved problems per topic</p>
            </div>
            <Link to="/topics" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All Topics <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body pt-4">
            {topicProgress.length === 0 || topicProgress.every((t) => t.total === 0) ? (
              <EmptyState
                title="No Topic Data Yet"
                description="Add coding problems to start visualizing your topic-wise mastery."
                actionLabel="Log a Problem"
                actionLink="/problems/new"
              />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topicProgress}
                    margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="topic"
                      stroke="#64748b"
                      fontSize={11}
                      tickLine={false}
                      angle={-25}
                      textAnchor="end"
                    />
                    <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.375rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="total" name="Total Problems" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="solved" name="Solved Problems" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Difficulty Distribution Pie Chart (1 Col) */}
        <div className="card">
          <div className="card-header pb-3 border-b border-slate-800">
            <h2 className="text-base font-semibold text-white">Difficulty Breakdown</h2>
            <p className="text-xs text-slate-400">Distribution across problem complexity</p>
          </div>

          <div className="card-body pt-4 flex flex-col items-center justify-center">
            {pieData.length === 0 ? (
              <EmptyState
                title="No Problems Yet"
                description="Your difficulty chart will display once you add your first problem."
              />
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={`cell-${entry.difficulty}`}
                          fill={DIFFICULTY_COLORS[entry.difficulty] || '#64748b'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderColor: '#334155',
                        borderRadius: '0.375rem',
                        color: '#f8fafc',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      wrapperStyle={{ fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Lower Section: Recent Problems & Upcoming Revisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Problems Card */}
        <div className="card">
          <div className="card-header flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Recently Updated Problems</h2>
              <p className="text-xs text-slate-400">Latest problem activity in your account</p>
            </div>
            <Link to="/problems" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              All Problems <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body p-0">
            {recentActivity.recentProblems?.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No Problems Added"
                  description="Start by adding your first coding interview problem."
                  actionLabel="Add Problem"
                  actionLink="/problems/new"
                />
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Topic</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentProblems.map((prob) => (
                      <tr key={prob.id} className="table-row-hover">
                        <td>
                          <Link
                            to={`/problems/${prob.id}`}
                            className="font-medium text-slate-200 hover:text-blue-400 transition-colors"
                          >
                            {prob.title}
                          </Link>
                          <div className="text-xs text-slate-500 mt-0.5">{prob.platform}</div>
                        </td>
                        <td>
                          <span className="text-xs font-mono text-slate-300">{prob.topic}</span>
                        </td>
                        <td>
                          <DifficultyBadge difficulty={prob.difficulty} />
                        </td>
                        <td>
                          <StatusBadge status={prob.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Revisions Card */}
        <div className="card">
          <div className="card-header flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-white">Upcoming Spaced Revisions</h2>
              <p className="text-xs text-slate-400">Scheduled spaced repetition queue</p>
            </div>
            <Link to="/revisions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Revision Center <ArrowRight size={14} />
            </Link>
          </div>

          <div className="card-body p-0">
            {recentActivity.upcomingRevisions?.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No Revisions Scheduled"
                  description="When you mark problems as Solved, spaced revisions (1, 3, 7, 21 days) will appear here."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {recentActivity.upcomingRevisions.map((rev) => (
                  <div key={rev.id} className="p-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                    <div className="min-w-0 pr-4">
                      <Link
                        to={`/problems/${rev.problemId}`}
                        className="font-medium text-slate-200 hover:text-blue-400 truncate block text-sm"
                      >
                        {rev.problemTitle}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-mono">{rev.topic}</span>
                        <span className="text-slate-600 text-xs">•</span>
                        <DifficultyBadge difficulty={rev.difficulty} />
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                        {formatRelativeDate(rev.scheduledDate)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {formatDate(rev.scheduledDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
