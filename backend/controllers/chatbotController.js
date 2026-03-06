const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an IT support assistant for a helpdesk system. 
A user has this IT problem: "${message}"

Reply with:
- Max 3-4 SHORT bullet points
- Simple plain English, no technical jargon
- Each point max 1 sentence
- End with: "Still not fixed? Create a support ticket."

Do NOT use markdown bold or headers. Just plain bullet points with a dash.`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text();

    res.status(200).json({ reply: text });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ reply: 'Sorry, I am having trouble right now. Please create a support ticket.' });
  }
};