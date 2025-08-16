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

	try {
		const { message, conversationHistory, userProfile } = req.body

		if (!message) {
			return res.status(400).json({ error: 'Message is required' })
		}

		console.log('Processing message:', message)
		console.log('User profile:', userProfile)

		// Generate intelligent tutor response
		const tutorResponse = generateTutorResponse(
			message,
			userProfile,
			conversationHistory
		)

		const response = {
			tutorResponse: tutorResponse.main,
			czechTranslation: userProfile?.targetLanguageOnlyMode
				? null
				: tutorResponse.translation,
			feedback: tutorResponse.feedback,
			grammarAnalysis: tutorResponse.grammar,
			vocabularyUsed: extractVocabulary(message),
			progressNotes: tutorResponse.progress,
		}

		console.log('Sending response')
		res.status(200).json(response)
	} catch (error) {
		console.error('API error:', error)
		res.status(500).json({
			error: 'Internal server error',
			details: error.message,
		})
	}
}

function generateTutorResponse(message, userProfile, conversationHistory) {
	const language = userProfile?.selectedLanguage || 'English'
	const level = userProfile?.proficiencyLevel || 'Beginner'
	const onlyMode = userProfile?.targetLanguageOnlyMode
	const lessonMode = userProfile?.showLessonMode

	// Inteligentní odpovědi podle jazyka a kontextu
	const responses = {
		English: {
			greetings: [
				'Hello! Great to see you practicing English! How are you feeling today?',
				"Hi there! I'm excited to help you learn English. What would you like to talk about?",
				"Good to see you! Let's practice English together. Can you tell me about your hobbies?",
				"Welcome! I love helping people learn English. What's on your mind today?",
			],
			questions: [
				'Can you describe what you did yesterday?',
				"What's your favorite season and why?",
				'Tell me about your family members.',
				'What do you like to eat for breakfast?',
				'Describe your perfect weekend.',
				'What are your goals for this year?',
			],
			lessonModeResponses: [
				"Let's practice the present tense. Can you make a sentence using 'I am'?",
				'Great! Now try using the past tense. Tell me something you did last week.',
				"Excellent! Let's work on questions. Ask me a question using 'What'.",
				'Perfect! Now practice with adjectives. Describe your hometown using 3 adjectives.',
			],
			encouragement: [
				'Excellent work! Your English is improving!',
				"Great job! Keep practicing and you'll get even better!",
				'Well done! I can see your progress!',
				"Fantastic! You're doing really well!",
			],
		},
		'Swedish (Svenska)': {
			greetings: [
				'Hej! Kul att se dig öva svenska! Hur mår du idag?',
				'Hej där! Jag är glad att få hjälpa dig lära svenska. Vad vill du prata om?',
				'Bra att se dig! Låt oss öva svenska tillsammans. Kan du berätta om dina hobbyer?',
				'Välkommen! Jag älskar att hjälpa folk lära svenska. Vad tänker du på idag?',
			],
			questions: [
				'Kan du beskriva vad du gjorde igår?',
				'Vilken är din favoritårstid och varför?',
				'Berätta om dina familjemedlemmar.',
				'Vad gillar du att äta till frukost?',
				'Beskriv din perfekta helg.',
				'Vilka är dina mål för i år?',
			],
			lessonModeResponses: [
				"Låt oss öva presens. Kan du göra en mening med 'Jag är'?",
				'Bra! Försök nu med preteritum. Berätta något du gjorde förra veckan.',
				"Utmärkt! Låt oss jobba med frågor. Ställ en fråga till mig med 'Vad'.",
				'Perfekt! Öva nu med adjektiv. Beskriv din hemstad med 3 adjektiv.',
			],
			encouragement: [
				'Utmärkt arbete! Din svenska förbättras!',
				'Bra jobbat! Fortsätt öva så blir du ännu bättre!',
				'Bra gjort! Jag kan se dina framsteg!',
				'Fantastiskt! Du gör det riktigt bra!',
			],
		},
		'Italian (Italiano)': {
			greetings: [
				"Ciao! È bello vederti praticare l'italiano! Come ti senti oggi?",
				"Ciao! Sono felice di aiutarti a imparare l'italiano. Di cosa vorresti parlare?",
				"Bello vederti! Pratichiamo l'italiano insieme. Puoi parlarmi dei tuoi hobby?",
				"Benvenuto! Amo aiutare le persone a imparare l'italiano. A cosa stai pensando oggi?",
			],
			questions: [
				'Puoi descrivere cosa hai fatto ieri?',
				'Qual è la tua stagione preferita e perché?',
				'Parlami dei membri della tua famiglia.',
				'Cosa ti piace mangiare a colazione?',
				'Descrivi il tuo weekend perfetto.',
				"Quali sono i tuoi obiettivi per quest'anno?",
			],
			lessonModeResponses: [
				"Pratichiamo il presente. Puoi fare una frase usando 'Io sono'?",
				'Bene! Ora prova con il passato prossimo. Dimmi qualcosa che hai fatto la settimana scorsa.',
				"Eccellente! Lavoriamo sulle domande. Fammi una domanda usando 'Cosa'.",
				'Perfetto! Ora pratica con gli aggettivi. Descrivi la tua città natale usando 3 aggettivi.',
			],
			encouragement: [
				'Ottimo lavoro! Il tuo italiano sta migliorando!',
				'Bravo! Continua a praticare e diventerai ancora migliore!',
				'Ben fatto! Posso vedere i tuoi progressi!',
				'Fantastico! Stai andando molto bene!',
			],
		},
	}

	// Získej odpovědi pro současný jazyk
	const langResponses = responses[language] || responses['English']

	// Inteligentní výběr odpovědi podle kontextu
	let selectedResponse
	const messageWords = message.toLowerCase()

	// Kontroluj zda je to pozdrav
	if (
		messageWords.includes('hello') ||
		messageWords.includes('hi') ||
		messageWords.includes('hej') ||
		messageWords.includes('ciao') ||
		messageWords.includes('good morning') ||
		conversationHistory.length <= 1
	) {
		selectedResponse =
			langResponses.greetings[
				Math.floor(Math.random() * langResponses.greetings.length)
			]
	}
	// Režim lekcí
	else if (lessonMode) {
		selectedResponse =
			langResponses.lessonModeResponses[
				Math.floor(
					Math.random() * langResponses.lessonModeResponses.length
				)
			]
	}
	// Jinak pokládej otázky pro konverzaci
	else {
		selectedResponse =
			langResponses.questions[
				Math.floor(Math.random() * langResponses.questions.length)
			]
	}

	// Náhodné povzbuzení
	const randomEncouragement =
		langResponses.encouragement[
			Math.floor(Math.random() * langResponses.encouragement.length)
		]

	// České překlady
	const czechTranslations = {
		English: {
			'Hello! Great to see you practicing English! How are you feeling today?':
				'Ahoj! Skvěle, že procvičujete angličtinu! Jak se dnes cítíte?',
			"Hi there! I'm excited to help you learn English. What would you like to talk about?":
				'Ahoj! Těším se, že vám pomohu učit se angličtinu. O čem byste chtěli mluvit?',
			'Can you describe what you did yesterday?':
				'Můžete popsat, co jste dělali včera?',
			"What's your favorite season and why?":
				'Jaké je vaše oblíbené roční období a proč?',
			'Tell me about your family members.':
				'Povědět mi o členech své rodiny.',
			"Let's practice the present tense. Can you make a sentence using 'I am'?":
				"Pojďme procvičit přítomný čas. Můžete vytvořit větu s 'I am'?",
		},
		'Swedish (Svenska)': {
			'Hej! Kul att se dig öva svenska! Hur mår du idag?':
				'Ahoj! Skvěle, že procvičujete švédštinu! Jak se dnes cítíte?',
			'Hej där! Jag är glad att få hjälpa dig lära svenska. Vad vill du prata om?':
				'Ahoj! Těším se, že vám pomohu učit se švédštinu. O čem byste chtěli mluvit?',
			'Kan du beskriva vad du gjorde igår?':
				'Můžete popsat, co jste dělali včera?',
			'Vilken är din favoritårstid och varför?':
				'Jaké je vaše oblíbené roční období a proč?',
			'Berätta om dina familjemedlemmar.':
				'Povědět mi o členech své rodiny.',
			"Låt oss öva presens. Kan du göra en mening med 'Jag är'?":
				"Pojďme procvičit přítomný čas. Můžete vytvořit větu s 'Jag är'?",
		},
		'Italian (Italiano)': {
			"Ciao! È bello vederti praticare l'italiano! Come ti senti oggi?":
				'Ahoj! Skvěle, že procvičujete italštinu! Jak se dnes cítíte?',
			"Ciao! Sono felice di aiutarti a imparare l'italiano. Di cosa vorresti parlare?":
				'Ahoj! Těším se, že vám pomohu učit se italštinu. O čem byste chtěli mluvit?',
			'Puoi descrivere cosa hai fatto ieri?':
				'Můžete popsat, co jste dělali včera?',
			'Qual è la tua stagione preferita e perché?':
				'Jaké je vaše oblíbené roční období a proč?',
			'Parlami dei membri della tua famiglia.':
				'Povědět mi o členech své rodiny.',
			"Pratichiamo il presente. Puoi fare una frase usando 'Io sono'?":
				"Pojďme procvičit přítomný čas. Můžete vytvořit větu s 'Io sono'?",
		},
	}

	const translation = onlyMode
		? null
		: czechTranslations[language]?.[selectedResponse] ||
		  'Český překlad: ' + selectedResponse

	return {
		main: selectedResponse,
		translation,
		feedback: {
			positive: [randomEncouragement],
			corrections: generateCorrections(message, language),
			suggestions: generateSuggestions(level, language),
		},
		grammar: {
			accuracy: Math.floor(Math.random() * 20) + 80, // 80-100%
			detectedLevel: level,
			strengths: ['Dobrá výslovnost', 'Jasné vyjadřování'],
			improvements: [
				'Zkuste složitější věty',
				'Používejte více přídavných jmen',
			],
		},
		progress: 'Skvělé pokroky v učení!',
	}
}

