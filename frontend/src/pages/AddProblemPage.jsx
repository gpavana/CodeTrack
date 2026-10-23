import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Code2, AlertCircle } from 'lucide-react';
import { problemApi } from '../api/problemApi';
import { useToast } from '../context/ToastContext';
import { TOPICS, DIFFICULTIES, PLATFORMS, PROBLEM_STATUSES } from '../utils/constants';

export const AddProblemPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    problemUrl: '',
    platform: 'LeetCode',
    topic: 'Arrays',
    difficulty: 'MEDIUM',
    status: 'TODO',
    approachNotes: '',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    dateSolved: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // If status is changed to SOLVED and dateSolved is empty, set today
      if (name === 'status' && value === 'SOLVED' && !updated.dateSolved) {
        updated.dateSolved = new Date().toISOString().split('T')[0];
      }
      return updated;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Problem title is required';
    }

    if (!formData.platform.trim()) {
      newErrors.platform = 'Platform is required';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    if (!formData.status) {
      newErrors.status = 'Status is required';
    }

    if (formData.problemUrl && !/^https?:\/\//i.test(formData.problemUrl.trim())) {
      newErrors.problemUrl = 'URL must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        ...formData,
        dateSolved: formData.dateSolved ? formData.dateSolved : null,
      };

      const res = await problemApi.createProblem(payload);
      showToast('Problem added successfully!', 'success');
      if (res.data?.id) {
        navigate(`/problems/${res.data.id}`);
      } else {
        navigate('/problems');
      }
    } catch (err) {
      console.error('Failed to create problem:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to save coding problem. Please verify your inputs.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-problem-page max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/problems" className="btn btn-ghost-sm text-slate-400 hover:text-white">
          <ArrowLeft size={16} /> Back to Problems
        </Link>
      </div>

      <div className="card">
        <div className="card-header pb-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 size={22} className="text-blue-400" /> Log New Coding Problem
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record the algorithm details, solution approach, and complexities for spaced revision
          </p>
        </div>

        {serverError && (
          <div className="m-6 mb-0 alert alert-error">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-body p-6 space-y-6">
          {/* Row 1: Title & Platform */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 form-group">
              <label className="form-label" htmlFor="title">
                Problem Title <span className="text-rose-400">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. 3Sum, Longest Substring Without Repeating Characters"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                value={formData.title}
                onChange={handleChange}
                disabled={submitting}
              />
              {errors.title && <p className="form-error-msg">{errors.title}</p>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="platform">
                Platform <span className="text-rose-400">*</span>
              </label>
              <select
                id="platform"
                name="platform"
                className="form-select"
                value={formData.platform}
                onChange={handleChange}
                disabled={submitting}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Problem URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="problemUrl">
              Problem URL
            </label>
            <input
              id="problemUrl"
              name="problemUrl"
              type="url"
              placeholder="https://leetcode.com/problems/..."
              className={`form-input ${errors.problemUrl ? 'input-error' : ''}`}
              value={formData.problemUrl}
              onChange={handleChange}
              disabled={submitting}
            />
            {errors.problemUrl && <p className="form-error-msg">{errors.problemUrl}</p>}
          </div>

          {/* Row 3: Topic, Difficulty, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="topic">
                Data Structure / Topic <span className="text-rose-400">*</span>
              </label>
              <select
                id="topic"
                name="topic"
                className="form-select"
                value={formData.topic}
                onChange={handleChange}
                disabled={submitting}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="difficulty">
                Difficulty <span className="text-rose-400">*</span>
              </label>
              <select
                id="difficulty"
                name="difficulty"
                className="form-select"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={submitting}
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="status">
                Status <span className="text-rose-400">*</span>
              </label>
              <select
                id="status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
                disabled={submitting}
              >
                {PROBLEM_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Complexities & Date Solved */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="timeComplexity">
                Time Complexity
              </label>
              <input
                id="timeComplexity"
                name="timeComplexity"
                type="text"
                placeholder="e.g. O(n log n), O(n)"
                className="form-input font-mono text-sm"
                value={formData.timeComplexity}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="spaceComplexity">
                Space Complexity
              </label>
              <input
                id="spaceComplexity"
                name="spaceComplexity"
                type="text"
                placeholder="e.g. O(1), O(n)"
                className="form-input font-mono text-sm"
                value={formData.spaceComplexity}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateSolved">
                Date Solved
              </label>
              <input
                id="dateSolved"
                name="dateSolved"
                type="date"
                className="form-input"
                value={formData.dateSolved}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>
          </div>

          {/* Row 5: Solution Approach & Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="approachNotes">
              Solution Approach, Key Insights & Edge Cases
            </label>
            <textarea
              id="approachNotes"
              name="approachNotes"
              rows={6}
              placeholder="Document the intuition, key patterns used (e.g. two pointers, hash map, monotonic stack), base cases, and common traps..."
              className="form-textarea font-sans text-sm leading-relaxed"
              value={formData.approachNotes}
              onChange={handleChange}
              disabled={submitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Link to="/problems" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Save size={16} />
              {submitting ? 'Saving Problem...' : 'Save Problem'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
