import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const verdictColor = {
    'AC': 'text-green-400', 'WA': 'text-red-400',
    'TLE': 'text-yellow-400', 'RE': 'text-orange-400',
    'CE': 'text-purple-400', 'SE': 'text-gray-400',
};

const defaultCode = `#include<iostream>
using namespace std;
int main(){
    // write your solution here
    return 0;
}`;

const Problem = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState(defaultCode);
    const [verdict, setVerdict] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/problems/${id}`)
            .then(res => setProblem(res.data.data.problem))
            .catch(() => setError('Problem not found'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleSubmit = async () => {
        if (!user) return alert('Please login to submit');
        setSubmitting(true);
        setVerdict(null);
        try {
            const res = await api.post('/submit', { problemId: id, code });
            setVerdict(res.data.data);
        } catch (err) {
            setVerdict({ verdict: 'SE', verdictLabel: 'System Error', error: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-gray-400 p-8">Loading...</div>;
    if (error) return <div className="text-red-400 p-8">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 gap-6">

            {/* Left — Problem */}
            <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-gray-500 font-mono text-sm">{problem.code}</span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${problem.difficulty === 'Easy' ? 'text-green-400 bg-green-400/10' :
                                problem.difficulty === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                                    'text-red-400 bg-red-400/10'
                            }`}>{problem.difficulty}</span>
                    </div>
                    <h1 className="text-white text-2xl font-bold mb-4">{problem.name}</h1>
                    <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{problem.statement}</p>
                </div>
            </div>

            {/* Right — Editor */}
            <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                        <span className="text-gray-500 text-sm">C++17</span>
                    </div>
                    <Editor
                        height="450px"
                        language="cpp"
                        theme="vs-dark"
                        value={code}
                        onChange={val => setCode(val)}
                        options={{
                            fontSize: 14,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                        }}
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
                >
                    {submitting ? 'Judging...' : 'Submit'}
                </button>

                {verdict && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-gray-400 text-sm mb-1">Result</p>
                        <p className={`text-2xl font-bold ${verdictColor[verdict.verdict] || 'text-white'}`}>
                            {verdict.verdictLabel || verdict.verdict}
                        </p>
                        {verdict.failedTestCase && (
                            <p className="text-gray-500 text-sm mt-1">Failed on test case #{verdict.failedTestCase}</p>
                        )}
                        {verdict.error && (
                            <pre className="text-red-400 text-xs mt-2 bg-gray-800 p-3 rounded-lg overflow-x-auto">
                                {verdict.error}
                            </pre>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Problem;