import React from "react";
import {
    AbsoluteFill,
    Sequence,
    useCurrentFrame,
    useVideoConfig,
    interpolate,
    spring,
    Img,
    staticFile,
} from "remotion";

// ============================================
// SCENE COMPONENTS
// ============================================

// Intro Hook Scene
const IntroScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const logoScale = spring({
        frame,
        fps,
        config: { damping: 12 },
    });

    const titleOpacity = interpolate(frame, [20, 40], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleSlide = interpolate(frame, [40, 60], [50, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const subtitleOpacity = interpolate(frame, [40, 60], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const glowPulse = Math.sin(frame / 15) * 10 + 20;

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #1a1a1a 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            {/* Animated background particles */}
            <div
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    background: `radial-gradient(circle at 30% 40%, rgba(204, 120, 92, 0.1) 0%, transparent 50%),
                       radial-gradient(circle at 70% 60%, rgba(212, 162, 127, 0.08) 0%, transparent 40%)`,
                }}
            />

            {/* Logo with glow */}
            <div
                style={{
                    fontSize: 120,
                    transform: `scale(${logoScale})`,
                    filter: `drop-shadow(0 0 ${glowPulse}px rgba(204, 120, 92, 0.6))`,
                    marginBottom: 40,
                }}
            >
                🧠
            </div>

            {/* Title */}
            <h1
                style={{
                    fontSize: 90,
                    fontWeight: 800,
                    color: "#ffffff",
                    opacity: titleOpacity,
                    margin: 0,
                    letterSpacing: -2,
                    textShadow: "0 0 40px rgba(204, 120, 92, 0.3)",
                }}
            >
                AI Learning OS
            </h1>

            {/* Subtitle */}
            <p
                style={{
                    fontSize: 36,
                    color: "#cc785c",
                    opacity: subtitleOpacity,
                    transform: `translateY(${subtitleSlide}px)`,
                    marginTop: 20,
                    fontWeight: 500,
                }}
            >
                Your Personalized AI Learning System
            </p>

            {/* Tech badge */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    display: "flex",
                    gap: 20,
                    opacity: interpolate(frame, [70, 90], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                {["Next.js 15", "React 19", "Gemini AI"].map((tech, i) => (
                    <div
                        key={tech}
                        style={{
                            padding: "12px 24px",
                            background: "rgba(255, 255, 255, 0.05)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: 30,
                            color: "#888",
                            fontSize: 18,
                            fontWeight: 500,
                        }}
                    >
                        {tech}
                    </div>
                ))}
            </div>
        </AbsoluteFill>
    );
};

// Feature Showcase Scene
interface FeatureSceneProps {
    imagePath: string;
    title: string;
    description: string;
    highlight?: string;
}

const FeatureScene: React.FC<FeatureSceneProps> = ({
    imagePath,
    title,
    description,
    highlight,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const imageScale = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 100 },
    });

    const imageX = interpolate(frame, [0, 20], [-100, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const textOpacity = interpolate(frame, [15, 35], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const textY = interpolate(frame, [15, 35], [30, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
    });

    const highlightScale = spring({
        frame: frame - 40,
        fps,
        config: { damping: 10 },
    });

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #141414 100%)",
                display: "flex",
                alignItems: "center",
                padding: 80,
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            {/* Screenshot with frame */}
            <div
                style={{
                    flex: 1.2,
                    transform: `scale(${imageScale}) translateX(${imageX}px)`,
                    borderRadius: 24,
                    overflow: "hidden",
                    boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.1),
            0 25px 60px -12px rgba(0, 0, 0, 0.5),
            0 0 80px rgba(204, 120, 92, 0.15)
          `,
                }}
            >
                <Img
                    src={staticFile(imagePath)}
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                    }}
                />
            </div>

            {/* Text content */}
            <div
                style={{
                    flex: 0.8,
                    paddingLeft: 80,
                    opacity: textOpacity,
                    transform: `translateY(${textY}px)`,
                }}
            >
                <h2
                    style={{
                        fontSize: 56,
                        fontWeight: 700,
                        color: "#ffffff",
                        margin: 0,
                        marginBottom: 24,
                        lineHeight: 1.2,
                    }}
                >
                    {title}
                </h2>

                <p
                    style={{
                        fontSize: 26,
                        color: "#999",
                        margin: 0,
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </p>

                {highlight && (
                    <div
                        style={{
                            marginTop: 40,
                            padding: "20px 32px",
                            background: "linear-gradient(135deg, rgba(204, 120, 92, 0.2), rgba(204, 120, 92, 0.1))",
                            border: "1px solid rgba(204, 120, 92, 0.3)",
                            borderRadius: 16,
                            transform: `scale(${Math.max(0, highlightScale)})`,
                        }}
                    >
                        <span style={{ color: "#cc785c", fontSize: 22, fontWeight: 600 }}>
                            ✨ {highlight}
                        </span>
                    </div>
                )}
            </div>
        </AbsoluteFill>
    );
};

// Stats Counter Scene
const StatsScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const stats = [
        { value: 7, label: "Day Learning Path", suffix: "" },
        { value: 5, label: "Step Onboarding", suffix: "" },
        { value: 4, label: "AI Generation Types", suffix: "" },
        { value: 100, label: "Personalized", suffix: "%" },
    ];

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            <h2
                style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: "#ffffff",
                    marginBottom: 80,
                    opacity: interpolate(frame, [0, 20], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                Built for Daily Learning
            </h2>

            <div
                style={{
                    display: "flex",
                    gap: 80,
                }}
            >
                {stats.map((stat, i) => {
                    const delay = i * 10;
                    const animatedValue = interpolate(
                        frame,
                        [20 + delay, 50 + delay],
                        [0, stat.value],
                        {
                            extrapolateLeft: "clamp",
                            extrapolateRight: "clamp",
                        }
                    );

                    const scale = spring({
                        frame: frame - 20 - delay,
                        fps,
                        config: { damping: 12 },
                    });

                    return (
                        <div
                            key={stat.label}
                            style={{
                                textAlign: "center",
                                transform: `scale(${Math.max(0, scale)})`,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 100,
                                    fontWeight: 800,
                                    color: "#cc785c",
                                    lineHeight: 1,
                                    textShadow: "0 0 40px rgba(204, 120, 92, 0.4)",
                                }}
                            >
                                {Math.round(animatedValue)}{stat.suffix}
                            </div>
                            <div
                                style={{
                                    fontSize: 24,
                                    color: "#888",
                                    marginTop: 16,
                                    fontWeight: 500,
                                }}
                            >
                                {stat.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </AbsoluteFill>
    );
};

// Call to Action Scene
const CTAScene: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const scale = spring({
        frame,
        fps,
        config: { damping: 12 },
    });

    const glowIntensity = interpolate(
        Math.sin(frame / 10),
        [-1, 1],
        [20, 40]
    );

    return (
        <AbsoluteFill
            style={{
                background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Inter, system-ui, sans-serif",
            }}
        >
            {/* Glow effect */}
            <div
                style={{
                    position: "absolute",
                    width: 600,
                    height: 600,
                    background: "radial-gradient(circle, rgba(204, 120, 92, 0.2) 0%, transparent 70%)",
                    borderRadius: "50%",
                    filter: "blur(60px)",
                }}
            />

            <div style={{ transform: `scale(${scale})`, textAlign: "center" }}>
                <div style={{ fontSize: 100, marginBottom: 30 }}>🚀</div>

                <h2
                    style={{
                        fontSize: 72,
                        fontWeight: 800,
                        color: "#ffffff",
                        margin: 0,
                        marginBottom: 24,
                    }}
                >
                    Start Learning Smarter
                </h2>

                <p
                    style={{
                        fontSize: 32,
                        color: "#888",
                        marginBottom: 60,
                    }}
                >
                    100x Engineers Capstone Project
                </p>

                <div
                    style={{
                        display: "inline-block",
                        padding: "24px 64px",
                        background: "linear-gradient(135deg, #cc785c, #d4a27f)",
                        borderRadius: 60,
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#ffffff",
                        boxShadow: `0 0 ${glowIntensity}px rgba(204, 120, 92, 0.6)`,
                    }}
                >
                    Built with Gemini AI
                </div>
            </div>

            {/* Author */}
            <div
                style={{
                    position: "absolute",
                    bottom: 60,
                    color: "#666",
                    fontSize: 20,
                    opacity: interpolate(frame, [30, 50], [0, 1], {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                    }),
                }}
            >
                by Rajeev • github.com/subhashrajeev
            </div>
        </AbsoluteFill>
    );
};

// ============================================
// MAIN COMPOSITION
// ============================================

export const AILearningOSDemo: React.FC = () => {
    return (
        <AbsoluteFill>
            {/* Intro - 3 seconds */}
            <Sequence from={0} durationInFrames={90}>
                <IntroScene />
            </Sequence>

            {/* Feature 1: Onboarding - 3 seconds */}
            <Sequence from={90} durationInFrames={90}>
                <FeatureScene
                    imagePath="onboarding_welcome.png"
                    title="Deep Personalization"
                    description="Multi-step onboarding captures your role, goals, time commitment, and learning style."
                    highlight="5-Step Wizard"
                />
            </Sequence>

            {/* Feature 2: Dashboard - 3 seconds */}
            <Sequence from={180} durationInFrames={90}>
                <FeatureScene
                    imagePath="dashboard.png"
                    title="Smart Dashboard"
                    description="Track your streak, progress, and get AI-powered recommendations tailored to your pace."
                    highlight="Habit Formation"
                />
            </Sequence>

            {/* Feature 3: Learning Path - 3 seconds */}
            <Sequence from={270} durationInFrames={90}>
                <FeatureScene
                    imagePath="learning_path.png"
                    title="Visual Roadmap"
                    description="A beautiful timeline showing your 7-day personalized curriculum with progress tracking."
                    highlight="Adaptive Learning"
                />
            </Sequence>

            {/* Feature 4: Lesson Content - 3 seconds */}
            <Sequence from={360} durationInFrames={90}>
                <FeatureScene
                    imagePath="lesson_content.png"
                    title="AI-Generated Content"
                    description="Every lesson is created by Gemini AI, personalized to your skill level and interests."
                    highlight="Never Generic"
                />
            </Sequence>

            {/* Stats - 3 seconds */}
            <Sequence from={450} durationInFrames={90}>
                <StatsScene />
            </Sequence>

            {/* CTA - 2 seconds */}
            <Sequence from={540} durationInFrames={60}>
                <CTAScene />
            </Sequence>
        </AbsoluteFill>
    );
};
