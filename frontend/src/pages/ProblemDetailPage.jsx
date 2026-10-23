import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Edit,
  Trash2,
  CalendarCheck,
  Clock,
  Calendar,
  CheckCircle2,
  Layers,
  Code2,
  Plus,
} from 'lucide-react';
import { problemApi } from '../api/problemApi';
import { revisionApi } from '../api/revisionApi';
import { StatusBadge } from '../components/StatusBadge';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDateTime, formatRelativeDate } from '../utils/formatters';
import { PROBLEM_STATUSES } from '../utils/constants';

export const ProblemDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [problem, setProblem] = useState(null);
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status quick update
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Schedule modal
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    loadProblemData();
  }, [id]);

  const loadProblemData = async () => {
    setLoading(true);
    setError('');
    try {
      const [probRes, revRes] = await Promise.all([
        problemApi.getProblemById(id),
        revisionApi.getProblemRevisions(id),
      ]);
      setProblem(probRes.data);
      setRevisions(revRes.data || []);
    } catch (err) {
      console.error('Failed to load problem:', err);
      setError('Problem not found or you do not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!problem || problem.status === newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await problemApi.updateStatus(problem.id, newStatus);
      setProblem(res.data);
      showToast(`Status updated to ${newStatus}`, 'success');
      // Reload revisions in case an auto-schedule was triggered
      const revRes = await revisionApi.getProblemRevisions(id);
      setRevisions(revRes.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await problemApi.deleteProblem(id);
      showToast('Problem deleted successfully', 'success');
      navigate('/problems');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete problem', 'error');
      setDeleting(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleDate) return;
    setScheduling(true);
    try {
      await revisionApi.scheduleRevision(id, {
        scheduledDate: scheduleDate,
        notes: scheduleNotes,
      });
      showToast('Revision scheduled successfully!', 'success');
      setScheduleModalOpen(false);
      setScheduleNotes('');
      // Reload data
      loadProblemData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule revision', 'error');
    } finally {
      setScheduling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading problem details..." />;
  }

  if (error || !problem) {
    return (
      <div className="card p-8 text-center max-w-xl mx-auto mt-12">
        <p className="text-rose-400 font-medium mb-4">{error || 'Problem not found'}</p>
        <Link to="/problems" className="btn btn-secondary">
          <ArrowLeft size={16} /> Return to Problems List
        </Link>
      </div>
    );
  }

  return (
    <div className="problem-detail-page max-w-5xl mx-auto space-y-6">
      {/* Top back navigation and primary action buttons */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <Link to="/problems" className="btn btn-ghost-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Problems
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setScheduleModalOpen(true)}
          >
            <CalendarCheck size={16} /> Schedule Revision
          </button>
          <Link to={`/problems/${problem.id}/edit`} className="btn btn-secondary">
            <Edit size={16} /> Edit
          </Link>
          <button
            type="button"
            className="btn btn-danger-outline"
            onClick={() => setDeleteModalOpen(true)}
            aria-label="Delete problem"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Problem Information Card */}
      <div className="card">
        <div className="card-header p-6 border-b border-slate-800">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <DifficultyBadge difficulty={problem.difficulty} />
                <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
                  {problem.topic}
                </span>
                <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {problem.platform}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                {problem.title}
                {problem.problemUrl && (
                  <a
                    href={problem.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors"
                    title="Open on platform"
                  >
                    <ExternalLink size={18} />
                  </a>
                )}
              </h1>
            </div>

            {/* Quick Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                className="form-select-sm"
                value={problem.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
              >
                {PROBLEM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Complexity & Key Metadata Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 bg-slate-900/40 border-b border-slate-800 text-xs">
          <div>
            <span className="text-slate-500 block mb-1">Time Complexity</span>
            <span className="font-mono text-slate-200 font-medium">
              {problem.timeComplexity || '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Space Complexity</span>
            <span className="font-mono text-slate-200 font-medium">
              {problem.spaceComplexity || '—'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Date Solved</span>
            <span className="text-slate-200">{formatDate(problem.dateSolved)}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Next Revision Due</span>
            <span
              className={`font-medium ${
                problem.nextRevisionDate ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              {problem.nextRevisionDate
                ? `${formatDate(problem.nextRevisionDate)} (${formatRelativeDate(
                    problem.nextRevisionDate
                  )})`
                : 'None scheduled'}
            </span>
          </div>
        </div>

        {/* Solution Notes */}
        <div className="p-6">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Approach & Solution Intuition
          </h2>
          {problem.approachNotes ? (
            <div className="prose-dark bg-slate-950/60 p-4 rounded-lg border border-slate-800 text-slate-200 font-sans text-sm whitespace-pre-wrap leading-relaxed">
              {problem.approachNotes}
            </div>
          ) : (
            <div className="text-slate-500 italic text-sm p-4 bg-slate-950/30 rounded border border-slate-800/60">
              No approach notes documented for this problem yet. Click Edit to document key insights.
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        <div className="px-6 py-3 bg-slate-950/40 border-t border-slate-800/80 flex justify-between text-xs text-slate-500">
          <span>Created: {formatDateTime(problem.createdAt)}</span>
          <span>Last Updated: {formatDateTime(problem.updatedAt)}</span>
        </div>
      </div>

      {/* Revision History Section */}
      <div className="card">
        <div className="card-header p-5 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-base font-semibold text-white">Spaced Revision History</h2>
            <p className="text-xs text-slate-400">
              Track how often you have revised this problem
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary-sm"
            onClick={() => setScheduleModalOpen(true)}
          >
            <Plus size={14} /> Schedule Another
          </button>
        </div>

        <div className="card-body p-0">
          {revisions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              <CalendarCheck size={28} className="mx-auto text-slate-600 mb-2" />
              <p>No revision sessions logged yet for this problem.</p>
              <button
                type="button"
                className="btn btn-secondary-sm mt-3"
                onClick={() => setScheduleModalOpen(true)}
              >
                Schedule First Revision
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {revisions.map((rev, index) => (
                <div key={rev.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">
                        Session #{revisions.length - index}
                      </span>
                      <span
                        className={`badge ${
                          rev.status === 'COMPLETED' ? 'badge-solved' : 'badge-in-progress'
                        }`}
                      >
                        {rev.status}
                      </span>
                      <span className="text-xs text-slate-300">
                        Scheduled: {formatDate(rev.scheduledDate)}
                      </span>
                    </div>
                    {rev.notes && (
                      <p className="text-xs text-slate-400 mt-1.5 pl-2 border-l-2 border-blue-500">
                        {rev.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {rev.completedAt ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={13} /> Completed {formatDate(rev.completedAt)}
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        {formatRelativeDate(rev.scheduledDate)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Revision Modal */}
      {scheduleModalOpen && (
        <div className="modal-backdrop" onClick={() => setScheduleModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title flex items-center gap-2">
                <CalendarCheck size={18} className="text-blue-400" /> Schedule Problem Revision
              </h3>
            </div>
            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="scheduleDate">
                    Revision Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="scheduleDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="form-input"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="scheduleNotes">
                    Notes / Focus Area (Optional)
                  </label>
                  <textarea
                    id="scheduleNotes"
                    rows={3}
                    placeholder="e.g. Re-verify corner cases, check O(1) space optimization..."
                    className="form-textarea text-xs"
                    value={scheduleNotes}
                    onChange={(e) => setScheduleNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setScheduleModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={scheduling}>
                  {scheduling ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Coding Problem"
        message={`Are you sure you want to delete "${problem.title}"? This cannot be undone.`}
        confirmLabel="Delete Problem"
        isDestructive={true}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};
