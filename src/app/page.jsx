'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Onboarding from '@/components/Onboarding';
import Dashboard from '@/components/Dashboard';
import LearningPath from '@/components/LearningPath';
import DailyLesson from '@/components/DailyLesson';
import PracticeMode from '@/components/PracticeMode';
import EcosystemPulse from '@/components/EcosystemPulse';
import { loadProfile, loadProgress } from '@/lib/storage';

export default function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(false);
    const [activeView, setActiveView] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [progress, setProgress] = useState(null);
    const [currentLessonDay, setCurrentLessonDay] = useState(null);

    // Check for existing profile on mount
    useEffect(() => {
        const savedProfile = loadProfile();
        const savedProgress = loadProgress();

        if (savedProfile && savedProfile.name) {
            setProfile(savedProfile);
            setHasProfile(true);
        }

        if (savedProgress) {
            setProgress(savedProgress);
        }

        setIsLoading(false);
    }, []);

    // Handle onboarding completion
    const handleOnboardingComplete = (newProfile) => {
        setProfile(newProfile);
        setHasProfile(true);
    };

    // Handle starting a lesson
    const handleStartLesson = (dayNumber) => {
        setCurrentLessonDay(dayNumber);
        setActiveView('lesson');
    };

    // Handle view change
    const handleViewChange = (view) => {
        setActiveView(view);
        if (view !== 'lesson') {
            setCurrentLessonDay(null);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="loading-overlay">
                <div className="spinner"></div>
                <p style={{ color: 'var(--dark-text-secondary)' }}>Loading your learning journey...</p>
            </div>
        );
    }

    // Show onboarding if no profile
    if (!hasProfile) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // Render active view
    const renderView = () => {
        switch (activeView) {
            case 'dashboard':
                return (
                    <Dashboard
                        profile={profile}
                        progress={progress}
                        onStartLesson={handleStartLesson}
                        onViewChange={handleViewChange}
                    />
                );
            case 'path':
                return (
                    <LearningPath
                        profile={profile}
                        progress={progress}
                        onStartLesson={handleStartLesson}
                    />
                );
            case 'lesson':
                return (
                    <DailyLesson
                        profile={profile}
                        dayNumber={currentLessonDay}
                        progress={progress}
                        onComplete={() => handleViewChange('dashboard')}
                    />
                );
            case 'practice':
                return (
                    <PracticeMode
                        profile={profile}
                        progress={progress}
                    />
                );
            case 'ecosystem':
                return (
                    <EcosystemPulse
                        profile={profile}
                    />
                );
            default:
                return <Dashboard profile={profile} progress={progress} />;
        }
    };

    return (
        <>
            <Navigation
                profile={profile}
                progress={progress}
                activeView={activeView}
                onViewChange={handleViewChange}
            />
            <main className="main-content">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeView}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderView()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </>
    );
}
