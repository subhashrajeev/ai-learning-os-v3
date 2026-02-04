import './globals.css';
import { Manrope, Space_Grotesk } from 'next/font/google';

const manrope = Manrope({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-manrope',
});

const spaceGrotesk = Space_Grotesk({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-space',
});

export const metadata = {
    title: 'AI Learning OS V3 | Personalized AI Learning System',
    description: 'AI Learning OS V3: long-term memory, spaced repetition, and a premium learning experience.',
    keywords: 'AI learning, personalized education, spaced repetition, chromadb, LLM',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#0b0f1a" />
            </head>
            <body>
                <div className="app-container">
                    {children}
                </div>
            </body>
        </html>
    );
}
