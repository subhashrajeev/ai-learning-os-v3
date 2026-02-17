'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Radio,
    TrendingUp,
    Bookmark,
    BookmarkCheck,
    RefreshCw,
    Sparkles,
    Clock,
    ExternalLink,
    Zap,
} from 'lucide-react';
import { loadSavedItems, addSavedItem, removeSavedItem } from '@/lib/storage';
import { upsertMemoryEntries } from '@/lib/memory';

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
            const response = await fetch('/api/ecosystem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interests: profile?.interests,
                    goal: profile?.goal,
                }),
            });
            const result = await response.json();
            if (result.ok) {
                setUpdates(result);
            } else {
                console.error('API error:', result.error);
            }
        } catch (error) {
            console.error('Failed to load updates:', error);
        }

        setLoading(false);
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('/api/ecosystem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    interests: profile?.interests,
                    goal: profile?.goal,
                }),
            });
            const result = await response.json();
            if (result.ok) {
                setUpdates(result);
            }
        } catch (error) {
            console.error('Failed to refresh:', error);
        }
        setRefreshing(false);
    };

    const handleSaveItem = async (item) => {
        const isAlreadySaved = savedItems.some(s => s.headline === item.headline);

        if (isAlreadySaved) {
            const updated = savedItems.filter(s => s.headline !== item.headline);
            setSavedItems(updated);
            removeSavedItem(item.id);
        } else {
            const updated = addSavedItem(item);
            setSavedItems(updated);

            await upsertMemoryEntries([
                {
                    id: `pulse-${item.id || Date.now()}`,
                    content: `${item.headline} | ${item.description} | ${item.whyItMatters}`,
                    metadata: {
                        tag: item.tag,
                        relevance: item.relevanceScore,
                        source: 'ecosystem',
                        savedAt: new Date().toISOString(),
                    },
                },
            ]);
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
                    <Radio size={48} style={{ color: 'var(--accent)' }} />
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
            <div
                style={{ marginBottom: 'var(--space-2xl)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-sm)' }}>
                            <Radio size={24} style={{ color: 'var(--accent)' }} />
                            <h1 style={{ margin: 0 }}>Ecosystem Pulse</h1>
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 10px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(52, 211, 153, 0.15)',
                                color: 'var(--success)',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                <Zap size={10} />
                                Live
                            </span>
                        </div>
                        <p style={{ color: 'var(--dark-text-secondary)' }}>
                            AI updates curated for your learning journey
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
                        <button
                            className={`btn ${showSaved ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setShowSaved(!showSaved)}
                        >
                            <Bookmark size={16} />
                            Saved ({savedItems.length})
                        </button>

                        <button
                            className="btn btn-secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Weekly Digest */}
                {updates?.weeklyDigest && !showSaved && (
                    <div
                        style={{
                            marginTop: 'var(--space-lg)',
                            padding: 'var(--space-md) var(--space-lg)',
                            background: 'rgba(17, 24, 39, 0.4)',
                            border: '1px solid rgba(91, 234, 255, 0.2)',
                            borderRadius: 'var(--radius-lg)',
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-sm)',
                        }}>
                            <Sparkles size={18} style={{ color: 'var(--accent)' }} />
                            <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Weekly Digest</span>
                        </div>
                        <p style={{ color: 'var(--dark-text-secondary)', fontSize: '0.95rem' }}>
                            {updates.weeklyDigest}
                        </p>
                    </div>
                )}
            </div>

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
                                            <BookmarkCheck size={18} style={{ color: 'var(--accent)' }} />
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
                    <div
                        style={{
                            display: 'flex',
                            gap: 'var(--space-sm)',
                            marginBottom: 'var(--space-lg)',
                            flexWrap: 'wrap'
                        }}
                    >
                        <button
                            className="btn"
                            style={{
                                fontSize: '0.85rem',
                                background: activeFilter === 'all' ? 'rgba(91, 234, 255, 0.15)' : 'rgba(17, 24, 39, 0.8)',
                                color: activeFilter === 'all' ? 'var(--accent)' : 'var(--dark-text-secondary)',
                                border: activeFilter === 'all' ? '1px solid var(--accent)' : '1px solid rgba(91, 234, 255, 0.1)',
                            }}
                            onClick={() => setActiveFilter('all')}
                        >
                            All
                        </button>
                        {uniqueTags.map(tag => (
                            <button
                                key={tag}
                                className="btn"
                                style={{
                                    fontSize: '0.85rem',
                                    background: activeFilter === tag ? 'rgba(91, 234, 255, 0.15)' : 'rgba(17, 24, 39, 0.8)',
                                    color: activeFilter === tag ? 'var(--accent)' : 'var(--dark-text-secondary)',
                                    border: activeFilter === tag ? '1px solid var(--accent)' : '1px solid rgba(91, 234, 255, 0.1)',
                                }}
                                onClick={() => setActiveFilter(tag)}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

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
                                                <BookmarkCheck size={18} style={{ color: 'var(--accent)' }} />
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

                                {item.url && (
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            marginTop: 'var(--space-sm)',
                                            fontSize: '0.8rem',
                                            color: 'var(--accent)',
                                            opacity: 0.8,
                                            transition: 'opacity 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                                    >
                                        <ExternalLink size={12} />
                                        {item.source || 'Read source'}
                                    </a>
                                )}
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
