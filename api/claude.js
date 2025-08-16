// api/claude.js - Opravená verze pro Claude API
export default async function handler(req, res) {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' })
	}

	try {
		const { prompt } = req.body

		if (!prompt) {
			return res.status(400).json({ error: 'Prompt is required' })
		}

		if (!process.env.CLAUDE_API_KEY) {
			return res
				.status(500)
				.json({ error: 'Claude API key not configured' })
		}

		console.log('Calling Claude API...')

		// Opravený formát pro Claude API
		const requestBody = {
			model: 'claude-3-haiku-20240307',
			max_tokens: 1500,
			messages: [
				{
					role: 'user',
					content: prompt,
				},
			],
		}

		console.log('Request body:', JSON.stringify(requestBody, null, 2))

		const response = await fetch('https://api.anthropic.com/v1/messages', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': process.env.CLAUDE_API_KEY,
				'anthropic-version': '2023-06-01',
			},
			body: JSON.stringify(requestBody),
		})

		const responseText = await response.text()
		console.log('Claude API status:', response.status)
		console.log('Claude API response:', responseText)

		if (!response.ok) {
			console.error('Claude API error:', {
				status: response.status,
				statusText: response.statusText,
				body: responseText,
			})
			return res.status(500).json({
				error: 'Claude API error',
				status: response.status,
				details: responseText,
			})
		}

		const data = JSON.parse(responseText)

		if (!data.content || !data.content[0] || !data.content[0].text) {
			console.error('Unexpected response format:', data)
			return res
				.status(500)
				.json({ error: 'Unexpected response format from Claude API' })
		}

		const claudeText = data.content[0].text
		console.log('Claude response text:', claudeText)

		// Pokusíme se parsovat jako JSON
		let parsedResponse
		try {
			parsedResponse = JSON.parse(claudeText)

			// Ověření že obsahuje všechny potřebné klíče
			if (!parsedResponse.tutorResponse) {
				throw new Error('Missing tutorResponse in Claude response')
			}
		} catch (parseError) {
			console.error(
				'Failed to parse Claude response as JSON:',
				parseError
			)
			console.error('Claude text was:', claudeText)

			// Pokud Claude nevrátil JSON, vytvoříme strukturovanou odpověď
			parsedResponse = {
				tutorResponse: claudeText.trim(),
				englishTranslation: 'Odpověď od AI tutora',
				feedback: {
					positive: ['Pokračujte v konverzaci!'],
					corrections: [],
					suggestions: ['Zkuste být konkrétnější'],
				},
				grammarAnalysis: {
					accuracy: 85,
					detectedLevel: 'Beginner',
					strengths: ['Aktivní účast'],
					improvements: ['Rozšíření slovní zásoby'],
				},
				vocabularyUsed: ['hi'],
				progressNotes: 'Pokračujte v učení!',
			}
		}

		return res.status(200).json(parsedResponse)
	} catch (error) {
		console.error('API handler error:', error)
		return res.status(500).json({
			error: 'Internal server error',
			message: error.message,
			stack:
				process.env.NODE_ENV === 'development'
					? error.stack
					: undefined,
		})
	}
}
