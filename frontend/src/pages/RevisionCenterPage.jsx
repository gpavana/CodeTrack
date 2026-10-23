import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Brain,
  Check,
} from 'lucide-react';
import { revisionApi } from '../api/revisionApi';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { useToast } from '../context/ToastContext';
import { formatDate, formatRelativeDate, formatDateTime } from '../utils/formatters';

export const RevisionCenterPage = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dueToday'); // 'dueToday', 'overdue', 'upcoming', 'completed'
  const [data, setData] = useState({
    dueToday: [],
    overdue: [],
    upcoming: [],
    completed: [],
  });
  const [loading, setLoading] = useState(true);

  // Complete revision modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [scheduleNext, setScheduleNext] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchRevisionData();
  }, []);

  const fetchRevisionData = async () => {
    setLoading(true);
    try {
      const res = await revisionApi.getRevisionCenter();
      setData(
        res.data || {
          dueToday: [],
          overdue: [],
          upcoming: [],
          completed: [],
        }
      );
    } catch (err) {
      console.error('Failed to load revision center:', err);
      showToast('Failed to load revision data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCompleteModal = (rev) => {
    setSelectedRevision(rev);
    setCompleteNotes('');
    setScheduleNext(true);
    setCompleteModalOpen(true);
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRevision) return;

    setCompleting(true);
    try {
      await revisionApi.completeRevision(selectedRevision.id, {
        notes: completeNotes,
        scheduleNext,
      });

      showToast(
        scheduleNext
          ? 'Revision marked completed! Next spaced revision has been automatically scheduled.'
          : 'Revision marked completed!',
        'success'
      );

      setCompleteModalOpen(false);
      setSelectedRevision(null);
      fetchRevisionData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to complete revision', 'error');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your revision queue..." />;
  }

  const currentList = data[activeTab] || [];

  return (
    <div className="revision-center-page space-y-6">
      {/* Page Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarCheck size={26} className="text-blue-400" /> Spaced Revision Center
          </h1>
          <p className="page-subtitle text-slate-400 text-sm mt-0.5">
            Maintain algorithm pattern recall using spaced repetition intervals (1, 3, 7, and 21 days)
          </p>
        </div>
      </div>

      {/* Spaced Repetition Logic Card */}
      <div className="card p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 flex-shrink-0">
            <Brain size={22} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">How CodeTrack Spaced Revision Works</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              When you complete a revision, CodeTrack automatically schedules your next review:
              <strong className="text-blue-300"> 1st review: +1 day</strong> →
              <strong className="text-blue-300"> 2nd review: +3 days</strong> →
              <strong className="text-blue-300"> 3rd review: +7 days</strong> →
              <strong className="text-blue-300"> 4th+ review: +21 days</strong>.
              This guarantees long-term retention for interview day.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-navigation flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'dueToday' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('dueToday')}
        >
          <Clock size={16} /> Due Today ({data.dueToday.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'overdue' ? 'tab-btn-active' : ''} ${
            data.overdue.length > 0 ? 'text-rose-400' : ''
          }`}
          onClick={() => setActiveTab('overdue')}
        >
          <AlertTriangle size={16} /> Overdue ({data.overdue.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'upcoming' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <Calendar size={16} /> Upcoming ({data.upcoming.length})
        </button>

        <button
          type="button"
          className={`tab-btn ${activeTab === 'completed' ? 'tab-btn-active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <CheckCircle2 size={16} /> Completed ({data.completed.length})
        </button>
      </div>

      {/* Active Tab Content Card */}
      <div className="card">
        {currentList.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CalendarCheck}
              title={
                activeTab === 'dueToday'
                  ? 'No Revisions Due Today'
                  : activeTab === 'overdue'
                  ? 'No Overdue Revisions'
                  : activeTab === 'upcoming'
                  ? 'No Upcoming Revisions'
                  : 'No Completed Revisions'
              }
              description={
                activeTab === 'dueToday' || activeTab === 'overdue'
                  ? 'Great job staying on top of your practice schedule!'
                  : 'Problems will populate here as you solve and schedule them.'
              }
            />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Problem & Platform</th>
                  <th>Topic</th>
                  <th>Difficulty</th>
                  <th>Scheduled Date</th>
                  {activeTab === 'completed' && <th>Completed Date</th>}
                  <th>Notes</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((rev) => (
                  <tr key={rev.id} className="table-row-hover">
                    <td>
                      <Link
                        to={`/problems/${rev.problemId}`}
                        className="font-medium text-slate-100 hover:text-blue-400 transition-colors"
                      >
                        {rev.problemTitle}
                      </Link>
                      <div className="text-xs text-slate-500 mt-0.5">{rev.platform}</div>
                    </td>
                    <td>
                      <span className="text-xs font-mono text-slate-300">{rev.topic}</span>
                    </td>
                    <td>
                      <DifficultyBadge difficulty={rev.difficulty} />
                    </td>
                    <td>
                      <div className="text-xs text-slate-200">{formatDate(rev.scheduledDate)}</div>
                      <div
                        className={`text-[11px] ${
                          activeTab === 'overdue' ? 'text-rose-400 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {formatRelativeDate(rev.scheduledDate)}
                      </div>
                    </td>
                    {activeTab === 'completed' && (
                      <td>
                        <span className="text-xs text-emerald-400">
                          {formatDateTime(rev.completedAt)}
                        </span>
                      </td>
                    )}
                    <td className="max-w-xs truncate text-xs text-slate-400">
                      {rev.notes || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="text-right">
                      {activeTab !== 'completed' ? (
                        <button
                          type="button"
                          className="btn btn-primary-sm"
                          onClick={() => openCompleteModal(rev)}
                        >
                          <Check size={14} /> Mark Completed
                        </button>
                      ) : (
                        <Link
                          to={`/problems/${rev.problemId}`}
                          className="btn btn-ghost-sm text-slate-400 hover:text-white"
                        >
                          View Problem
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Revision Modal */}
      {completeModalOpen && (
        <div className="modal-backdrop" onClick={() => setCompleteModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-400" /> Complete Revision Session
              </h3>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="modal-body space-y-4">
                <p className="text-xs text-slate-300">
                  Completing revision for:{' '}
                  <strong className="text-white font-semibold">
                    {selectedRevision?.problemTitle}
                  </strong>
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="completeNotes">
                    Revision Notes / Recall Insights (Optional)
                  </label>
                  <textarea
                    id="completeNotes"
                    rows={3}
                    placeholder="e.g. Solved quickly without looking at notes. Mastered two-pointer edge case."
                    className="form-textarea text-xs"
                    value={completeNotes}
                    onChange={(e) => setCompleteNotes(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-slate-900/60 rounded border border-slate-800">
                  <input
                    type="checkbox"
                    id="scheduleNextCheckbox"
                    className="checkbox"
                    checked={scheduleNext}
                    onChange={(e) => setScheduleNext(e.target.checked)}
                  />
                  <label htmlFor="scheduleNextCheckbox" className="text-xs text-slate-300 cursor-pointer">
                    Automatically schedule next spaced interval (Recommended: keeps repetition chain active)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCompleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={completing}>
                  {completing ? 'Saving...' : 'Confirm Completed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
