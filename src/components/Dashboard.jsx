'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Clock,
    Target,
    Award,
    Brain,
    Flame,
    ChevronRight,
    Sparkles,
    Play,
    ShieldCheck,
    Layers,
} from 'lucide-react';
import {
    loadProgress,
    loadCurriculum,
    updateStreak,
    getDueReviewItems,
    loadReviews,
} from '@/lib/storage';
import { analyzeAndAdapt, generateProactiveSuggestions } from '@/lib/geminiClient';
import { queryMemoryEntries } from '@/lib/memory';
import { getNextReviewDate } from '@/lib/spacedRepetition';

export default function Dashboard({ profile, onStartLesson, onViewChange }) {
    const [progress, setProgress] = useState(null);
    const [curriculum, setCurriculum] = useState(null);
    const [streak, setStreak] = useState(null);
    const [adaptation, setAdaptation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewQueue, setReviewQueue] = useState([]);
    const [memoryHighlights, setMemoryHighlights] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Phase 1: Load local data instantly (no spinner wait)
    useEffect(() => {
        const savedProgress = loadProgress();
        const savedCurriculum = loadCurriculum();
        const savedStreak = updateStreak();
        const dueReviews = getDueReviewItems();

        setProgress(savedProgress);
        setCurriculum(savedCurriculum);
        setStreak(savedStreak);
        setReviewQueue(dueReviews);
        setLoading(false); // Show dashboard immediately

        // Phase 2: Load AI features in parallel (background)
        if (profile) {
            const promises = [];

            // Adaptation analysis
            if (savedProgress && savedCurriculum) {
                promises.push(
                    analyzeAndAdapt(profile, savedProgress, savedCurriculum)
                        .then(adapt => setAdaptation(adapt))
                        .catch(e => console.error('Adaptation error:', e))
                );
            }

            // Memory highlights
            promises.push(
                queryMemoryEntries(profile.goal || 'AI learning', 3)
                    .then(memory => setMemoryHighlights(memory))
                    .catch(e => console.error('Memory error:', e))
            );

            // Proactive suggestions
            promises.push(
                generateProactiveSuggestions(profile, savedProgress, {
                    dueReviews: dueReviews.length,
                    memoryHighlights: 0,
                })
                    .then(proactive => setSuggestions(proactive?.suggestions || []))
                    .catch(e => console.error('Suggestions error:', e))
            );

            Promise.allSettled(promises);
        }
    }, []);

    const getNextLesson = () => {
        if (!curriculum?.roadmap) return null;
        const currentDay = progress?.currentDay || 1;
        return curriculum.roadmap.find(item => item.day === currentDay);
    };

    const getCompletionPercentage = () => {
        if (!progress || !curriculum?.roadmap) return 0;
        return Math.round((progress.completedDays.length / curriculum.roadmap.length) * 100);
    };

    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Soon';
        return new Date(dateString).toLocaleDateString();
    };

    const nextLesson = getNextLesson();
    const nextReviewDate = getNextReviewDate(loadReviews());

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--space-2xl)' }}
            >
                <div className="hero-glow">
                    <h1 style={{ marginBottom: 'var(--space-sm)' }}>
                        Welcome back, {profile?.name?.split(' ')[0] || 'Learner'}!
                    </h1>
                    <p style={{ color: 'var(--dark-text-secondary)', fontSize: '1.1rem' }}>
                        {adaptation?.motivationMessage || `You're making progress towards ${profile?.goal || 'your goals'}.`}
                    </p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="card-grid"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ marginBottom: 'var(--space-2xl)' }}
            >
                {/* Streak Card */}
                <div className="stat-card glow-border" style={{
                    background: 'linear-gradient(135deg, rgba(204, 120, 92, 0.2), rgba(212, 162, 127, 0.1))',
                    borderColor: 'var(--accent)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Flame size={24} style={{ color: 'var(--accent)' }} />
                        <span className="stat-card-label">Current Streak</span>
                    </div>
                    <div className="stat-card-value">{streak?.currentStreak || 0} days</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        Longest: {streak?.longestStreak || 0} days
                    </div>
                </div>

                {/* Progress Card */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Target size={24} style={{ color: 'var(--success)' }} />
                        <span className="stat-card-label">Progress</span>
                    </div>
                    <div className="stat-card-value">{getCompletionPercentage()}%</div>
                    <div className="progress-bar" style={{ marginTop: 'var(--space-sm)' }}>
                        <motion.div
                            className="progress-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${getCompletionPercentage()}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Time Spent Card */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Clock size={24} style={{ color: 'var(--info)' }} />
                        <span className="stat-card-label">Time Invested</span>
                    </div>
                    <div className="stat-card-value">{formatTime(progress?.totalTimeSpent || 0)}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        Learning time logged
                    </div>
                </div>

                {/* Reviews Card */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <ShieldCheck size={24} style={{ color: 'var(--warning)' }} />
                        <span className="stat-card-label">Reviews Due</span>
                    </div>
                    <div className="stat-card-value">{reviewQueue.length}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        Next review: {nextReviewDate ? formatDate(nextReviewDate) : 'Set soon'}
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Continue Learning Card */}
                    {nextLesson && (
                        <motion.div
                            className="glass-card shimmer-panel"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 220,
                                height: 220,
                                background: 'radial-gradient(circle, rgba(91, 234, 255, 0.18), transparent 70%)',
                                pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                                <span className="badge badge-primary">CONTINUE LEARNING</span>
                            </div>

                            <h2 style={{ marginBottom: 'var(--space-xs)' }}>
                                Day {nextLesson.day}: {nextLesson.topic}
                            </h2>
                            <p style={{ marginBottom: 'var(--space-lg)' }}>
                                {nextLesson.objective}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <Clock size={16} style={{ color: 'var(--dark-text-secondary)' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--dark-text-secondary)' }}>
                                        ~{nextLesson.estimatedMinutes || 30} minutes
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                    <Target size={16} style={{ color: 'var(--dark-text-secondary)' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--dark-text-secondary)' }}>
                                        Difficulty: {nextLesson.difficulty || 2}/5
                                    </span>
                                </div>
                            </div>

                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={() => onStartLesson(nextLesson.day)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Play size={20} />
                                Start Today{`'`}s Lesson
                                <ChevronRight size={20} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Proactive Suggestions */}
                    <motion.div
                        className="glass-card-elevated"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Sparkles size={20} style={{ color: 'var(--accent)' }} />
                            Proactive Suggestions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {suggestions.length === 0 ? (
                                <p style={{ color: 'var(--dark-text-secondary)' }}>Generating your next moves...</p>
                            ) : (
                                suggestions.slice(0, 3).map((item, index) => (
                                    <motion.div
                                        key={`${item.title}-${index}`}
                                        className="suggestion-card"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        <div className="suggestion-header">
                                            <span className="badge badge-primary">{item.tag || 'Focus'}</span>
                                            <h4>{item.title}</h4>
                                        </div>
                                        <p>{item.action}</p>
                                        <span className="suggestion-why">{item.why}</span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h3 style={{ marginBottom: 'var(--space-md)' }}>Quick Actions</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)' }}>
                            <motion.button
                                className="glass-card-elevated"
                                onClick={() => onViewChange && onViewChange('practice')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    border: '1px solid var(--dark-border)',
                                }}
                                whileHover={{ scale: 1.02, borderColor: 'var(--accent)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(91, 234, 255, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Brain size={24} style={{ color: 'var(--accent)' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>Practice Mode</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                        Test your knowledge
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                className="glass-card-elevated"
                                onClick={() => onViewChange && onViewChange('path')}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-md)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    border: '1px solid var(--dark-border)',
                                }}
                                whileHover={{ scale: 1.02, borderColor: 'var(--accent-2)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(74, 222, 128, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <TrendingUp size={24} style={{ color: 'var(--success)' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600 }}>View Full Path</div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                        See your roadmap
                                    </div>
                                </div>
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
                    {/* Your Goals */}
                    <motion.div
                        className="glass-card-elevated"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Award size={18} style={{ color: 'var(--accent)' }} />
                            Your Goal
                        </h4>
                        <p style={{ fontSize: '1.1rem', fontWeight: 500, marginBottom: 'var(--space-sm)' }}>
                            {profile?.goal || 'Learn AI'}
                        </p>
                        {profile?.interests && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                {profile.interests.split(',').map((interest, i) => (
                                    <span key={i} className="badge badge-primary">
                                        {interest.trim()}
                                    </span>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* Review Queue */}
                    <motion.div
                        className="glass-card-elevated"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <ShieldCheck size={18} style={{ color: 'var(--warning)' }} />
                            Review Queue
                        </h4>
                        {reviewQueue.length === 0 ? (
                            <p style={{ color: 'var(--dark-text-secondary)' }}>No reviews due. Great job staying fresh.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {reviewQueue.slice(0, 4).map((review) => (
                                    <div key={review.id} className="review-item">
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{review.front}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--dark-text-secondary)' }}>
                                                Due {formatDate(review.dueDate)}
                                            </div>
                                        </div>
                                        <span className="badge badge-warning">Review</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <motion.button
                            className="btn btn-secondary"
                            onClick={() => onViewChange && onViewChange('practice')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ marginTop: 'var(--space-md)' }}
                        >
                            Start Reviews
                        </motion.button>
                    </motion.div>

                    {/* Memory Highlights */}
                    <motion.div
                        className="glass-card-elevated"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Layers size={18} style={{ color: 'var(--info)' }} />
                            Memory Highlights
                        </h4>
                        {memoryHighlights.length === 0 ? (
                            <p style={{ color: 'var(--dark-text-secondary)' }}>As you learn, we{`'`}ll keep key insights here.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {memoryHighlights.map((item, i) => (
                                    <div key={`${item.metadata?.topic || 'memory'}-${i}`} className="memory-chip">
                                        <span>{item.metadata?.topic || 'Insight'}</span>
                                        <p>{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {/* AI Recommendations */}
                    {adaptation?.recommendations && adaptation.recommendations.length > 0 && (
                        <motion.div
                            className="glass-card-elevated"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            style={{
                                borderColor: 'var(--info)',
                                background: 'rgba(96, 165, 250, 0.08)',
                            }}
                        >
                            <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                <Sparkles size={18} style={{ color: 'var(--info)' }} />
                                AI Recommendations
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {adaptation.recommendations.slice(0, 3).map((rec, i) => (
                                    <p key={i} style={{ fontSize: '0.9rem', color: 'var(--dark-text-secondary)' }}>
                                        • {rec}
                                    </p>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
