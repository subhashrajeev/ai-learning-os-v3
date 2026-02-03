'use client';

import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Map,
    BookOpen,
    Brain,
    Radio,
    Settings,
    LogOut
} from 'lucide-react';
import { loadStreak, updateStreak, clearAllData } from '@/lib/storage';
import { useEffect, useState } from 'react';

export default function Navigation({ profile, progress, activeView, onViewChange }) {
    const [streak, setStreak] = useState({ currentStreak: 0 });

    useEffect(() => {
        const updatedStreak = updateStreak();
        setStreak(updatedStreak);
    }, []);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'path', label: 'Learning Path', icon: Map },
        { id: 'practice', label: 'Practice', icon: Brain },
        { id: 'ecosystem', label: 'Ecosystem', icon: Radio },
    ];

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            clearAllData();
            window.location.reload();
        }
    };

    return (
        <nav className="nav">
            {/* Brand */}
            <div className="nav-brand">
                <div className="nav-brand-icon">🧠</div>
                <span>AI Learning OS</span>
            </div>

            {/* Navigation Links */}
            <div className="nav-links">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <motion.button
                            key={item.id}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                            onClick={() => onViewChange(item.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Icon size={18} className="nav-icon" />
                            <span>{item.label}</span>
                        </motion.button>
                    );
                })}
            </div>

            {/* Actions */}
            <div className="nav-actions">
                {/* Streak Display */}
                <motion.div
                    className="streak-display"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="streak-fire">🔥</span>
                    <span className="streak-count">{streak.currentStreak}</span>
                    <span className="streak-label">day streak</span>
                </motion.div>

                {/* Profile Quick View */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {profile?.name || 'Learner'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--dark-text-secondary)' }}>
                            {profile?.goal || 'Learning AI'}
                        </div>
                    </div>

                    <motion.div
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 'var(--radius-md)',
                            background: 'linear-gradient(135deg, var(--claude-orange), var(--claude-tan))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '1rem',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleReset}
                        title="Reset Profile"
                    >
                        {profile?.name?.charAt(0)?.toUpperCase() || '?'}
                    </motion.div>
                </div>
            </div>
        </nav>
    );
}
