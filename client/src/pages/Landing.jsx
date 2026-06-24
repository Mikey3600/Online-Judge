import { Link } from 'react-router-dom';

const features = [
    'Practice coding problems with instant judging feedback.',
    'Track solved counts and compare progress on the leaderboard.',
    'Filter challenges by difficulty and search by title or code.',
];

const Landing = () => {
    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            <section className="min-h-[calc(100vh-9rem)] flex items-center">
                <div className="w-full grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                    <div className="space-y-6">
                        <p className="text-blue-400 text-sm font-semibold uppercase tracking-[0.35em]">Code. Submit. Improve.</p>
                        <h1 className="text-white font-black uppercase tracking-tight text-5xl md:text-7xl lg:text-8xl leading-none">
                            Online<br />Judge
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg max-w-2xl leading-8">
                            A simple competitive programming workspace for solving problems, checking verdicts,
                            and building a stronger coding habit one submission at a time.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded text-sm transition"
                            >
                                Forward to Login →
                            </Link>
                            <Link
                                to="/problems"
                                className="inline-flex items-center justify-center border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white px-6 py-3 rounded text-sm transition"
                            >
                                Browse Problems
                            </Link>
                        </div>
                    </div>

                    <div className="bg-gray-900 border border-gray-800 rounded p-6">
                        <h2 className="text-white text-xl font-semibold mb-5">Features</h2>
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <div key={feature} className="flex gap-4 border border-gray-800 bg-gray-950 rounded p-4">
                                    <span className="text-blue-400 font-mono text-sm">0{index + 1}</span>
                                    <p className="text-gray-300 text-sm leading-6">{feature}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 border-t border-gray-800 pt-5">
                            <p className="text-gray-500 text-sm leading-6">
                                Minimal by design: no extra backend connection is needed on this landing page—just a clean
                                entry point into your judge.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
