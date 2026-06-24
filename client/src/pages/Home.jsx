import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const difficultyColor = {
    Easy: 'text-green-400 border-green-900',
    Medium: 'text-yellow-400 border-yellow-900',
    Hard: 'text-red-400 border-red-900',
};

const filters = ['All', 'Easy', 'Medium', 'Hard'];

const Home = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [difficulty, setDifficulty] = useState('All');

    useEffect(() => {
        api.get('/problems')
            .then(res => setProblems(res.data.data.problems))
            .catch(() => setError('Failed to load problems'))
            .finally(() => setLoading(false));
    }, []);

    const filteredProblems = problems.filter(problem => {
        const query = search.toLowerCase();
        const matchesSearch = problem.name.toLowerCase().includes(query) || problem.code.toLowerCase().includes(query);
        const matchesDifficulty = difficulty === 'All' || problem.difficulty === difficulty;
        return matchesSearch && matchesDifficulty;
    });

    if (loading) return (
        <div className="max-w-6xl mx-auto px-6 py-8 text-gray-400">Loading problems...</div>
    );

    if (error) return (
        <div className="max-w-6xl mx-auto px-6 py-8 text-red-400">{error}</div>
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-5">
                <h1 className="text-white text-xl font-semibold">Problems</h1>
                <p className="text-gray-500 text-sm mt-1">{problems.length} problems</p>
            </div>

            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search problems..."
                    className="bg-gray-900 border border-gray-800 text-white rounded px-3 py-2 w-64 text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex items-center gap-5">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            type="button"
                            onClick={() => setDifficulty(filter)}
                            className={`pb-1 text-sm transition ${difficulty === filter ? 'text-white border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="border border-gray-800 bg-gray-950 rounded overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 font-medium w-20">#</th>
                            <th className="px-4 py-3 font-medium">Title</th>
                            <th className="px-4 py-3 font-medium w-40">Difficulty</th>
                            <th className="px-4 py-3 font-medium w-32">Solved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProblems.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-10 text-center text-gray-500 border-t border-gray-800">No problems found.</td></tr>
                        ) : filteredProblems.map((problem, index) => (
                            <tr key={problem._id} className="border-t border-gray-800 hover:bg-gray-900 transition">
                                <td className="px-4 py-3 font-mono text-gray-500 text-sm">{problem.code || `P${String(index + 1).padStart(3, '0')}`}</td>
                                <td className="px-4 py-3"><Link to={`/problems/${problem._id}`} className="text-blue-400 hover:underline">{problem.name}</Link></td>
                                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border ${difficultyColor[problem.difficulty] || 'text-gray-400 border-gray-800'}`}>{problem.difficulty}</span></td>
                                <td className="px-4 py-3 text-gray-400">✓ {problem.solvedCount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Home;
