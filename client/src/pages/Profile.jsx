import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const verdictLabel = {
    AC: 'Accepted', WA: 'Wrong Answer', TLE: 'Time Limit Exceeded',
    RE: 'Runtime Error', CE: 'Compilation Error', SE: 'System Error',
    Accepted: 'Accepted', 'Wrong Answer': 'Wrong Answer',
};

const verdictColor = {
    AC: 'text-green-400', Accepted: 'text-green-400',
    WA: 'text-red-400', 'Wrong Answer': 'text-red-400',
    TLE: 'text-yellow-400', 'Time Limit Exceeded': 'text-yellow-400',
    CE: 'text-orange-400', RE: 'text-pink-400', SE: 'text-gray-400',
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

    if (loading) return <div className="max-w-6xl mx-auto px-6 py-8 text-gray-400">Loading...</div>;
    if (!data) return <div className="max-w-6xl mx-auto px-6 py-8 text-red-400">Failed to load profile.</div>;

    const totalSubmitted = data.stats?.reduce((sum, stat) => sum + stat.count, 0) || 0;
    const accepted = data.stats?.find(s => s._id === 'AC' || s._id === 'Accepted')?.count || 0;
    const acceptanceRate = totalSubmitted ? Math.round((accepted / totalSubmitted) * 100) : 0;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
            <section>
                <h1 className="text-white text-2xl font-bold">{data.user.fullName || user?.fullName}</h1>
                <p className="text-gray-500 text-sm mt-1">{data.user.email}</p>
                <p className="text-gray-500 text-sm mt-1">Member since {data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : '—'}</p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
                    <p className="text-white text-2xl font-bold">{totalSubmitted}</p>
                    <p className="text-gray-500 text-sm mt-1">Total Submitted</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
                    <p className="text-white text-2xl font-bold">{accepted}</p>
                    <p className="text-gray-500 text-sm mt-1">Accepted</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 rounded p-4 text-center">
                    <p className="text-white text-2xl font-bold">{acceptanceRate}%</p>
                    <p className="text-gray-500 text-sm mt-1">Acceptance Rate</p>
                </div>
            </section>

            <section>
                <h2 className="text-white text-xl font-semibold mb-4">Submission history</h2>
                <div className="border border-gray-800 bg-gray-950 rounded overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-900 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3 font-medium">Problem</th>
                                <th className="px-4 py-3 font-medium w-56">Verdict</th>
                                <th className="px-4 py-3 font-medium w-56">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentSubmissions?.length === 0 ? (
                                <tr><td colSpan="3" className="px-4 py-10 text-center text-gray-500 border-t border-gray-800">No submissions yet.</td></tr>
                            ) : data.recentSubmissions.map(sub => (
                                <tr key={sub._id} className="border-t border-gray-800 hover:bg-gray-900 transition">
                                    <td className="px-4 py-3">
                                        {sub.problem?._id ? (
                                            <Link to={`/problems/${sub.problem._id}`} className="text-blue-400 hover:underline">{sub.problem.name}</Link>
                                        ) : (
                                            <span className="text-gray-300">Unknown Problem</span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-3 font-mono ${verdictColor[sub.verdict] || 'text-white'}`}>{verdictLabel[sub.verdict] || sub.verdict}</td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sub.submitted_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Profile;
