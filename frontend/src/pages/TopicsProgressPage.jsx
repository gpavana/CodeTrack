import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, CheckCircle2, Code2, ExternalLink, X } from 'lucide-react';
import { topicApi } from '../api/topicApi';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';

export const TopicsProgressPage = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected topic for drill-down modal/drawer
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicProblems, setTopicProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await topicApi.getTopics();
      setTopics(res.data || []);
    } catch (err) {
      console.error('Failed to load topics:', err);
      setError('Failed to load topic progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTopic = async (topicName) => {
    setSelectedTopic(topicName);
    setLoadingProblems(true);
    try {
      const res = await topicApi.getProblemsByTopic(topicName);
      setTopicProblems(res.data || []);
    } catch (err) {
      console.error('Failed to load problems for topic:', err);
      setTopicProblems([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading curriculum topics..." />;
  }

  const totalCurriculumProblems = topics.reduce((acc, t) => acc + t.total, 0);
  const totalCurriculumSolved = topics.reduce((acc, t) => acc + t.solved, 0);

  return (
    <div className="topics-page space-y-6">
      {/* Page Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen size={26} className="text-blue-400" /> Topics & Progress
          </h1>
          <p className="page-subtitle text-slate-400 text-sm mt-0.5">
            Track interview curriculum coverage and pattern mastery across all core DSA domains
          </p>
        </div>
        <div className="text-sm text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Overall: <strong className="text-emerald-400 font-semibold">{totalCurriculumSolved}</strong> of{' '}
          <strong className="text-white font-semibold">{totalCurriculumProblems}</strong> problems solved
        </div>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map((t) => {
          const percentage = t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0;
          return (
            <div
              key={t.topic}
              className="card p-5 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between"
              onClick={() => handleOpenTopic(t.topic)}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-white group-hover:text-blue-400">
                    {t.topic}
                  </h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {t.solved} / {t.total}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-3 border-t border-slate-800/80 mt-2">
                <span>{percentage}% Solved</span>
                <span className="text-blue-400 flex items-center gap-1 hover:text-blue-300">
                  View Problems <ArrowRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill-down Drawer / Modal */}
      {selectedTopic && (
        <div className="modal-backdrop" onClick={() => setSelectedTopic(null)}>
          <div className="modal-card max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-400" />
                  {selectedTopic} Problems
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Problems currently logged under this category
                </p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedTopic(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body p-0 max-h-96 overflow-y-auto">
              {loadingProblems ? (
                <div className="p-8">
                  <LoadingSpinner message="Loading problems for this topic..." />
                </div>
              ) : topicProblems.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    title={`No problems in ${selectedTopic}`}
                    description="You haven't tracked any problems for this topic yet."
                    actionLabel="Add Problem in this Topic"
                    actionLink={`/problems/new`}
                  />
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {topicProblems.map((prob) => (
                    <div
                      key={prob.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-800/40"
                    >
                      <div>
                        <Link
                          to={`/problems/${prob.id}`}
                          className="font-medium text-slate-200 hover:text-blue-400 text-sm block"
                          onClick={() => setSelectedTopic(null)}
                        >
                          {prob.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-500">{prob.platform}</span>
                          <span className="text-slate-600 text-xs">•</span>
                          <DifficultyBadge difficulty={prob.difficulty} />
                        </div>
                      </div>
                      <StatusBadge status={prob.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer flex justify-between">
              <Link
                to={`/problems?topic=${encodeURIComponent(selectedTopic)}`}
                className="btn btn-secondary text-xs"
                onClick={() => setSelectedTopic(null)}
              >
                Open in Full Problem List
              </Link>
              <button
                type="button"
                className="btn btn-primary text-xs"
                onClick={() => setSelectedTopic(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
