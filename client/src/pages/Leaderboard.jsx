import { useState, useEffect } from 'react';
import api from '../api/axios';

const rankColor = (index) => {
    if (index === 0) return 'text-[#FFD700]';
    if (index === 1) return 'text-[#C0C0C0]';
    if (index === 2) return 'text-[#CD7F32]';
    return 'text-gray-400';
};

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leaderboard')
            .then(res => setData(res.data.data.leaderboard))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="max-w-6xl mx-auto px-6 py-8 text-gray-400">Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <h1 className="text-white text-xl font-semibold mb-5">Leaderboard</h1>
            <div className="border border-gray-800 bg-gray-950 rounded overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-900 text-gray-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-4 py-3 font-medium w-28">Rank</th>
                            <th className="px-4 py-3 font-medium">User</th>
                            <th className="px-4 py-3 font-medium w-32">Solved</th>
                            <th className="px-4 py-3 font-medium w-48">Last submission</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr><td colSpan="4" className="px-4 py-10 text-center text-gray-500 border-t border-gray-800">No submissions yet.</td></tr>
                        ) : data.map((entry, index) => (
                            <tr key={entry.user?._id || index} className="border-t border-gray-800 hover:bg-gray-900 transition">
                                <td className={`px-4 py-3 font-mono font-semibold ${rankColor(index)}`}>{index + 1}</td>
                                <td className="px-4 py-3">
                                    <p className="text-blue-400 font-medium">{entry.user?.fullName || 'Unknown user'}</p>
                                    <p className="text-gray-500 text-xs">{entry.user?.email}</p>
                                </td>
                                <td className="px-4 py-3 text-gray-300 font-mono">{entry.solvedCount}</td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {entry.lastAcceptedAt ? new Date(entry.lastAcceptedAt).toLocaleString() : '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leaderboard;
