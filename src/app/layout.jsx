import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
});

export const metadata = {
    title: 'AI Learning OS | Personalized AI Learning System',
    description: 'Your hyper-personalized learning companion for mastering AI. Adaptive paths, micro-learning, and daily habit formation.',
    keywords: 'AI learning, personalized education, machine learning, deep learning, LLM',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.className}>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="theme-color" content="#1a1a1a" />
            </head>
            <body>
                <div className="app-container">
                    {children}
                </div>
            </body>
        </html>
    );
}
