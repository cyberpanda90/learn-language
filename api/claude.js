// api/claude.js
export default async function handler(req, res) {
	// Povolit pouze POST požadavky
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { prompt } = req.body

		if (!prompt) {
			return res.status(400).json({ error: 'Prompt is required' })
		}

		// Volání Claude API
		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': process.env.CLAUDE_API_KEY,
				'anthropic-version': '2023-06-01',
			},
			body: JSON.stringify({
				model: 'claude-3-sonnet-20240229',
				max_tokens: 1000,
				messages: [
					{
						role: 'user',
						content: prompt,
					},
				],
			}),
		})

		if (!response.ok) {
			throw new Error(`Claude API error: ${response.status}`)
		}

		const data = await response.json()

		// Claude API vrací text v jiném formátu než váš kód očekává
		// Takže buď upravte odpověď nebo použijte mock data
		const claudeText = data.content[0].text

		// Pokusíme se parsovat jako JSON, pokud ne, vrátíme mock data
		let parsedResponse
		try {
			parsedResponse = JSON.parse(claudeText)
		} catch (parseError) {
			// Fallback na mock data pokud Claude nevrátí validní JSON
			parsedResponse = {
				tutorResponse: claudeText,
				englishTranslation: 'Překlad bude k dispozici brzy',
				feedback: {
					positive: ['Pokračujte v dobré práci!'],
					corrections: [],
					suggestions: ['Zkuste používat více slovíček'],
				},
				grammarAnalysis: {
					accuracy: 85,
					detectedLevel: 'Beginner',
					strengths: ['Správná interpunkce'],
					improvements: ['Slovní zásoba'],
				},
				vocabularyUsed: ['slovo', 'příklad'],
				progressNotes: 'Pokračujte v učení!',
			}
		}

		return res.status(200).json(parsedResponse)
	} catch (error) {
		console.error('Claude API error:', error)
		return res.status(500).json({
			error: 'Internal server error',
			message: error.message,
		})
	}
}
