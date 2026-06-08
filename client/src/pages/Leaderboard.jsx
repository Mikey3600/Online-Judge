import { useState, useEffect } from 'react';
import api from '../api/axios';

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/leaderboard')
            .then(res => setData(res.data.data.leaderboard))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-gray-400 p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold">Leaderboard</h1>
                <p className="text-gray-500 mt-1">Ranked by problems solved</p>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 px-6 py-3 border-b border-gray-800 text-gray-500 text-xs font-medium uppercase tracking-wider">
                    <span className="col-span-1">Rank</span>
                    <span className="col-span-5">User</span>
                    <span className="col-span-3">Solved</span>
                    <span className="col-span-3">Last AC</span>
                </div>

                {data.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">No submissions yet.</div>
                ) : (
                    data.map((entry, index) => (
                        <div key={index} className="grid grid-cols-12 px-6 py-4 border-b border-gray-800 last:border-0 items-center hover:bg-gray-800/50 transition">
                            <span className="col-span-1 text-gray-400 font-bold">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-sm">
                                    {entry.user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-white font-medium text-sm">{entry.user?.fullName}</p>
                                    <p className="text-gray-500 text-xs">{entry.user?.email}</p>
                                </div>
                            </div>
                            <span className="col-span-3 text-green-400 font-bold">{entry.solvedCount}</span>
                            <span className="col-span-3 text-gray-500 text-xs">
                                {entry.lastAcceptedAt ? new Date(entry.lastAcceptedAt).toLocaleDateString() : '—'}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;