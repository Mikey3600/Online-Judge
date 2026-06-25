import { useState, useEffect, useRef } from 'react';
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
    const [, setAiResponse] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatRef = useRef(null);
    const messagesEndRef = useRef(null);

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
            setShowPopup(res.data.data && (res.data.data.verdict === 'WA' || res.data.data.verdict === 'TLE'));
        } catch (err) {
            setVerdict({ verdict: 'SE', verdictLabel: 'System Error', error: err.message });
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (showChat) {
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }
    }, [showChat]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const getAiText = (res, key = 'hint') => res.data.data?.[key] || res.data.data?.response || res.data.message || res.data.data;

    const startAiChat = async () => {
        setShowChat(true);
        setShowPopup(false);
        setChatLoading(true);
        setChatMessages([{ role: 'ai', text: '...' }]);

        try {
            const res = await api.post('/ai/hint', { problemId: id, code, verdict });
            const text = getAiText(res, 'hint');
            setChatMessages([{ role: 'ai', text: typeof text === 'string' ? text : JSON.stringify(text) }]);
        } catch (err) {
            setChatMessages([{ role: 'ai', text: err.response?.data?.message || 'AI response is unavailable right now.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const sendChatMessage = async () => {
        const text = chatInput.trim();
        if (!text || chatLoading) return;

        const nextMessages = [...chatMessages, { role: 'user', text }];
        setChatMessages(nextMessages);
        setChatInput('');
        setChatLoading(true);

        try {
            const res = await api.post('/ai/chat', { problemId: id, code, verdict, messages: nextMessages });
            const aiText = getAiText(res, 'reply');
            setChatMessages([...nextMessages, { role: 'ai', text: typeof aiText === 'string' ? aiText : JSON.stringify(aiText) }]);
        } catch (err) {
            setChatMessages([...nextMessages, { role: 'ai', text: err.response?.data?.message || 'AI response is unavailable right now.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    if (loading) return <div className="max-w-6xl mx-auto px-6 py-8 text-gray-400">Loading...</div>;
    if (error) return <div className="max-w-6xl mx-auto px-6 py-8 text-red-400">{error}</div>;

    return (
        <>
        {showPopup && verdict && (verdict.verdict === 'WA' || verdict.verdict === 'TLE') && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 relative">
                    <button onClick={() => setShowPopup(false)} className="absolute top-3 right-3 text-gray-500 hover:text-white text-lg" aria-label="Close AI explanation popup">×</button>
                    <div className={`flex items-center gap-2 font-mono text-sm ${verdictColor[verdict.verdict] || 'text-white'}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${verdict.verdict === 'WA' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
                        <span>{verdict.verdictLabel || verdict.verdict}</span>
                    </div>
                    <h2 className="text-white text-lg font-semibold mt-2">Want to know why?</h2>
                    <p className="text-gray-400 text-sm mt-1">Click below and I'll explain what went wrong in simple steps.</p>
                    <button onClick={startAiChat} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded text-sm font-semibold mt-4 w-full">Yes, explain it</button>
                </div>
            </div>
        )}
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
                    </div>
                )}

                {showChat && verdict && (
                    <div ref={chatRef} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-semibold">AI Assistant</p>
                            <span className={`font-mono text-xs ${verdictColor[verdict.verdict] || 'text-gray-400'}`}>{verdict.verdictLabel || verdict.verdict}</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto space-y-3 mt-3 mb-3">
                            {chatMessages.map((message, index) => (
                                <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : ''}>
                                    <div className={message.role === 'user' ? 'max-w-[85%]' : 'max-w-full'}>
                                        <p className={message.role === 'user' ? 'text-blue-400 text-xs mb-1' : 'text-gray-500 text-xs mb-1'}>{message.role === 'user' ? 'You' : 'AI'}</p>
                                        <div className={message.role === 'user' ? 'bg-blue-600/20 border border-blue-800 rounded-lg p-3 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap' : 'bg-gray-800 rounded-lg p-3 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap'}>
                                            {message.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex gap-2">
                            <textarea
                                className="flex-1 bg-gray-950 border border-gray-800 text-white text-sm rounded px-3 py-2 resize-none focus:outline-none focus:border-blue-500"
                                rows={2}
                                placeholder="Ask a follow-up..."
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                            />
                            <button onClick={sendChatMessage} disabled={chatLoading || !chatInput.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold self-end disabled:opacity-50">
                                {chatLoading ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
        </>
    );
};

export default Problem;
