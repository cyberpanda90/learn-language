// api/chat.js
export default async function handler(req, res) {
	// Enable CORS
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

	if (req.method === 'OPTIONS') {
		res.status(200).end()
		return
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	// Check if API key exists
	if (!process.env.CLAUDE_API_KEY) {
		console.error('CLAUDE_API_KEY is not set')
		return res.status(500).json({ error: 'API key not configured' })
	}

	try {
		const { message, conversationHistory, userProfile } = req.body

		if (!message) {
			return res.status(400).json({ error: 'Message is required' })
		}

		console.log('Calling Claude API...')

		// Simple fallback response for now
		const fallbackResponse = {
			tutorResponse: userProfile?.englishOnlyMode
				? "I understand what you're saying. Let's continue our conversation!"
				: 'Rozumím, co říkáte. Pokračujme v naší konverzaci!',
			czechTranslation: userProfile?.englishOnlyMode
				? null
				: 'Rozumím, co říkáte. Pokračujme v naší konverzaci!',
			feedback: {
				positive: [
					userProfile?.englishOnlyMode
						? 'Good communication!'
						: 'Dobrá komunikace!',
				],
				corrections: [],
				suggestions: [
					userProfile?.englishOnlyMode
						? 'Keep practicing!'
						: 'Pokračujte v procvičování!',
				],
			},
			grammarAnalysis: {
				accuracy: 80,
				detectedLevel: userProfile?.proficiencyLevel || 'Beginner',
				strengths: [
					userProfile?.englishOnlyMode
						? 'Clear expression'
						: 'Jasné vyjadřování',
				],
				improvements: [
					userProfile?.englishOnlyMode
						? 'Keep going!'
						: 'Pokračujte!',
				],
			},
			vocabularyUsed: message
				.toLowerCase()
				.split(/\s+/)
				.filter((word) => word.length > 2)
				.slice(0, 5),
			progressNotes: userProfile?.englishOnlyMode
				? 'Making progress!'
				: 'Děláte pokroky!',
		}

		console.log('Sending fallback response')
		res.status(200).json(fallbackResponse)
	} catch (error) {
		console.error('API error:', error)
		res.status(500).json({
			error: 'Internal server error',
			details: error.message,
		})
	}
}
