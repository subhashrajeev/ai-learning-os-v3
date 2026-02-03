'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Play,
    Pause,
    RotateCcw,
    CheckCircle2,
    Clock,
    Target,
    Lightbulb,
    Code,
    HelpCircle,
    ArrowRight,
    Award,
} from 'lucide-react';
import { loadCurriculum, loadProgress, markDayCompleted } from '@/lib/storage';
import { generateLessonContent } from '@/lib/gemini';

export default function DailyLesson({ profile, dayNumber, onComplete }) {
    const [curriculum, setCurriculum] = useState(null);
    const [dayInfo, setDayInfo] = useState(null);
    const [lessonContent, setLessonContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    // Timer state
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);

    // Completion state
    const [isCompleted, setIsCompleted] = useState(false);
    const [showReflection, setShowReflection] = useState(false);
    const [reflectionAnswer, setReflectionAnswer] = useState('');

    useEffect(() => {
        loadData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [dayNumber]);

    const loadData = async () => {
        const saved = loadCurriculum();
        setCurriculum(saved);

        if (saved?.roadmap) {
            const day = saved.roadmap.find(d => d.day === dayNumber) || saved.roadmap[0];
            setDayInfo(day);
        }

        setLoading(false);
    };

    const handleGenerateContent = async () => {
        if (!dayInfo) return;

        setGenerating(true);
        try {
            const content = await generateLessonContent(dayInfo.topic, profile, dayInfo);
            setLessonContent(content);
            startTimer();
        } catch (error) {
            console.error('Failed to generate lesson:', error);
            setLessonContent('# Error\n\nFailed to generate lesson content. Please try again.');
        }
        setGenerating(false);
    };

    const startTimer = () => {
        setIsTimerRunning(true);
        timerRef.current = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
        }, 1000);
    };

    const pauseTimer = () => {
        setIsTimerRunning(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const resetTimer = () => {
        setTimeElapsed(0);
        pauseTimer();
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMarkComplete = () => {
        pauseTimer();
        const timeInMinutes = Math.ceil(timeElapsed / 60);
        markDayCompleted(dayNumber, timeInMinutes);
        setIsCompleted(true);
    };

    const renderContent = (markdown) => {
        // Simple markdown rendering
        const lines = markdown.split('\n');
        const elements = [];
        let inCodeBlock = false;
        let codeContent = '';
        let codeLanguage = '';

        lines.forEach((line, i) => {
            if (line.startsWith('```')) {
                if (inCodeBlock) {
                    elements.push(
                        <pre key={`code-${i}`} style={{ position: 'relative' }}>
                            <code>{codeContent}</code>
                        </pre>
                    );
                    codeContent = '';
                    inCodeBlock = false;
                } else {
                    inCodeBlock = true;
                    codeLanguage = line.slice(3);
                }
                return;
            }

            if (inCodeBlock) {
                codeContent += line + '\n';
                return;
            }

            if (line.startsWith('# ')) {
                elements.push(<h1 key={i}>{line.slice(2)}</h1>);
            } else if (line.startsWith('## ')) {
                elements.push(<h2 key={i}>{line.slice(3)}</h2>);
            } else if (line.startsWith('### ')) {
                elements.push(<h3 key={i}>{line.slice(4)}</h3>);
            } else if (line.startsWith('**') && line.endsWith('**')) {
                elements.push(<h4 key={i}>{line.slice(2, -2)}</h4>);
            } else if (line.startsWith('- ') || line.startsWith('* ')) {
                elements.push(<li key={i}>{line.slice(2)}</li>);
            } else if (line.match(/^\d+\. /)) {
                elements.push(<li key={i}>{line.replace(/^\d+\. /, '')}</li>);
            } else if (line.trim()) {
                // Handle inline formatting
                let formattedLine = line
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/`(.+?)`/g, '<code>$1</code>');
                elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: formattedLine }} />);
            }
        });

        return elements;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!dayInfo) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <h2>Lesson not found</h2>
                <button className="btn btn-primary" onClick={onComplete}>
                    Return to Dashboard
                </button>
            </div>
        );
    }

    // Completion screen
    if (isCompleted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    maxWidth: 600,
                    margin: '0 auto',
                    textAlign: 'center',
                    padding: 'var(--space-2xl)'
                }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{ fontSize: '5rem', marginBottom: 'var(--space-xl)' }}
                >
                    🎉
                </motion.div>

                <h1 style={{ marginBottom: 'var(--space-md)' }}>
                    Day {dayNumber} Complete!
                </h1>

                <p style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-xl)' }}>
                    You spent {formatTime(timeElapsed)} learning about {dayInfo.topic}
                </p>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-lg)',
                    marginBottom: 'var(--space-2xl)'
                }}>
                    <div className="stat-card" style={{ flex: 1, maxWidth: 150 }}>
                        <Clock size={24} style={{ color: 'var(--claude-orange)', marginBottom: 'var(--space-sm)' }} />
                        <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                            {formatTime(timeElapsed)}
                        </div>
                        <div className="stat-card-label">Time Spent</div>
                    </div>

                    <div className="stat-card" style={{ flex: 1, maxWidth: 150 }}>
                        <Award size={24} style={{ color: 'var(--success)', marginBottom: 'var(--space-sm)' }} />
                        <div className="stat-card-value" style={{ fontSize: '1.5rem' }}>
                            +1
                        </div>
                        <div className="stat-card-label">Lesson</div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={onComplete}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Back to Dashboard
                    </motion.button>

                    {dayNumber < (curriculum?.roadmap?.length || 7) && (
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => window.location.reload()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Next Lesson
                            <ArrowRight size={18} />
                        </motion.button>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <div className="lesson-container">
            {/* Main Content */}
            <div className="lesson-main">
                {/* Header */}
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="badge badge-primary" style={{ marginBottom: 'var(--space-sm)' }}>
                        Day {dayNumber}
                    </div>
                    <h1>{dayInfo.topic}</h1>
                    <p style={{ color: 'var(--dark-text-secondary)', marginTop: 'var(--space-sm)' }}>
                        {dayInfo.objective}
                    </p>
                </div>

                {/* Content or Generate Button */}
                {!lessonContent && !generating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            textAlign: 'center',
                            padding: 'var(--space-2xl)',
                            background: 'var(--dark-surface)',
                            borderRadius: 'var(--radius-lg)',
                        }}
                    >
                        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-lg)' }}>📚</div>
                        <h3 style={{ marginBottom: 'var(--space-sm)' }}>Ready to Learn?</h3>
                        <p style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-lg)' }}>
                            Click below to generate your personalized lesson content
                        </p>
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleGenerateContent}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Play size={20} />
                            Generate Lesson
                        </motion.button>
                    </motion.div>
                )}

                {generating && (
                    <div style={{
                        textAlign: 'center',
                        padding: 'var(--space-2xl)',
                    }}>
                        <div className="spinner" style={{ margin: '0 auto var(--space-lg)' }}></div>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            Creating your personalized lesson...
                        </p>
                    </div>
                )}

                {lessonContent && (
                    <motion.div
                        className="lesson-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {renderContent(lessonContent)}
                    </motion.div>
                )}

                {/* Action Bar */}
                {lessonContent && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 'var(--space-2xl)',
                            padding: 'var(--space-lg)',
                            background: 'var(--dark-surface)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div>
                            <h4 style={{ marginBottom: 'var(--space-xs)' }}>Ready to mark complete?</h4>
                            <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                Make sure you've understood the key concepts
                            </p>
                        </div>
                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleMarkComplete}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <CheckCircle2 size={20} />
                            Complete Day {dayNumber}
                        </motion.button>
                    </motion.div>
                )}
            </div>

            {/* Sidebar */}
            <div className="lesson-sidebar">
                {/* Timer */}
                <div className="timer">
                    <div className="timer-label">Learning Time</div>
                    <div className="timer-display">{formatTime(timeElapsed)}</div>
                    <div className="timer-controls">
                        <motion.button
                            className="btn btn-icon btn-secondary"
                            onClick={isTimerRunning ? pauseTimer : startTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!lessonContent}
                        >
                            {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                        </motion.button>
                        <motion.button
                            className="btn btn-icon btn-ghost"
                            onClick={resetTimer}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <RotateCcw size={18} />
                        </motion.button>
                    </div>
                </div>

                {/* Day Info */}
                <div className="glass-card-elevated">
                    <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                        <Target size={18} style={{ color: 'var(--claude-orange)' }} />
                        Today's Goal
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--dark-text-secondary)' }}>
                        {dayInfo.action}
                    </p>
                </div>

                {/* Key Takeaways */}
                {dayInfo.keyTakeaways && (
                    <div className="glass-card-elevated">
                        <h4 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <Lightbulb size={18} style={{ color: 'var(--warning)' }} />
                            Key Takeaways
                        </h4>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--space-sm)'
                        }}>
                            {dayInfo.keyTakeaways.map((item, i) => (
                                <li key={i} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 'var(--space-sm)',
                                    fontSize: '0.85rem',
                                    color: 'var(--dark-text-secondary)',
                                }}>
                                    <div style={{
                                        minWidth: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: 'var(--claude-orange)',
                                        marginTop: 6,
                                    }} />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Difficulty */}
                <div className="glass-card-elevated">
                    <h4 style={{ marginBottom: 'var(--space-md)' }}>Lesson Info</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--dark-text-secondary)' }}>Estimated Time</span>
                            <span>~{dayInfo.estimatedMinutes || 30} min</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                            <span style={{ color: 'var(--dark-text-secondary)' }}>Difficulty</span>
                            <span>{dayInfo.difficulty || 2}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