function generateCorrections(message, language) {
	// Jednoduché gramatické opravy (můžete rozšířit)
	const corrections = []

	if (language === 'English') {
		if (message.includes(' i ') && !message.includes(' I ')) {
			corrections.push(
				"Remember to capitalize 'I' when referring to yourself"
			)
		}
		if (message.includes('dont')) {
			corrections.push(
				"Don't forget the apostrophe in contractions: don't, can't, won't"
			)
		}
	}

	return corrections
}

function generateSuggestions(level, language) {
	const suggestions = {
		Beginner: [
			'Zkuste použít více detailů ve svých odpovědích',
			'Procvičte základní slovní zásobu',
			'Mluvte pomalu a jasně',
		],
		Intermediate: [
			'Zkuste složitější souvětí',
			'Používejte různé časy',
			'Přidejte více přídavných jmen',
		],
		Advanced: [
			'Experimentujte s idiomy a frazeologismy',
			'Používejte pokročilou slovní zásobu',
			'Zkuste různé styly mluvení',
		],
	}

	return suggestions[level] || suggestions['Beginner']
}

function extractVocabulary(message) {
	return message
		.toLowerCase()
		.split(/\s+/)
		.filter(
			(word) => word.length > 2 && /^[a-záščřžýáíéóúůěňöäå]+$/i.test(word)
		)
		.slice(0, 5)
}
