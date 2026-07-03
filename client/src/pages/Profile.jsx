import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const verdictLabel = {
    'AC': 'Accepted', 'WA': 'Wrong Answer', 'TLE': 'Time Limit Exceeded',
    'RE': 'Runtime Error', 'CE': 'Compilation Error', 'SE': 'System Error',
    'Accepted': 'Accepted', 'Wrong Answer': 'Wrong Answer',
};

const verdictColor = {
    'AC': 'text-green-400', 'Accepted': 'text-green-400',
    'WA': 'text-red-400', 'Wrong Answer': 'text-red-400',
    'TLE': 'text-yellow-400', 'Time Limit Exceeded': 'text-yellow-400',
    'RE': 'text-orange-400', 'CE': 'text-purple-400', 'SE': 'text-gray-400',
};

const Profile = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/profile')
            .then(res => setData(res.data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="text-white p-8">Loading...</div>;
    if (!data) return <div className="text-red-400 p-8">Failed to load profile.</div>;

    const totalSolved = data.stats?.find(s => s._id === 'AC')?.count || 0;

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

            {/* User Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-black font-bold text-2xl">
                    {data.user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-white text-2xl font-bold">{data.user.fullName}</h1>
                    <p className="text-gray-400 text-sm">{data.user.email}</p>
                    {data.user.dob && (
                        <p className="text-gray-500 text-sm mt-1">
                            DOB: {new Date(data.user.dob).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="ml-auto text-center">
                    <p className="text-green-400 text-3xl font-bold">{totalSolved}</p>
                    <p className="text-gray-500 text-sm">Problems Solved</p>
                </div>
            </div>

            {/* Stats */}
            {data.stats?.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-bold text-lg mb-4">Verdict Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {data.stats.map(stat => (
                            <div key={stat._id} className="bg-gray-800 rounded-lg p-4 text-center">
                                <p className={`text-2xl font-bold ${verdictColor[stat._id] || 'text-white'}`}>
                                    {stat.count}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    {verdictLabel[stat._id] || stat._id}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Submissions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold text-lg mb-4">Recent Submissions</h2>
                {data.recentSubmissions?.length === 0 ? (
                    <p className="text-gray-500">No submissions yet.</p>
                ) : (
                    <div className="space-y-3">
                        {data.recentSubmissions.map(sub => (
                            <div key={sub._id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                                <div>
                                    <p className="text-white text-sm font-medium">{sub.problem?.name || 'Unknown Problem'}</p>
                                    <p className="text-gray-500 text-xs mt-0.5">
                                        {new Date(sub.submitted_at).toLocaleString()}
                                    </p>
                                </div>
                                <span className={`text-sm font-bold ${verdictColor[sub.verdict] || 'text-white'}`}>
                                    {verdictLabel[sub.verdict] || sub.verdict}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default Profile;