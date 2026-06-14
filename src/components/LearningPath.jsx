'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Circle,
    Play,
    Lock,
    Clock,
    Target,
    Award,
    RefreshCw,
    ShieldCheck,
} from 'lucide-react';
import { loadProgress, loadCurriculum, saveCurriculum, getDueReviewItems } from '@/lib/storage';
import { generateCurriculum } from '@/lib/geminiClient';

export default function LearningPath({ profile, onStartLesson }) {
    const [progress, setProgress] = useState(null);
    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [regenerating, setRegenerating] = useState(false);
    const [reviewQueue, setReviewQueue] = useState([]);

    useEffect(() => {
        const saved = loadCurriculum();
        const savedProgress = loadProgress();
        setCurriculum(saved);
        setProgress(savedProgress);
        setReviewQueue(getDueReviewItems());
        setLoading(false);
    }, []);

    const handleRegenerate = async () => {
        setRegenerating(true);
        try {
            const newCurriculum = await generateCurriculum(profile);
            saveCurriculum(newCurriculum);
            setCurriculum(newCurriculum);
        } catch (error) {
            console.error('Failed to regenerate:', error);
        }
        setRegenerating(false);
    };

    const getDayStatus = (day) => {
        if (!progress) return 'locked';
        if (progress.completedDays.includes(day)) return 'completed';
        if (day === progress.currentDay) return 'active';
        if (day < progress.currentDay) return 'skipped';
        return 'upcoming';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />;
            case 'active':
                return <Play size={18} style={{ color: 'var(--accent)' }} />;
            case 'skipped':
                return <Circle size={18} style={{ color: 'var(--warning)' }} />;
            case 'upcoming':
                return <Circle size={18} style={{ color: 'var(--dark-text-secondary)' }} />;
            default:
                return <Lock size={18} style={{ color: 'var(--dark-text-secondary)' }} />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!curriculum?.roadmap) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <h2>No curriculum found</h2>
                <p style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                    Generate your personalized learning path to get started.
                </p>
                <motion.button
                    className="btn btn-primary btn-lg"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {regenerating ? (
                        <>
                            <RefreshCw size={18} className="spin" />
                            Generating...
                        </>
                    ) : (
                        'Generate Learning Path'
                    )}
                </motion.button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--space-2xl)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--space-sm)' }}>Your 7-Day Learning Path</h1>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            A personalized curriculum designed for {profile?.goal || 'your goals'}
                        </p>
                    </div>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {regenerating ? (
                            <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                        Regenerate
                    </motion.button>
                </div>

                {/* Summary Stats */}
                <div style={{
                    display: 'flex',
                    gap: 'var(--space-xl)',
                    marginTop: 'var(--space-lg)',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Clock size={18} style={{ color: 'var(--accent)' }} />
                        <span style={{ color: 'var(--dark-text-secondary)' }}>
                            ~{curriculum.totalEstimatedHours || 5} hours total
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Target size={18} style={{ color: 'var(--success)' }} />
                        <span style={{ color: 'var(--dark-text-secondary)' }}>
                            {progress?.completedDays?.length || 0} of {curriculum.roadmap.length} completed
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <ShieldCheck size={18} style={{ color: 'var(--warning)' }} />
                        <span style={{ color: 'var(--dark-text-secondary)' }}>
                            {reviewQueue.length} reviews due
                        </span>
                    </div>
                    {curriculum.skillsYouWillGain && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Award size={18} style={{ color: 'var(--info)' }} />
                            <span style={{ color: 'var(--dark-text-secondary)' }}>
                                {curriculum.skillsYouWillGain.length} skills
                            </span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Timeline */}
            <div className="timeline">
                {curriculum.roadmap.map((item, index) => {
                    const status = getDayStatus(item.day);
                    const isDue = reviewQueue.some((review) => review.front === item.topic);

                    return (
                        <motion.div
                            key={item.day}
                            className={`timeline-item ${status}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="timeline-marker" />

                            <motion.div
                                className="timeline-content"
                                whileHover={status !== 'locked' ? { scale: 1.01 } : {}}
                                style={{
                                    cursor: status === 'active' || status === 'completed' ? 'pointer' : 'default',
                                    opacity: status === 'locked' ? 0.5 : 1,
                                }}
                                onClick={() => {
                                    if (status === 'active' || status === 'completed' || status === 'skipped') {
                                        onStartLesson(item.day);
                                    }
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div className="timeline-day">Day {item.day}</div>
                                        <h3 className="timeline-title">{item.topic}</h3>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        {getStatusIcon(status)}
                                        {isDue && <span className="badge badge-warning">Review Due</span>}
                                        {status === 'completed' && (
                                            <span className="badge badge-success">Completed</span>
                                        )}
                                        {status === 'active' && (
                                            <span className="badge badge-primary">Current</span>
                                        )}
                                    </div>
                                </div>

                                <p className="timeline-description">{item.objective}</p>

                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 'var(--space-sm)'
                                }}>
                                    <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-xs)',
                                            fontSize: '0.85rem',
                                            color: 'var(--dark-text-secondary)'
                                        }}>
                                            <Clock size={14} />
                                            ~{item.estimatedMinutes || 30} min
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-xs)',
                                            fontSize: '0.85rem',
                                            color: 'var(--dark-text-secondary)'
                                        }}>
                                            <Target size={14} />
                                            Level {item.difficulty || 2}/5
                                        </div>
                                    </div>

                                    {(status === 'active' || status === 'skipped') && (
                                        <motion.button
                                            className="btn btn-primary"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStartLesson(item.day);
                                            }}
                                        >
                                            <Play size={16} />
                                            {status === 'skipped' ? 'Resume' : 'Start'}
                                        </motion.button>
                                    )}
                                </div>

                                {/* Key Takeaways Preview */}
                                {item.keyTakeaways && item.keyTakeaways.length > 0 && (
                                    <div style={{
                                        marginTop: 'var(--space-md)',
                                        paddingTop: 'var(--space-md)',
                                        borderTop: '1px solid var(--dark-border)'
                                    }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 'var(--space-sm)', color: 'var(--dark-text-secondary)' }}>
                                            You{`'`}ll Learn:
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
                                            {item.keyTakeaways.slice(0, 3).map((takeaway, i) => (
                                                <span
                                                    key={i}
                                                    style={{
                                                        fontSize: '0.75rem',
                                                        padding: '2px 8px',
                                                        background: 'var(--dark-surface)',
                                                        borderRadius: 'var(--radius-full)',
                                                        color: 'var(--dark-text-secondary)',
                                                    }}
                                                >
                                                    {takeaway}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Next Steps */}
            {curriculum.recommendedNextSteps && (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{ marginTop: 'var(--space-2xl)' }}
                >
                    <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Award size={20} style={{ color: 'var(--accent)' }} />
                        After This Sprint
                    </h3>
                    <p style={{ color: 'var(--dark-text-secondary)' }}>
                        {curriculum.recommendedNextSteps}
                    </p>
                </motion.div>
            )}
        </div>
    );
}
