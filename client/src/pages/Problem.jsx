import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const verdictColor = {
    AC: 'text-green-400',
    WA: 'text-red-400',
    TLE: 'text-yellow-400',
    CE: 'text-orange-400',
    RE: 'text-pink-400',
    SE: 'text-gray-400',
};

const difficultyColor = {
    Easy: 'text-green-400 border-green-900',
    Medium: 'text-yellow-400 border-yellow-900',
    Hard: 'text-red-400 border-red-900',
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
    const [sample, setSample] = useState(null);
    const [code, setCode] = useState(defaultCode);
    const [verdict, setVerdict] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState('');
    const [aiResponse, setAiResponse] = useState(null);

    useEffect(() => {
        api.get(`/problems/${id}`)
            .then(res => setProblem(res.data.data.problem))
            .catch(() => setError('Problem not found'))
            .finally(() => setLoading(false));

        api.get(`/testcases/${id}`)
            .then(res => setSample(res.data.data.testCases?.[0] || null))
            .catch(() => setSample(null));
    }, [id]);

    const handleSubmit = async () => {
        if (!user) return alert('Please login to submit');
        setSubmitting(true);
        setVerdict(null);
        setAiResponse(null);
        try {
            const res = await api.post('/submit', { problemId: id, code });
            setVerdict(res.data.data);
        } catch (err) {
            setVerdict({ verdict: 'SE', verdictLabel: 'System Error', error: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    const handleAiRequest = async (type) => {
        setAiLoading(type);
        setAiResponse(null);
        try {
            const res = await api.post(`/ai/${type}`, { problemId: id, code, verdict });
            setAiResponse({ type, text: res.data.data?.hint || res.data.data?.review || res.data.message || res.data.data });
        } catch (err) {
            setAiResponse({ type, text: err.response?.data?.message || 'AI response is unavailable right now.' });
        } finally {
            setAiLoading('');
        }
    };

    if (loading) return <div className="max-w-6xl mx-auto px-6 py-8 text-gray-400">Loading...</div>;
    if (error) return <div className="max-w-6xl mx-auto px-6 py-8 text-red-400">{error}</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
            <section className="bg-gray-950 border border-gray-800 rounded p-5">
                <h1 className="text-white text-xl font-semibold">{problem.name}</h1>
                <div className="flex items-center gap-3 mt-3 pb-4 border-b border-gray-800">
                    <span className={`text-xs px-2 py-0.5 rounded border ${difficultyColor[problem.difficulty] || 'text-gray-400 border-gray-800'}`}>{problem.difficulty}</span>
                    <span className="font-mono text-gray-500 text-sm">{problem.code}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mt-5">{problem.statement}</p>

                <div className="mt-6 space-y-4">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Input</p>
                        <pre className="bg-gray-900 border border-gray-800 rounded p-3 font-mono text-sm text-gray-300 overflow-x-auto">{sample?.input || 'No sample input available.'}</pre>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Output</p>
                        <pre className="bg-gray-900 border border-gray-800 rounded p-3 font-mono text-sm text-gray-300 overflow-x-auto">{sample?.output || 'No sample output available.'}</pre>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex justify-end">
                    <select className="bg-gray-900 border border-gray-800 text-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" value="cpp17" onChange={() => {}}>
                        <option value="cpp17">C++17</option>
                    </select>
                </div>
                <div className="bg-gray-950 border border-gray-800 rounded overflow-hidden min-h-80">
                    <Editor
                        height="420px"
                        language="cpp"
                        theme="vs-dark"
                        value={code}
                        onChange={val => setCode(val)}
                        options={{ fontSize: 14, fontFamily: 'monospace', minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true }}
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded text-sm font-semibold transition disabled:opacity-50">
                        {submitting ? 'Judging...' : 'Submit'}
                    </button>
                </div>

                {verdict && (
                    <div className="bg-gray-900 border border-gray-800 rounded p-4">
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Verdict</p>
                        <p className={`font-mono text-lg font-semibold ${verdictColor[verdict.verdict] || 'text-white'}`}>✓ {verdict.verdictLabel || verdict.verdict}</p>
                        {verdict.failedTestCase && <p className="text-gray-500 text-sm mt-1">Failed on test case #{verdict.failedTestCase}</p>}
                        {verdict.error && <pre className="text-red-400 text-xs mt-3 bg-gray-950 border border-gray-800 p-3 rounded overflow-x-auto">{verdict.error}</pre>}
                        <div className="flex flex-wrap gap-3 mt-4">
                            <button onClick={() => handleAiRequest('hint')} disabled={!!aiLoading} className="text-yellow-400 border border-yellow-800 px-4 py-1.5 rounded text-sm disabled:opacity-50">{aiLoading === 'hint' ? 'Loading...' : 'Get a hint'}</button>
                            <button onClick={() => handleAiRequest('review')} disabled={!!aiLoading} className="text-purple-400 border border-purple-800 px-4 py-1.5 rounded text-sm disabled:opacity-50">{aiLoading === 'review' ? 'Loading...' : 'Review my code'}</button>
                        </div>
                        {aiResponse && (
                            <div className="bg-gray-900 border border-gray-800 rounded p-4 text-gray-300 text-sm mt-3 whitespace-pre-wrap">
                                <p className="text-gray-500 text-xs uppercase mb-2">{aiResponse.type === 'hint' ? 'AI Hint' : 'AI Code Review'}</p>
                                {typeof aiResponse.text === 'string' ? aiResponse.text : JSON.stringify(aiResponse.text)}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Problem;
