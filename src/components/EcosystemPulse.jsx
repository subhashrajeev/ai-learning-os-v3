'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Radio,
    TrendingUp,
    Bookmark,
    BookmarkCheck,
    ExternalLink,
    RefreshCw,
    Sparkles,
    Filter,
    Clock,
} from 'lucide-react';
import { loadSavedItems, addSavedItem, removeSavedItem } from '@/lib/storage';
import { generateEcosystemUpdates } from '@/lib/gemini';

export default function EcosystemPulse({ profile }) {
    const [updates, setUpdates] = useState(null);
    const [savedItems, setSavedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const saved = loadSavedItems();
        setSavedItems(saved);

        try {
            const result = await generateEcosystemUpdates(profile?.interests, profile?.goal);
            setUpdates(result);
        } catch (error) {
            console.error('Failed to load updates:', error);
        }

        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const result = await generateEcosystemUpdates(profile?.interests, profile?.goal);
            setUpdates(result);
        } catch (error) {
            console.error('Failed to refresh:', error);
        }
        setRefreshing(false);
    };

    const handleSaveItem = (item) => {
        const isAlreadySaved = savedItems.some(s => s.headline === item.headline);

        if (isAlreadySaved) {
            const updated = savedItems.filter(s => s.headline !== item.headline);
            setSavedItems(updated);
            removeSavedItem(item.id);
        } else {
            const updated = addSavedItem(item);
            setSavedItems(updated);
        }
    };

    const isItemSaved = (item) => {
        return savedItems.some(s => s.headline === item.headline);
    };

    const getFilteredUpdates = () => {
        if (!updates?.updates) return [];
        if (activeFilter === 'all') return updates.updates;
        return updates.updates.filter(u => u.tag?.toLowerCase() === activeFilter.toLowerCase());
    };

    const uniqueTags = [...new Set(updates?.updates?.map(u => u.tag) || [])];

    if (loading) {
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
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 180, 360]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    style={{ marginBottom: 'var(--space-lg)' }}
                >
                    <Radio size={48} style={{ color: 'var(--claude-orange)' }} />
                </motion.div>
                <h3>Scanning the AI Ecosystem...</h3>
                <p style={{ color: 'var(--dark-text-secondary)' }}>
                    Finding updates relevant to {profile?.goal || 'your goals'}
                </p>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                            <Radio size={24} style={{ color: 'var(--claude-orange)' }} />
                            <h1>Ecosystem Pulse</h1>
                        </div>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            AI updates curated for your learning journey
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <motion.button
                            className={`btn ${showSaved ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowSaved(!showSaved)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Bookmark size={16} />
                            Saved ({savedItems.length})
                        </motion.button>

                        <motion.button
                            className="btn btn-secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            Refresh
                        </motion.button>
                    </div>
                </div>

                {/* Weekly Digest */}
                {updates?.weeklyDigest && !showSaved && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-md) var(--space-lg)',
                            background: 'linear-gradient(135deg, rgba(204, 120, 92, 0.2), rgba(212, 162, 127, 0.1))',
                            border: '1px solid var(--claude-orange)',
                            borderRadius: 'var(--radius-lg)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-sm)',
                        }}>
                            <Sparkles size={18} style={{ color: 'var(--claude-orange)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--claude-orange)' }}>Weekly Digest</span>
                        </div>
                        <p style={{ color: 'var(--dark-text)', fontSize: '0.95rem' }}>
                            {updates.weeklyDigest}
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* Saved Items View */}
            {showSaved && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {savedItems.length === 0 ? (
                        <div className="glass-card" style={{ textAlign: 'center' }}>
                            <Bookmark size={48} style={{ color: 'var(--dark-text-secondary)', marginBottom: 'var(--space-md)' }} />
                            <h3>No saved items yet</h3>
                            <p style={{ color: 'var(--dark-text-secondary)' }}>
                                Click the bookmark icon on any update to save it for later
                            </p>
                        </div>
                    ) : (
                        <div className="pulse-grid">
                            {savedItems.map((item, index) => (
                                <motion.div
                                    key={item.headline}
                                    className="pulse-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div className="pulse-header">
                                        <h3 className="pulse-title">{item.headline}</h3>
                                        <motion.button
                                            className="btn btn-icon btn-ghost"
                                            onClick={() => handleSaveItem(item)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <BookmarkCheck size={18} style={{ color: 'var(--claude-orange)' }} />
                                        </motion.button>
                                    </div>
                                    <p className="pulse-description">{item.description}</p>
                                    {item.savedAt && (
                                        <div style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--dark-text-secondary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 'var(--space-xs)',
                                            marginTop: 'var(--space-sm)'
                                        }}>
                                            <Clock size={12} />
                                            Saved {new Date(item.savedAt).toLocaleDateString()}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}

            {/* Updates Grid */}
            {!showSaved && (
                <>
                    {/* Filter Tags */}
                    {uniqueTags.length > 1 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                display: 'flex',
                                gap: 'var(--space-sm)',
                                marginBottom: 'var(--space-lg)',
                                flexWrap: 'wrap'
                            }}
                        >
                            <motion.button
                                className={`btn ${activeFilter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveFilter('all')}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                style={{ fontSize: '0.85rem' }}
                            >
                                All
                            </motion.button>
                            {uniqueTags.map(tag => (
                                <motion.button
                                    key={tag}
                                    className={`btn ${activeFilter === tag ? 'btn-primary' : 'btn-secondary'}`}
                                    onClick={() => setActiveFilter(tag)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ fontSize: '0.85rem' }}
                                >
                                    {tag}
                                </motion.button>
                            ))}
                        </motion.div>
                    )}

                    <div className="pulse-grid">
                        {getFilteredUpdates().map((item, index) => (
                            <motion.div
                                key={item.id || index}
                                className="pulse-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div className="pulse-header">
                                    <div>
                                        <span className="pulse-tag">{item.tag}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                                        {item.relevanceScore && (
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '0.75rem',
                                                color: 'var(--dark-text-secondary)'
                                            }}>
                                                <TrendingUp size={12} />
                                                {item.relevanceScore}/10
                                            </div>
                                        )}
                                        <motion.button
                                            className="btn btn-icon btn-ghost"
                                            onClick={() => handleSaveItem(item)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            {isItemSaved(item) ? (
                                                <BookmarkCheck size={18} style={{ color: 'var(--claude-orange)' }} />
                                            ) : (
                                                <Bookmark size={18} />
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                <h3 className="pulse-title" style={{ marginTop: 'var(--space-sm)' }}>
                                    {item.headline}
                                </h3>
                                <p className="pulse-description">{item.description}</p>

                                <div className="pulse-why">
                                    <div className="pulse-why-label">Why it matters to you</div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--dark-text-secondary)', margin: 0 }}>
                                        {item.whyItMatters}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Last Updated */}
                    {updates?.lastUpdated && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{
                                textAlign: 'center',
                                marginTop: 'var(--space-2xl)',
                                color: 'var(--dark-text-secondary)',
                                fontSize: '0.875rem',
                            }}
                        >
                            Knowledge as of {updates.lastUpdated}
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
}
