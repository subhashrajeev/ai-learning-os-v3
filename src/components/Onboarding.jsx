'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    ArrowLeft,
    User,
    Target,
    Clock,
    Sparkles,
    CheckCircle2
} from 'lucide-react';
import { saveProfile, saveProgress, saveCurriculum } from '@/lib/storage';
import { generateCurriculum } from '@/lib/gemini';

const STEPS = [
    { id: 'welcome', title: "Let's Get Started", subtitle: "Your personalized AI learning journey begins here" },
    { id: 'basics', title: 'About You', subtitle: 'Tell us about yourself' },
    { id: 'goals', title: 'Your Goals', subtitle: 'What do you want to achieve?' },
    { id: 'schedule', title: 'Your Schedule', subtitle: 'How much time can you dedicate?' },
    { id: 'preferences', title: 'Learning Style', subtitle: 'How do you learn best?' },
    { id: 'generating', title: 'Creating Your Path', subtitle: 'AI is designing your personalized curriculum' },
];

const ROLES = [
    'Student',
    'Software Developer',
    'Data Analyst',
    'Product Manager',
    'Researcher',
    'Designer',
    'Entrepreneur',
    'Career Changer',
    'Other',
];

const EXPERIENCE_LEVELS = [
    { value: 'beginner', label: 'Beginner', desc: 'New to AI/ML' },
    { value: 'intermediate', label: 'Intermediate', desc: 'Familiar with basics' },
    { value: 'advanced', label: 'Advanced', desc: 'Working experience' },
];

const GOALS = [
    'Build AI Agents',
    'Master LLMs & Prompting',
    'Learn Machine Learning',
    'Build AI Products',
    'Transition to AI Career',
    'Research & Academia',
    'Automate My Work',
    'General AI Literacy',
];

const TIME_OPTIONS = [
    { value: '15 mins', label: '15 minutes', desc: 'Quick daily touch' },
    { value: '30 mins', label: '30 minutes', desc: 'Focused learning' },
    { value: '45 mins', label: '45 minutes', desc: 'Deep dive sessions' },
    { value: '1 hour', label: '1 hour', desc: 'Intensive learning' },
    { value: '1+ hours', label: '1+ hours', desc: 'Immersive experience' },
];

const LEARNING_STYLES = [
    { value: 'hands-on', label: 'Hands-On / Code First', desc: 'Learn by building' },
    { value: 'conceptual', label: 'Conceptual / Theory First', desc: 'Understand before doing' },
    { value: 'visual', label: 'Visual / Diagrams', desc: 'Charts and illustrations' },
    { value: 'mixed', label: 'Balanced Mix', desc: 'Theory + Practice' },
];

