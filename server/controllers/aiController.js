const Problem = require('../models/Problem');

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-8b-8192';

const getVerdictLabel = (verdict) => verdict?.verdictLabel || 'an unsuccessful verdict';

const callGroq = async (messages) => {
    if (!GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await fetch(GROQ_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
};

const hint = async (req, res) => {
    try {
        const { problemId, code, verdict } = req.body;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        const verdictLabel = getVerdictLabel(verdict);
        const systemPrompt = `You are a competitive programming mentor. A student got ${verdictLabel} on a problem.
   Explain in 3-4 simple bullet points what likely went wrong in their code and what concept
   they should think about. Do NOT give the solution or write any code. Be concise and clear.`;
        const userMessage = `Problem: ${problem.name}\n\nMy code:\n${code}\n\nVerdict: ${verdictLabel}`;

        const responseText = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ]);

        return res.json({ success: true, data: { hint: responseText } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

const chat = async (req, res) => {
    try {
        const { problemId, code, verdict, messages = [] } = req.body;
        const problem = await Problem.findById(problemId);

        if (!problem) {
            return res.status(404).json({ success: false, message: 'Problem not found' });
        }

        const verdictLabel = getVerdictLabel(verdict);
        const systemPrompt = `You are a competitive programming mentor helping a student who got ${verdictLabel}.
   Help them understand what went wrong and guide them toward the solution with hints and
   explanations. Do NOT write the full solution for them. Keep responses concise, use bullet
   points or numbered steps when explaining.`;
        const problemContext = `Problem: ${problem.name}\n\nMy code:\n${code}\n\nVerdict: ${verdictLabel}`;
        const conversation = messages.map((message) => ({
            role: message.role === 'ai' ? 'assistant' : 'user',
            content: message.text
        }));

        const responseText = await callGroq([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: problemContext },
            ...conversation
        ]);

        return res.json({ success: true, data: { reply: responseText } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { hint, chat };
