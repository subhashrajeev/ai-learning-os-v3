'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    Clock,
    Target,
    Award,
    BookOpen,
    Brain,
    Flame,
    ChevronRight,
    Sparkles,
    Play,
} from 'lucide-react';
import { loadProgress, loadCurriculum, loadStreak, updateStreak } from '@/lib/storage';
import { analyzeAndAdapt } from '@/lib/gemini';

export default function Dashboard({ profile, onStartLesson, onViewChange }) {
    const [progress, setProgress] = useState(null);
    const [curriculum, setCurriculum] = useState(null);
    const [streak, setStreak] = useState(null);
    const [adaptation, setAdaptation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const savedProgress = loadProgress();
        const savedCurriculum = loadCurriculum();
        const savedStreak = updateStreak();

        setProgress(savedProgress);
        setCurriculum(savedCurriculum);
        setStreak(savedStreak);

        // Get AI adaptation suggestions
        if (profile && savedProgress && savedCurriculum) {
            try {
                const adapt = await analyzeAndAdapt(profile, savedProgress, savedCurriculum);
                setAdaptation(adapt);
            } catch (e) {
                console.error('Error getting adaptation:', e);
            }
        }

        setLoading(false);
    };

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

    const nextLesson = getNextLesson();

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
                <h1 style={{ marginBottom: 'var(--space-sm)' }}>
                    Welcome back, {profile?.name?.split(' ')[0] || 'Learner'}! 👋
                </h1>
                <p style={{ color: 'var(--dark-text-secondary)', fontSize: '1.1rem' }}>
                    {adaptation?.motivationMessage || `You're making progress towards ${profile?.goal || 'your goals'}.`}
                </p>
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
                <div className="stat-card" style={{
                    background: 'linear-gradient(135deg, rgba(204, 120, 92, 0.2), rgba(212, 162, 127, 0.1))',
                    borderColor: 'var(--claude-orange)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Flame size={24} style={{ color: 'var(--claude-orange)' }} />
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

                {/* Lessons Completed Card */}
                <div className="stat-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <BookOpen size={24} style={{ color: 'var(--warning)' }} />
                        <span className="stat-card-label">Lessons Completed</span>
                    </div>
                    <div className="stat-card-value">{progress?.lessonsCompleted || 0}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        of {curriculum?.roadmap?.length || 7} total
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
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            style={{ position: 'relative', overflow: 'hidden' }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: 200,
                                height: 200,
                                background: 'radial-gradient(circle, rgba(204, 120, 92, 0.2), transparent 70%)',
                                pointerEvents: 'none',
                            }} />

                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                                <Sparkles size={18} style={{ color: 'var(--claude-orange)' }} />
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
                                Start Today's Lesson
                                <ChevronRight size={20} />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
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
                                whileHover={{ scale: 1.02, borderColor: 'var(--claude-orange)' }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(204, 120, 92, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <Brain size={24} style={{ color: 'var(--claude-orange)' }} />
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
                                whileHover={{ scale: 1.02, borderColor: 'var(--claude-orange)' }}
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
                            <Award size={18} style={{ color: 'var(--claude-orange)' }} />
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

                    {/* Skills You're Gaining */}
                    {curriculum?.skillsYouWillGain && (
                        <motion.div
                            className="glass-card-elevated"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h4 style={{ marginBottom: 'var(--space-md)' }}>Skills You're Gaining</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {curriculum.skillsYouWillGain.slice(0, 5).map((skill, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-sm)',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        <div style={{
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: 'var(--claude-orange)',
                                        }} />
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* AI Recommendations */}
                    {adaptation?.recommendations && adaptation.recommendations.length > 0 && (
                        <motion.div
                            className="glass-card-elevated"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                borderColor: 'var(--info)',
                                background: 'rgba(96, 165, 250, 0.05)',
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
