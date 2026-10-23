import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  RotateCcw,
  Code2,
} from 'lucide-react';
import { problemApi } from '../api/problemApi';
import { StatusBadge } from '../components/StatusBadge';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { Pagination } from '../components/Pagination';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmModal } from '../components/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { TOPICS, DIFFICULTIES, PLATFORMS, PROBLEM_STATUSES } from '../utils/constants';
import { formatDate } from '../utils/formatters';

export const ProblemListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  // URL / state filters
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [topicFilter, setTopicFilter] = useState(searchParams.get('topic') || '');
  const [difficultyFilter, setDifficultyFilter] = useState(searchParams.get('difficulty') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [platformFilter, setPlatformFilter] = useState(searchParams.get('platform') || '');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0', 10));
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'updatedAt');
  const [sortDir, setSortDir] = useState(searchParams.get('direction') || 'desc');

  const [pagedData, setPagedData] = useState({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = {
      page: currentPage,
      size: 10,
      sortBy,
      direction: sortDir,
    };

    if (searchTerm.trim()) params.search = searchTerm.trim();
    if (topicFilter) params.topic = topicFilter;
    if (difficultyFilter) params.difficulty = difficultyFilter;
    if (statusFilter) params.status = statusFilter;
    if (platformFilter) params.platform = platformFilter;

    try {
      const res = await problemApi.getProblems(params);
      if (res.data) {
        setPagedData(res.data);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError('Failed to load coding problems. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, topicFilter, difficultyFilter, statusFilter, platformFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchProblems();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setTopicFilter('');
    setDifficultyFilter('');
    setStatusFilter('');
    setPlatformFilter('');
    setCurrentPage(0);
    setSortBy('updatedAt');
    setSortDir('desc');
  };

  const handleDeleteClick = (problem) => {
    setProblemToDelete(problem);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!problemToDelete) return;
    setDeleting(true);
    try {
      await problemApi.deleteProblem(problemToDelete.id);
      showToast(`Problem "${problemToDelete.title}" deleted successfully`, 'success');
      setDeleteModalOpen(false);
      setProblemToDelete(null);
      fetchProblems();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete problem', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="problems-page">
      {/* Page Header */}
      <div className="page-header flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="page-title text-2xl font-bold text-white tracking-tight">
            Coding Problems
          </h1>
          <p className="page-subtitle text-slate-400 text-sm mt-0.5">
            Manage your problem repository, complexities, and solution notes
          </p>
        </div>
        <Link to="/problems/new" className="btn btn-primary">
          <PlusCircle size={16} /> Add Problem
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar card p-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
          {/* Search Input (2 cols) */}
          <div className="sm:col-span-2 relative">
            <Search size={16} className="input-icon" />
            <input
              type="text"
              placeholder="Search by title..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Topic Filter */}
          <div>
            <select
              className="form-select"
              value={topicFilter}
              onChange={(e) => {
                setTopicFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Topics</option>
              {TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <select
              className="form-select"
              value={difficultyFilter}
              onChange={(e) => {
                setDifficultyFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Difficulties</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Statuses</option>
              {PROBLEM_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Platform Filter */}
          <div>
            <select
              className="form-select"
              value={platformFilter}
              onChange={(e) => {
                setPlatformFilter(e.target.value);
                setCurrentPage(0);
              }}
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </form>

        <div className="flex flex-wrap justify-between items-center gap-2 mt-3 pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              className="form-select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updatedAt">Last Updated</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="difficulty">Difficulty</option>
            </select>
            <select
              className="form-select-sm"
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          {(searchTerm || topicFilter || difficultyFilter || statusFilter || platformFilter) && (
            <button
              type="button"
              className="btn btn-ghost-sm text-slate-400 hover:text-white flex items-center gap-1"
              onClick={handleResetFilters}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Problems Table / Content */}
      <div className="card">
        {loading ? (
          <div className="p-12">
            <LoadingSpinner message="Loading problems..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-rose-400 mb-4">{error}</p>
            <button type="button" onClick={fetchProblems} className="btn btn-secondary">
              Try Again
            </button>
          </div>
        ) : pagedData.content.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Code2}
              title="No Problems Found"
              description={
                searchTerm || topicFilter || difficultyFilter || statusFilter || platformFilter
                  ? 'No problems match your current filters. Try resetting your search query.'
                  : 'You have not added any coding problems yet. Add your first problem to start tracking!'
              }
              actionLabel="Add New Problem"
              actionLink="/problems/new"
            />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title & Platform</th>
                    <th>Topic</th>
                    <th>Difficulty</th>
                    <th>Status</th>
                    <th>Complexities</th>
                    <th>Revisions</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedData.content.map((prob) => (
                    <tr key={prob.id} className="table-row-hover">
                      {/* Title & Platform */}
                      <td>
                        <div className="font-medium text-slate-100 hover:text-blue-400 transition-colors">
                          <Link to={`/problems/${prob.id}`}>{prob.title}</Link>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{prob.platform}</span>
                          {prob.problemUrl && (
                            <a
                              href={prob.problemUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-blue-400 inline-flex items-center"
                              title="Open original problem"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Topic */}
                      <td>
                        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {prob.topic}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td>
                        <DifficultyBadge difficulty={prob.difficulty} />
                      </td>

                      {/* Status */}
                      <td>
                        <StatusBadge status={prob.status} />
                      </td>

                      {/* Complexities */}
                      <td>
                        <div className="text-xs text-slate-300 font-mono">
                          {prob.timeComplexity && <div>T: {prob.timeComplexity}</div>}
                          {prob.spaceComplexity && <div>S: {prob.spaceComplexity}</div>}
                          {!prob.timeComplexity && !prob.spaceComplexity && (
                            <span className="text-slate-500">—</span>
                          )}
                        </div>
                      </td>

                      {/* Revisions completed */}
                      <td>
                        <span className="badge badge-slate text-xs">
                          {prob.revisionCount} completed
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex justify-end items-center gap-1">
                          <Link
                            to={`/problems/${prob.id}`}
                            className="action-icon-btn"
                            title="View details"
                            aria-label="View problem details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/problems/${prob.id}/edit`}
                            className="action-icon-btn"
                            title="Edit problem"
                            aria-label="Edit problem"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            type="button"
                            className="action-icon-btn action-icon-btn-danger"
                            title="Delete problem"
                            aria-label="Delete problem"
                            onClick={() => handleDeleteClick(prob)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={pagedData.page}
              totalPages={pagedData.totalPages}
              totalElements={pagedData.totalElements}
              pageSize={pagedData.size}
              onPageChange={(newPage) => setCurrentPage(newPage)}
            />
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Coding Problem"
        message={`Are you sure you want to delete "${problemToDelete?.title}"? All associated revision history will be permanently removed.`}
        confirmLabel="Delete Problem"
        isDestructive={true}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProblemToDelete(null);
        }}
      />
    </div>
  );
};
