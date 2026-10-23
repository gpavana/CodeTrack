import React from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  CalendarCheck,
  TrendingUp,
  Layers,
  ArrowRight,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* Top Header */}
      <header className="landing-header">
        <div className="landing-container flex justify-between items-center py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="brand-logo-badge">
              <Code2 size={24} className="text-blue-400" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Code<span className="text-blue-400">Track</span>
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Open Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero py-16 md:py-24 text-center">
        <div className="landing-container max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
            <Zap size={14} /> Purpose-Built for Interview Prep & Spaced Repetition
          </div>

          <h1 className="hero-heading text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Master Coding Interviews Through <span className="text-blue-400">Targeted Revision</span>
          </h1>

          <p className="hero-subheading text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop solving 500 problems and forgetting them two weeks later. CodeTrack helps you record
            solutions, master core data structure patterns, and scientifically schedule revisions.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Your Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start Practicing Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Existing Member Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800">
        <div className="landing-container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">
              Everything You Need for Coding Prep
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              A structured system built to transition you from random problem-solving to structured,
              reproducible interview performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feature-card">
              <div className="feature-icon-wrapper bg-blue-500/10 text-blue-400">
                <Code2 size={24} />
              </div>
              <h3 className="feature-title">Problem Journal & Approaches</h3>
              <p className="feature-desc">
                Log problems from LeetCode, HackerRank, Codeforces, and GeeksforGeeks. Document time &
                space complexities and algorithmic approaches.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper bg-indigo-500/10 text-indigo-400">
                <Brain size={24} />
              </div>
              <h3 className="feature-title">Spaced Repetition Engine</h3>
              <p className="feature-desc">
                Never lose a solution pattern again. CodeTrack schedules automated revision intervals at
                1, 3, 7, and 21 days after solving.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper bg-emerald-500/10 text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <h3 className="feature-title">Real-Time Preparation Analytics</h3>
              <p className="feature-desc">
                Interactive charts track topic-wise readiness and difficulty distribution across Easy,
                Medium, and Hard challenges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Topics Section */}
      <section className="py-16">
        <div className="landing-container max-w-5xl mx-auto px-4">
          <div className="curriculum-banner">
            <div className="curriculum-content">
              <h3 className="text-2xl font-bold text-white mb-2">
                14+ Interview-Ready DSA Topics
              </h3>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                Structured categories covering Arrays, Sliding Window, Trees, Graphs, Dynamic
                Programming, Two Pointers, and Binary Search.
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Arrays',
                  'Two Pointers',
                  'Sliding Window',
                  'Binary Search',
                  'Linked Lists',
                  'Trees',
                  'Graphs',
                  'Dynamic Programming',
                ].map((topic) => (
                  <span key={topic} className="topic-pill">
                    <CheckCircle2 size={13} className="text-emerald-400" /> {topic}
                  </span>
                ))}
              </div>
            </div>
            <div className="curriculum-action">
              <Link to="/register" className="btn btn-primary whitespace-nowrap">
                Join CodeTrack
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer py-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <div className="landing-container">
          <p>© {new Date().getFullYear()} CodeTrack. Developed with Spring Boot & React.</p>
        </div>
      </footer>
    </div>
  );
};
