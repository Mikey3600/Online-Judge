import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const difficultyColor = {
    Easy: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    Hard: 'text-red-400 bg-red-400/10',
};

const Home = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/problems')
            .then(res => setProblems(res.data.data.problems))
            .catch(() => setError('Failed to load problems'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-gray-400">Loading problems...</p>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold">Problems</h1>
                <p className="text-gray-500 mt-1">{problems.length} problems available</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-800 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <span className="col-span-1">#</span>
                    <span className="col-span-7">Problem</span>
                    <span className="col-span-2">Code</span>
                    <span className="col-span-2">Difficulty</span>
                </div>

                {problems.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No problems yet.
                    </div>
                ) : (
                    problems.map((problem, index) => (
                        <Link
                            key={problem._id}
                            to={`/problems/${problem._id}`}
                            className="grid grid-cols-12 px-6 py-4 border-b border-gray-800 last:border-0 hover:bg-gray-800/50 transition items-center"
                        >
                            <span className="col-span-1 text-gray-500 text-sm">{index + 1}</span>
                            <span className="col-span-7 text-white font-medium hover:text-green-400 transition">
                                {problem.name}
                            </span>
                            <span className="col-span-2 text-gray-500 text-sm font-mono">{problem.code}</span>
                            <span className="col-span-2">
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${difficultyColor[problem.difficulty] || 'text-gray-400 bg-gray-400/10'}`}>
                                    {problem.difficulty}
                                </span>
                            </span>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;