export default function Onboarding({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        experience: 'beginner',
        goal: '',
        customGoal: '',
        interests: '',
        timePerDay: '30 mins',
        learningStyle: 'hands-on',
        currentSkills: '',
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0: return true;
            case 1: return formData.name.trim() && formData.role;
            case 2: return formData.goal || formData.customGoal;
            case 3: return formData.timePerDay;
            case 4: return formData.learningStyle;
            default: return true;
        }
    };

    const handleNext = async () => {
        if (currentStep < STEPS.length - 2) {
            setCurrentStep(prev => prev + 1);
        } else if (currentStep === STEPS.length - 2) {
            // Start generation
            setCurrentStep(prev => prev + 1);
            setIsGenerating(true);

            try {
                const finalProfile = {
                    ...formData,
                    goal: formData.customGoal || formData.goal,
                    createdAt: new Date().toISOString(),
                };

                // Save profile
                saveProfile(finalProfile);

                // Generate curriculum
                const curriculum = await generateCurriculum(finalProfile);
                saveCurriculum(curriculum);

                // Initialize progress
                saveProgress({
                    completedDays: [],
                    currentDay: 1,
                    totalTimeSpent: 0,
                    lessonsCompleted: 0,
                    quizzesTaken: 0,
                    quizScore: 0,
                    lastActiveDate: new Date().toISOString(),
                    startDate: new Date().toISOString(),
                    lastReviewDate: null,
                });

                // Wait a moment for effect, then complete
                setTimeout(() => {
                    onComplete(finalProfile);
                }, 1500);

            } catch (err) {
                console.error('Onboarding Error:', err);
                setError(err.message || 'Failed to generate curriculum. Please check your API key.');
                setIsGenerating(false);
                setCurrentStep(prev => prev - 1);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0: // Welcome
                return (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--space-lg)' }}>🧠</div>
                        <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-md)' }}>
                            Welcome to AI Learning OS
                        </h1>
                        <p style={{ color: 'var(--dark-text-secondary)', maxWidth: 400, margin: '0 auto' }}>
                            Your personalized learning companion for mastering AI. Answer a few questions and we{`'`}ll build a path with long-term memory and spaced repetition.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: 'var(--space-md)',
                            justifyContent: 'center',
                            marginTop: 'var(--space-2xl)',
                            flexWrap: 'wrap'
                        }}>
                            {['Personalized Path', 'Spaced Repetition', 'Memory Vault', 'Track Progress'].map((feature) => (
                                <div
                                    key={feature}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 'var(--space-sm)',
                                        padding: 'var(--space-sm) var(--space-md)',
                                        background: 'var(--glass-bg)',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );

            case 1: // Basics
                return (
                    <div className="onboarding-form">
                        <div className="input-group">
                            <label className="input-label">What should we call you?</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Your name"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">What{`'`}s your current role?</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                {ROLES.map((role) => (
                                    <motion.button
                                        key={role}
                                        type="button"
                                        className={`btn ${formData.role === role ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => updateField('role', role)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ fontSize: '0.875rem' }}
                                    >
                                        {role}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Your AI/ML experience level</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <motion.button
                                        key={level.value}
                                        type="button"
                                        className={`quiz-option ${formData.experience === level.value ? 'selected' : ''}`}
                                        onClick={() => updateField('experience', level.value)}
                                        whileHover={{ scale: 1.01 }}
                                        style={{ textAlign: 'left' }}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{level.label}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                                {level.desc}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 2: // Goals
                return (
                    <div className="onboarding-form">
                        <div className="input-group">
                            <label className="input-label">What{`'`}s your primary learning goal?</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
                                {GOALS.map((goal) => (
                                    <motion.button
                                        key={goal}
                                        type="button"
                                        className={`btn ${formData.goal === goal ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => { updateField('goal', goal); updateField('customGoal', ''); }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{ fontSize: '0.875rem' }}
                                    >
                                        {goal}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Or describe your own goal</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Build a chatbot for my startup"
                                value={formData.customGoal}
                                onChange={(e) => { updateField('customGoal', e.target.value); updateField('goal', ''); }}
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Any specific interests within AI? (Optional)</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g., Computer Vision, NLP, RAG, Fine-tuning"
                                value={formData.interests}
                                onChange={(e) => updateField('interests', e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 3: // Schedule
                return (
                    <div className="onboarding-form">
                        <div className="input-group">
                            <label className="input-label">How much time can you dedicate daily?</label>
                            <p style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-md)' }}>
                                Be realistic - consistency beats intensity
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {TIME_OPTIONS.map((option) => (
                                    <motion.button
                                        key={option.value}
                                        type="button"
                                        className={`quiz-option ${formData.timePerDay === option.value ? 'selected' : ''}`}
                                        onClick={() => updateField('timePerDay', option.value)}
                                        whileHover={{ scale: 1.01 }}
                                        style={{ textAlign: 'left' }}
                                    >
                                        <Clock size={20} style={{ color: 'var(--claude-orange)' }} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{option.label}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                                {option.desc}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 4: // Learning Style
                return (
                    <div className="onboarding-form">
                        <div className="input-group">
                            <label className="input-label">How do you prefer to learn?</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                                {LEARNING_STYLES.map((style) => (
                                    <motion.button
                                        key={style.value}
                                        type="button"
                                        className={`quiz-option ${formData.learningStyle === style.value ? 'selected' : ''}`}
                                        onClick={() => updateField('learningStyle', style.value)}
                                        whileHover={{ scale: 1.01 }}
                                        style={{ textAlign: 'left' }}
                                    >
                                        <Sparkles size={20} style={{ color: 'var(--claude-orange)' }} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{style.label}</div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--dark-text-secondary)' }}>
                                                {style.desc}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">What skills do you already have? (Optional)</label>
                            <textarea
                                className="input textarea"
                                placeholder="e.g., Python, JavaScript, basic ML concepts, statistics..."
                                value={formData.currentSkills}
                                onChange={(e) => updateField('currentSkills', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                );

            case 5: // Generating
                return (
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            style={{ fontSize: '4rem', marginBottom: 'var(--space-xl)' }}
                        >
                            🪄
                        </motion.div>

                        <h2 style={{ marginBottom: 'var(--space-md)' }}>
                            Designing Your Learning Path...
                        </h2>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            Our AI is analyzing your profile and creating a personalized 7-day curriculum
                        </p>

                        <motion.div
                            style={{
                                width: 200,
                                height: 4,
                                background: 'var(--dark-surface)',
                                borderRadius: 'var(--radius-full)',
                                margin: 'var(--space-xl) auto',
                                overflow: 'hidden',
                            }}
                        >
                            <motion.div
                                style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, var(--claude-orange), var(--claude-tan))',
                                    borderRadius: 'var(--radius-full)',
                                }}
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3, ease: 'easeOut' }}
                            />
                        </motion.div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="onboarding-container">
            <motion.div
                className="onboarding-card"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Step Indicator */}
                <div className="onboarding-step-indicator">
                    {STEPS.slice(0, -1).map((step, index) => (
                        <motion.div
                            key={step.id}
                            className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                            initial={false}
                            animate={{
                                width: index === currentStep ? 24 : 10,
                                background: index < currentStep ? 'var(--success)' :
                                    index === currentStep ? 'var(--claude-orange)' : 'var(--dark-border)'
                            }}
                        />
                    ))}
                </div>

                {/* Header */}
                {currentStep < STEPS.length - 1 && (
                    <div className="onboarding-header">
                        <h2 className="onboarding-title">{STEPS[currentStep].title}</h2>
                        <p className="onboarding-subtitle">{STEPS[currentStep].subtitle}</p>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            background: 'rgba(248, 113, 113, 0.1)',
                            border: '1px solid var(--error)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            marginBottom: 'var(--space-lg)',
                            color: 'var(--error)',
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>

                {/* Actions */}
                {currentStep < STEPS.length - 1 && (
                    <div className="onboarding-actions">
                        <motion.button
                            className="btn btn-ghost"
                            onClick={handleBack}
                            disabled={currentStep === 0}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{ opacity: currentStep === 0 ? 0.5 : 1 }}
                        >
                            <ArrowLeft size={18} />
                            Back
                        </motion.button>

                        <motion.button
                            className="btn btn-primary btn-lg"
                            onClick={handleNext}
                            disabled={!canProceed() || isGenerating}
                            whileHover={{ scale: canProceed() ? 1.02 : 1 }}
                            whileTap={{ scale: canProceed() ? 0.98 : 1 }}
                        >
                            {currentStep === 0 ? "Let's Go" :
                                currentStep === STEPS.length - 2 ? 'Generate My Path' : 'Continue'}
                            <ArrowRight size={18} />
                        </motion.button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
