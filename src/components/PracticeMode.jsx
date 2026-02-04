'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain,
    CheckCircle2,
    XCircle,
    ArrowRight,
    RotateCcw,
    Target,
    Lightbulb,
    HelpCircle,
    ShieldCheck,
} from 'lucide-react';
import {
    loadCurriculum,
    loadProgress,
    updateQuizScore,
    getDueReviewItems,
    updateReviewFromScore,
} from '@/lib/storage';
import { generateQuizQuestions } from '@/lib/gemini';

export default function PracticeMode({ profile }) {
    const [curriculum, setCurriculum] = useState(null);
    const [progress, setProgress] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [quizComplete, setQuizComplete] = useState(false);
    const [dueReviews, setDueReviews] = useState([]);
    const [reviewUpdate, setReviewUpdate] = useState(null);

    useEffect(() => {
        const saved = loadCurriculum();
        const savedProgress = loadProgress();
        setCurriculum(saved);
        setProgress(savedProgress);
        setDueReviews(getDueReviewItems());
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!quizComplete || !selectedTopic || reviewUpdate) return;
        const percentage = score.total ? Math.round((score.correct / score.total) * 100) : 0;
        const update = updateReviewFromScore(selectedTopic, percentage, {
            topic: selectedTopic,
            lastScore: percentage,
        });
        setReviewUpdate(update);
    }, [quizComplete, selectedTopic, reviewUpdate, score.correct, score.total]);

    const handleSelectTopic = async (topic) => {
        setSelectedTopic(topic);
        setGenerating(true);

        try {
            const result = await generateQuizQuestions(topic, profile, 5);
            setQuestions(result.questions || []);
        } catch (error) {
            console.error('Failed to generate quiz:', error);
            setQuestions([]);
        }

        setGenerating(false);
    };

    const handleSelectAnswer = (answer) => {
        if (showResult) return;
        setSelectedAnswer(answer);
    };

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null) return;

        const currentQuestion = questions[currentIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer ||
            (currentQuestion.type === 'true_false' && selectedAnswer === currentQuestion.correctAnswer);

        if (isCorrect) {
            setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
        }
        setScore(prev => ({ ...prev, total: prev.total + 1 }));
        setShowResult(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        } else {
            // Quiz complete
            updateQuizScore(score.correct, score.total);
            setQuizComplete(true);
        }
    };

    const handleRestart = () => {
        setSelectedTopic(null);
        setQuestions([]);
        setCurrentIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
        setQuizComplete(false);
        setReviewUpdate(null);
        setDueReviews(getDueReviewItems());
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-2xl)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // Topic selection
    if (!selectedTopic) {
        const topics = curriculum?.roadmap
            ?.filter(item => progress?.completedDays?.includes(item.day) || item.day <= (progress?.currentDay || 1))
            ?.map(item => item.topic) || [];

        return (
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>🧠</div>
                    <h1>Practice Mode</h1>
                    <p style={{ color: 'var(--dark-text-secondary)' }}>
                        Test your knowledge with AI-generated quizzes
                    </p>
                </motion.div>

                {dueReviews.length > 0 && (
                    <motion.div
                        className="glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        style={{ marginBottom: 'var(--space-xl)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                            <ShieldCheck size={18} style={{ color: 'var(--warning)' }} />
                            <strong>Reviews Due Today</strong>
                        </div>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            {dueReviews.length} topic(s) ready for spaced repetition.
                        </p>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Choose a topic to practice:</h3>

                    {topics.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <HelpCircle size={48} style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-md)' }} />
                            <h4>No topics available yet</h4>
                            <p style={{ color: 'var(--dark-text-secondary)' }}>
                                Complete some lessons first to unlock practice quizzes!
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
                            {topics.map((topic, index) => {
                                const isDue = dueReviews.some((review) => review.front === topic);
                                return (
                                    <motion.button
                                        key={topic}
                                        className="glass-card-elevated"
                                        style={{
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                        whileHover={{ scale: 1.01, borderColor: 'var(--accent)' }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => handleSelectTopic(topic)}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
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
                                                <div style={{ fontWeight: 600 }}>{topic}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                                    5 questions
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                            {isDue && <span className="badge badge-warning">Review</span>}
                                            <ArrowRight size={20} style={{ color: 'var(--dark-text-secondary)' }} />
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    // Generating quiz
    if (generating) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2xl)',
                minHeight: 400,
            }}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ marginBottom: 'var(--space-lg)' }}
                >
                    <Brain size={48} style={{ color: 'var(--accent)' }} />
                </motion.div>
                <h3>Generating Quiz...</h3>
                <p style={{ color: 'var(--dark-text-secondary)' }}>
                    Creating personalized questions for {selectedTopic}
                </p>
            </div>
        );
    }

    // Quiz complete
    if (quizComplete) {
        const percentage = Math.round((score.correct / score.total) * 100);
        const isPassing = percentage >= 60;

        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: 'var(--space-2xl)' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    style={{ fontSize: '5rem', marginBottom: 'var(--space-xl)' }}
                >
                    {isPassing ? '🎉' : '💪'}
                </motion.div>

                <h1 style={{ marginBottom: 'var(--space-md)' }}>
                    {isPassing ? 'Great Job!' : 'Keep Practicing!'}
                </h1>

                <p style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-xl)' }}>
                    You scored {score.correct} out of {score.total} on {selectedTopic}
                </p>

                <div style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `conic-gradient(${isPassing ? 'var(--success)' : 'var(--warning)'} ${percentage}%, var(--dark-surface) 0)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto var(--space-xl)',
                }}>
                    <div style={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'var(--dark-bg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: isPassing ? 'var(--success)' : 'var(--warning)' }}>
                            {percentage}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>
                            Score
                        </div>
                    </div>
                </div>

                {reviewUpdate?.dueDate && (
                    <div className="glass-card" style={{ marginBottom: 'var(--space-lg)' }}>
                        Next review scheduled for {new Date(reviewUpdate.dueDate).toLocaleDateString()}
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)' }}>
                    <motion.button
                        className="btn btn-secondary"
                        onClick={() => handleSelectTopic(selectedTopic)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RotateCcw size={18} />
                        Try Again
                    </motion.button>
                    <motion.button
                        className="btn btn-primary"
                        onClick={handleRestart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        New Topic
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    // Quiz in progress
    const currentQuestion = questions[currentIndex];

    if (!currentQuestion) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
                <h2>No questions available</h2>
                <button className="btn btn-primary" onClick={handleRestart}>
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
            {/* Progress Bar */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--space-xl)' }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--space-sm)'
                }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        Question {currentIndex + 1} of {questions.length}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                        {selectedTopic}
                    </span>
                </div>
                <div className="progress-bar">
                    <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    />
                </div>
            </motion.div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="quiz-card"
                >
                    <div className="quiz-question">{currentQuestion.question}</div>

                    <div className="quiz-options">
                        {currentQuestion.type === 'true_false' ? (
                            <>
                                {[true, false].map((option) => {
                                    const isSelected = selectedAnswer === option;
                                    const isCorrect = showResult && option === currentQuestion.correctAnswer;
                                    const isIncorrect = showResult && isSelected && option !== currentQuestion.correctAnswer;

                                    return (
                                        <motion.button
                                            key={String(option)}
                                            className={`quiz-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                                            onClick={() => handleSelectAnswer(option)}
                                            whileHover={!showResult ? { scale: 1.01 } : {}}
                                        >
                                            <div className="quiz-option-marker">
                                                {isCorrect ? <CheckCircle2 size={16} /> :
                                                    isIncorrect ? <XCircle size={16} /> :
                                                        option ? 'T' : 'F'}
                                            </div>
                                            <span>{option ? 'True' : 'False'}</span>
                                        </motion.button>
                                    );
                                })}
                            </>
                        ) : (
                            currentQuestion.options?.map((option, i) => {
                                const optionLetter = option.charAt(0);
                                const isSelected = selectedAnswer === optionLetter;
                                const isCorrect = showResult && optionLetter === currentQuestion.correctAnswer;
                                const isIncorrect = showResult && isSelected && optionLetter !== currentQuestion.correctAnswer;

                                return (
                                    <motion.button
                                        key={i}
                                        className={`quiz-option ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                                        onClick={() => handleSelectAnswer(optionLetter)}
                                        whileHover={!showResult ? { scale: 1.01 } : {}}
                                    >
                                        <div className="quiz-option-marker">
                                            {isCorrect ? <CheckCircle2 size={16} /> :
                                                isIncorrect ? <XCircle size={16} /> :
                                                    optionLetter}
                                        </div>
                                        <span>{option.slice(3)}</span>
                                    </motion.button>
                                );
                            })
                        )}
                    </div>

                    {/* Explanation */}
                    {showResult && currentQuestion.explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{
                                marginTop: 'var(--space-lg)',
                                padding: 'var(--space-md)',
                                background: 'var(--dark-surface)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '3px solid var(--info)',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--space-sm)',
                                marginBottom: 'var(--space-sm)',
                                fontWeight: 600,
                                color: 'var(--info)'
                            }}>
                                <Lightbulb size={16} />
                                Explanation
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--dark-text-secondary)' }}>
                                {currentQuestion.explanation}
                            </p>
                        </motion.div>
                    )}

                    {/* Actions */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: 'var(--space-xl)',
                        gap: 'var(--space-md)'
                    }}>
                        {!showResult ? (
                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={handleSubmitAnswer}
                                disabled={selectedAnswer === null}
                                whileHover={{ scale: selectedAnswer !== null ? 1.02 : 1 }}
                                whileTap={{ scale: selectedAnswer !== null ? 0.98 : 1 }}
                            >
                                Check Answer
                            </motion.button>
                        ) : (
                            <motion.button
                                className="btn btn-primary btn-lg"
                                onClick={handleNext}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                                <ArrowRight size={18} />
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Score Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 'var(--space-lg)',
                    marginTop: 'var(--space-xl)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--dark-text-secondary)' }}>{score.correct} correct</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    <Target size={18} style={{ color: 'var(--dark-text-secondary)' }} />
                    <span style={{ color: 'var(--dark-text-secondary)' }}>{score.total} answered</span>
                </div>
            </motion.div>
        </div>
    );
}
