import React, { useState, useEffect, useRef } from 'react'
import {
	Send,
	BookOpen,
	Target,
	TrendingUp,
	MessageSquare,
	CheckCircle,
	BarChart3,
	Languages,
	Brain,
} from 'lucide-react'

const TRANSLATIONS = {
	'en-US': {
		languageTutorTitle: 'Language Tutor',
		lessonMode: 'Lesson Mode',
		chatMode: 'Chat Mode',
		readyToPractice: 'Ready to practice',
		startConversationHelp:
			"Start a conversation and I'll help you learn with personalized feedback!",
		englishTranslation: 'English translation',
		tutorThinking: 'Tutor is thinking...',
		typeMessagePlaceholder: 'Type your message in',
		progressOverview: 'Progress Overview',
		messages: 'Messages:',
		vocabulary: 'Vocabulary:',
		words: 'words',
		accuracy: 'Accuracy:',
		learningGoals: 'Learning Goals',
		addGoal: '+ Add',
		progress: 'Progress',
		feedback: 'Feedback',
		greatJob: 'Great job!',
		smallCorrections: 'Small corrections:',
		tryThis: 'Try this:',
		learningStats: 'Learning Stats',
		vocabularyGrowth: 'Vocabulary Growth',
		grammarAccuracy: 'Grammar Accuracy',
		enterLearningGoal: 'Enter your learning goal:',
		sorryTroubleResponding:
			"I'm sorry, I'm having trouble responding right now. Let's continue practicing!",
		keepPracticing: "Let's keep practicing!",
		languageMode: 'Language mode:',
		onlyEnglish: 'English only',
		onlySwedish: 'Swedish only',
		onlyItalian: 'Italian only',
		withTranslations: 'With translations',
	},
	'cs-CZ': {
		languageTutorTitle: 'Jazykový Tutor',
		lessonMode: 'Režim Lekce',
		chatMode: 'Režim Konverzace',
		readyToPractice: 'Připraven/a procvičovat',
		startConversationHelp:
			'Začněte konverzaci a já vám pomohu se učit s personalizovanou zpětnou vazbou!',
		englishTranslation: 'Český překlad',
		tutorThinking: 'Tutor přemýšlí...',
		typeMessagePlaceholder: 'Napište zprávu v',
		progressOverview: 'Přehled Pokroku',
		messages: 'Zprávy:',
		vocabulary: 'Slovní zásoba:',
		words: 'slov',
		accuracy: 'Přesnost:',
		learningGoals: 'Výukové Cíle',
		addGoal: '+ Přidat',
		progress: 'Pokrok',
		feedback: 'Zpětná vazba',
		greatJob: 'Skvělá práce!',
		smallCorrections: 'Malé opravy:',
		tryThis: 'Zkuste toto:',
		learningStats: 'Statistiky Učení',
		vocabularyGrowth: 'Růst Slovní Zásoby',
		grammarAccuracy: 'Gramatická Přesnost',
		enterLearningGoal: 'Zadejte svůj výukový cíl:',
		sorryTroubleResponding:
			'Omlouvám se, mám potíže s odpovědí. Pokračujme v procvičování!',
		keepPracticing: 'Pokračujme v procvičování!',
		languageMode: 'Režim jazyka:',
		onlyEnglish: 'Pouze anglicky',
		onlySwedish: 'Pouze švédsky',
		onlyItalian: 'Pouze italsky',
		withTranslations: 'S překlady',
	},
}

const appLocale = 'cs-CZ'
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US'
const findMatchingLocale = (locale) => {
	if (TRANSLATIONS[locale]) return locale
	const lang = locale.split('-')[0]
	const match = Object.keys(TRANSLATIONS).find((key) =>
		key.startsWith(lang + '-')
	)
	return match || 'en-US'
}
const locale =
	appLocale !== '{{APP_LOCALE}}'
		? findMatchingLocale(appLocale)
		: findMatchingLocale(browserLocale)
const t = (key) =>
	TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key

const LanguageTutor = () => {
	const [selectedLanguage, setSelectedLanguage] = useState('english')
	const [messages, setMessages] = useState([])
	const [currentMessage, setCurrentMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	// ZMĚNA: targetLanguageOnlyMode je nyní vždy true (natrvalo zapnutý)
	const targetLanguageOnlyMode = true
	const [detailedAnalysis, setDetailedAnalysis] = useState(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [userProfile, setUserProfile] = useState({
		proficiencyLevel: 'Beginner',
		totalMessages: 0,
		vocabularyCount: new Set(),
		grammarAccuracy: 0,
		sessionCount: 0,
	})
	const [learningGoals, setLearningGoals] = useState([
		{
			id: 1,
			text: 'Master basic greetings',
			completed: false,
			progress: 20,
		},
		{
			id: 2,
			text: 'Learn present tense verbs',
			completed: false,
			progress: 10,
		},
		{
			id: 3,
			text: 'Expand food vocabulary',
			completed: false,
			progress: 0,
		},
	])
	const [feedback, setFeedback] = useState(null)
	const [showLessonMode, setShowLessonMode] = useState(false)
	const [translatedMessages, setTranslatedMessages] = useState(new Set())
	const [progressStats, setProgressStats] = useState({
		vocabularyGrowth: [20, 35, 50, 65, 78],
		grammarAccuracy: [60, 65, 70, 75, 80],
		conversationLength: [5, 8, 12, 15, 18],
	})
	const messagesEndRef = useRef(null)

	// Pouze 3 jazyky
	const languages = {
		english: { name: 'English', flag: '🇺🇸' },
		swedish: { name: 'Swedish (Svenska)', flag: '🇸🇪' },
		italian: { name: 'Italian (Italiano)', flag: '🇮🇹' },
	}

	// ZMĚNA: Funkce odstraněna, už se nepoužívá
	// const getTargetLanguageOnlyText = () => { ... }

	const analyzeLanguageProficiency = async (
		messageHistory,
		targetLanguage
	) => {
		if (messageHistory.length < 3) {
			return {
				level: 'Beginner',
				confidence: 0.9,
				reasoning: 'Insufficient conversation data',
				details: {
					grammarAccuracy: 70,
					vocabularyLevel: 'Basic',
					sentenceComplexity: 'Simple',
					languageConsistency: 'Good',
					strongPoints: ['Getting started'],
					improvementAreas: ['Continue practicing'],
					errorCount: 0,
					averageSentenceLength: 5,
				},
			}
		}

		const userMessages = messageHistory
			.filter((msg) => msg.sender === 'user')
			.map((msg) => ({ text: msg.text, timestamp: msg.timestamp }))

		if (userMessages.length < 2) {
			return {
				level: 'Beginner',
				confidence: 0.8,
				reasoning: 'Too few user messages to analyze',
				details: {
					grammarAccuracy: 70,
					vocabularyLevel: 'Basic',
					sentenceComplexity: 'Simple',
					languageConsistency: 'Good',
					strongPoints: ['Active participation'],
					improvementAreas: ['Continue practicing'],
					errorCount: 0,
					averageSentenceLength: 5,
				},
			}
		}

		const languageNames = {
			english: 'English',
			swedish: 'Swedish',
			italian: 'Italian',
		}

		const analysisPrompt = `
You are an expert language assessment specialist. Analyze the following conversation messages from a language learner and determine their proficiency level in ${
			languageNames[targetLanguage] || 'English'
		}.

User messages to analyze:
${userMessages.map((msg, i) => `${i + 1}. "${msg.text}"`).join('\n')}

Please analyze these aspects:
1. **Grammar Accuracy**: Correct use of tenses, sentence structure, word order
2. **Vocabulary Level**: Sophistication and variety of words used  
3. **Sentence Complexity**: Simple vs compound vs complex sentences
4. **Language Consistency**: Consistent use of the target language
5. **Fluency Indicators**: Natural flow, idiom usage, cultural understanding
6. **Error Patterns**: Types and frequency of mistakes

Based on your analysis, assign ONE of these levels:
- **Beginner**: Basic words, simple present tense, frequent errors, very short sentences
- **Intermediate**: Mix of tenses, longer sentences, some complex vocabulary, occasional errors  
- **Advanced**: Complex structures, sophisticated vocabulary, rare errors, natural expression
- **Native**: Perfect or near-perfect grammar, idioms, cultural references, effortless expression

Respond with a JSON object in this exact format:
{
  "level": "Beginner|Intermediate|Advanced|Native",
  "confidence": 0.85,
  "reasoning": "Detailed explanation of why you assigned this level",
  "details": {
    "grammarAccuracy": 85,
    "vocabularyLevel": "Intermediate", 
    "sentenceComplexity": "Complex",
    "languageConsistency": "Excellent",
    "strongPoints": ["Good use of past tense", "Varied vocabulary"],
    "improvementAreas": ["Article usage", "Conditional sentences"],
    "errorCount": 3,
    "averageSentenceLength": 8.5
  },
  "levelProgression": {
    "currentStage": "Early Intermediate",
    "nextMilestone": "Master subjunctive mood", 
    "estimatedProgress": "65%"
  }
}

Your response must be valid JSON only. No additional text.`

		try {
			const response = await fetch('/api/claude', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: analysisPrompt }),
			})

			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`)

			const result = await response.json()

			if (
				!result.level ||
				!['Beginner', 'Intermediate', 'Advanced', 'Native'].includes(
					result.level
				)
			) {
				console.warn('Invalid level from AI, using fallback')
				return getFallbackAnalysis(userMessages.length)
			}

			return {
				level: result.level,
				confidence: result.confidence || 0.8,
				reasoning: result.reasoning || 'AI analysis completed',
				details: {
					grammarAccuracy: result.details?.grammarAccuracy || 75,
					vocabularyLevel: result.details?.vocabularyLevel || 'Basic',
					sentenceComplexity:
						result.details?.sentenceComplexity || 'Simple',
					languageConsistency:
						result.details?.languageConsistency || 'Good',
					strongPoints: result.details?.strongPoints || [],
					improvementAreas: result.details?.improvementAreas || [],
					errorCount: result.details?.errorCount || 0,
					averageSentenceLength:
						result.details?.averageSentenceLength || 5,
				},
				levelProgression: result.levelProgression || {
					currentStage: result.level,
					nextMilestone: 'Continue practicing',
					estimatedProgress: '50%',
				},
			}
		} catch (error) {
			console.error('Error in AI proficiency analysis:', error)
			return getFallbackAnalysis(userMessages.length)
		}
	}

	const getFallbackAnalysis = (messageCount) => {
		let level = 'Beginner'
		if (messageCount >= 15) level = 'Intermediate'
		else if (messageCount >= 25) level = 'Advanced'

		return {
			level,
			confidence: 0.6,
			reasoning: 'Fallback analysis based on conversation length',
			details: {
				grammarAccuracy: 70,
				vocabularyLevel: 'Basic',
				sentenceComplexity: 'Simple',
				languageConsistency: 'Good',
				strongPoints: ['Active participation'],
				improvementAreas: ['Continue practicing'],
				errorCount: 2,
				averageSentenceLength: 6,
			},
		}
	}

	const sendMessage = async () => {
		if (!currentMessage.trim() || isLoading) return

		const userMessage = {
			id: Date.now(),
			text: currentMessage,
			sender: 'user',
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		setCurrentMessage('')
		setIsLoading(true)

		try {
			const conversationHistory = [...messages, userMessage]
			setIsAnalyzing(true)
			const proficiencyAnalysis = await analyzeLanguageProficiency(
				conversationHistory,
				selectedLanguage
			)
			const detectedLevel = proficiencyAnalysis.level
			setDetailedAnalysis(proficiencyAnalysis)
			setIsAnalyzing(false)
			const prompt = `
You are a friendly, encouraging language tutor helping someone learn ${
				languages[selectedLanguage].name
			}. The user interface is in Czech, but you should respond in the target language they're learning.

Conversation history: ${JSON.stringify(
				conversationHistory
					.slice(-5)
					.map((m) => ({ sender: m.sender, text: m.text }))
			)}

Current user message: "${currentMessage}"
User's proficiency level: ${detectedLevel}
Learning goals: ${learningGoals.map((g) => g.text).join(', ')}
Lesson mode: ${showLessonMode}
Target language only mode: ${targetLanguageOnlyMode}

Important instructions:
- Respond ONLY in ${
				languages[selectedLanguage].name
			} (the language they're learning)
- Be encouraging and supportive
- ${
				showLessonMode
					? 'Focus on teaching specific grammar or vocabulary since lesson mode is ON.'
					: 'Keep the conversation natural and flowing since chat mode is ON.'
			}
- Ask engaging questions to continue the conversation
- Provide gentle corrections when needed

Respond with a JSON object in this exact format:
{
  "tutorResponse": "Your encouraging response in ${
		languages[selectedLanguage].name
  }. ${
				showLessonMode
					? 'Focus on teaching specific grammar or vocabulary.'
					: 'Keep the conversation natural and flowing.'
			}",
  "englishTranslation": "The exact same response translated to Czech for the user interface",
  "feedback": {
    "positive": ["Positive aspects of their language use"],
    "corrections": ["Gentle corrections if needed"],
    "suggestions": ["Helpful suggestions for improvement"]
  },
  "grammarAnalysis": {
    "accuracy": 85,
    "detectedLevel": "${detectedLevel}",
    "strengths": ["Areas they did well"],
    "improvements": ["Areas to work on"]
  },
  "vocabularyUsed": ["words", "they", "used"],
  "progressNotes": "Brief encouraging note about their progress"
}

Your entire response MUST be valid JSON only. DO NOT include any text outside the JSON structure.`

			// NOVÉ: Volání Vercel API místo window.claude.complete
			const response = await fetch('/api/claude', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ prompt }),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const parsedResponse = await response.json()

			const tutorMessage = {
				id: Date.now() + 1,
				text: parsedResponse.tutorResponse,
				englishTranslation: parsedResponse.englishTranslation,
				sender: 'tutor',
				timestamp: new Date(),
			}

			setMessages((prev) => [...prev, tutorMessage])
			setFeedback(parsedResponse.feedback)

			// Update user profile
			setUserProfile((prev) => ({
				...prev,
				totalMessages: prev.totalMessages + 1,
				proficiencyLevel: parsedResponse.grammarAnalysis.detectedLevel,
				grammarAccuracy: parsedResponse.grammarAnalysis.accuracy,
				vocabularyCount: new Set([
					...prev.vocabularyCount,
					...parsedResponse.vocabularyUsed,
				]),
			}))

			// Update progress stats
			if (userProfile.totalMessages % 5 === 0) {
				setProgressStats((prev) => ({
					vocabularyGrowth: [
						...prev.vocabularyGrowth,
						userProfile.vocabularyCount.size,
					],
					grammarAccuracy: [
						...prev.grammarAccuracy,
						parsedResponse.grammarAnalysis.accuracy,
					],
					conversationLength: [
						...prev.conversationLength,
						conversationHistory.length,
					],
				}))
			}
		} catch (error) {
			console.error('Error getting tutor response:', error)
			const errorMessage = {
				id: Date.now() + 1,
				text: t('sorryTroubleResponding'),
				sender: 'tutor',
				timestamp: new Date(),
			}
			setMessages((prev) => [...prev, errorMessage])
		} finally {
			setIsLoading(false)
		}
	}

	const handleLanguageChange = (newLang) => {
		setSelectedLanguage(newLang)
		setMessages([])
		setFeedback(null)
		setTranslatedMessages(new Set())
		const newGoals = generateLearningGoals(
			userProfile.proficiencyLevel,
			newLang
		)
		setLearningGoals(newGoals)
	}

	const toggleGoalCompletion = (goalId) => {
		setLearningGoals((prev) =>
			prev.map((goal) =>
				goal.id === goalId
					? {
							...goal,
							completed: !goal.completed,
							progress: goal.completed ? goal.progress : 100,
					  }
					: goal
			)
		)
	}

	const toggleMessageTranslation = (messageId) => {
		setTranslatedMessages((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(messageId)) {
				newSet.delete(messageId)
			} else {
				newSet.add(messageId)
			}
			return newSet
		})
	}

	const addCustomGoal = () => {
		const goalText = prompt(t('enterLearningGoal'))
		if (goalText?.trim()) {
			const newGoal = {
				id: Date.now(),
				text: goalText.trim(),
				completed: false,
				progress: 0,
			}
			setLearningGoals((prev) => [...prev, newGoal])
		}
	}

	const generateLearningGoals = (level, language) => {
		const goalsByLevel = {
			Beginner: {
				english: [
					'Master basic greetings and introductions',
					'Learn present tense regular verbs',
					'Build everyday vocabulary',
					'Practice numbers 1-100',
					'Use basic question words (what, how, where)',
				],
				swedish: [
					'Master basic greetings (hej, hå)',
					'Learn present tense verbs',
					'Build family and home vocabulary',
					'Practice Swedish pronunciation',
					'Use basic question words',
				],
				italian: [
					'Master basic greetings (ciao, buongiorno)',
					'Learn present tense essere and avere',
					'Build food and family vocabulary',
					'Practice Italian pronunciation',
					'Learn basic sentence structure',
				],
			},
			Intermediate: {
				english: [
					'Master past tenses',
					'Learn conditional mood',
					'Expand professional vocabulary',
					'Practice complex sentence structures',
					'Understand cultural expressions',
				],
				swedish: [
					'Master past tenses (preteritum and perfekt)',
					'Learn Swedish word order',
					'Expand professional vocabulary',
					'Practice complex sentence structures',
					'Understand Swedish culture',
				],
				italian: [
					'Master past tenses (passato prossimo and imperfetto)',
					'Learn subjunctive mood basics',
					'Expand professional vocabulary',
					'Practice complex sentence structures',
					'Understand Italian culture',
				],
			},
			Advanced: {
				english: [
					'Master all verb tenses',
					'Learn advanced conditional sentences',
					'Expand idiomatic expressions',
					'Practice nuanced conversation skills',
					'Understand cultural references',
				],
				swedish: [
					'Master all verb tenses (inklusive futurum och konjunktiv)',
					'Learn advanced Swedish syntax',
					'Expand idiomatic expressions',
					'Practice nuanced conversation skills',
					'Understand Swedish cultural references',
				],
				italian: [
					'Master all verb tenses (inklusive futuro anteriore och congiuntivo)',
					'Learn advanced Italian syntax',
					'Expand idiomatic expressions',
					'Practice nuanced conversation skills',
					'Understand Italian cultural references',
				],
			},
			Native: {
				english: [
					'Maintain fluency in all tenses',
					'Use idiomatic expressions naturally',
					'Engage in complex discussions',
					'Understand cultural nuances deeply',
					'Teach others about the language',
				],
				swedish: [
					'Maintain fluency in all tenses (inklusive futurum och konjunktiv)',
					'Use idiomatic expressions naturally',
					'Engage in complex discussions',
					'Understand cultural nuances deeply',
					'Teach others about the language',
				],
				italian: [
					'Maintain fluency in all tenses (inklusive futuro anteriore och congiuntivo)',
					'Use idiomatic expressions naturally',
					'Engage in complex discussions',
					'Understand cultural nuances deeply',
					'Teach others about the language',
				],
			},
		}

		const goals =
			goalsByLevel[level]?.[language] || goalsByLevel.Beginner.english
		return goals.slice(0, 3).map((text, index) => ({
			id: Date.now() + index,
			text,
			completed: false,
			progress: Math.floor(Math.random() * 30),
		}))
	}

	const getProficiencyColor = (level) => {
		const colors = {
			Beginner: 'bg-green-100 text-green-700',
			Intermediate: 'bg-blue-100 text-blue-700',
			Advanced: 'bg-purple-100 text-purple-700',
			Native: 'bg-gold-100 text-gold-700',
		}
		return colors[level] || colors.Beginner
	}

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<div className="bg-white border-b border-gray-200 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<BookOpen className="h-6 w-6 text-blue-600" />
								<h1 className="text-xl font-bold text-gray-800">
									{t('languageTutorTitle')}
								</h1>
							</div>

							<select
								value={selectedLanguage}
								onChange={(e) =>
									handleLanguageChange(e.target.value)
								}
								className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							>
								{Object.entries(languages).map(
									([code, lang]) => (
										<option key={code} value={code}>
											{lang.flag} {lang.name}
										</option>
									)
								)}
							</select>

							<div
								className={`px-3 py-1 rounded-full text-sm font-medium ${getProficiencyColor(
									userProfile.proficiencyLevel
								)}`}
							>
								{userProfile.proficiencyLevel}
							</div>
						</div>

						<div className="flex items-center space-x-2">
							<button
								onClick={() =>
									setShowLessonMode(!showLessonMode)
								}
								className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
									showLessonMode
										? 'bg-blue-600 text-white'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								{showLessonMode
									? t('lessonMode')
									: t('chatMode')}
							</button>
						</div>
					</div>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.length === 0 && (
						<div className="text-center py-8">
							<div className="text-4xl mb-4">
								{languages[selectedLanguage].flag}
							</div>
							<h2 className="text-xl font-semibold text-gray-700 mb-2">
								{t('readyToPractice')}{' '}
								{languages[selectedLanguage].name}?
							</h2>
							<p className="text-gray-500">
								{t('startConversationHelp')}
							</p>
						</div>
					)}

					{messages.map((message) => (
						<div
							key={message.id}
							className={`flex ${
								message.sender === 'user'
									? 'justify-end'
									: 'justify-start'
							}`}
						>
							<div
								className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
									message.sender === 'user'
										? 'bg-blue-600 text-white'
										: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors'
								} ${
									message.sender === 'tutor' &&
									!targetLanguageOnlyMode
										? 'cursor-pointer'
										: ''
								}`}
								onClick={
									message.sender === 'tutor' &&
									!targetLanguageOnlyMode
										? () =>
												toggleMessageTranslation(
													message.id
												)
										: undefined
								}
							>
								{message.sender === 'tutor' &&
									!targetLanguageOnlyMode && (
										<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
											<Languages className="h-3 w-3 text-gray-400" />
										</div>
									)}
								<p className="pr-4">
									{message.sender === 'tutor' &&
									translatedMessages.has(message.id) &&
									!targetLanguageOnlyMode
										? message.englishTranslation ||
										  message.text
										: message.text}
								</p>
								{message.sender === 'tutor' &&
									translatedMessages.has(message.id) &&
									!targetLanguageOnlyMode && (
										<p className="text-xs mt-1 text-gray-500 italic">
											{t('englishTranslation')}
										</p>
									)}
								<p
									className={`text-xs mt-1 ${
										message.sender === 'user'
											? 'text-blue-100'
											: 'text-gray-500'
									}`}
								>
									{message.timestamp.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</p>
							</div>
						</div>
					))}

					{isLoading && (
						<div className="flex justify-start">
							<div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
								<div className="flex items-center space-x-2">
									<div className="flex space-x-1">
										<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: '0.1s' }}
										></div>
										<div
											className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
											style={{ animationDelay: '0.2s' }}
										></div>
									</div>
									<span className="text-sm text-gray-500">
										{t('tutorThinking')}
									</span>
								</div>
							</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Input Area */}
				<div className="bg-white border-t border-gray-200 p-4">
					<div className="flex space-x-2">
						<input
							type="text"
							value={currentMessage}
							onChange={(e) => setCurrentMessage(e.target.value)}
							onKeyPress={(e) =>
								e.key === 'Enter' && sendMessage()
							}
							placeholder={`${t('typeMessagePlaceholder')} ${
								languages[selectedLanguage].name
							}...`}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							disabled={isLoading}
						/>
						<button
							onClick={sendMessage}
							disabled={isLoading || !currentMessage.trim()}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							<Send className="h-5 w-5" />
						</button>
					</div>
				</div>
			</div>

			{/* Sidebar */}
			<div className="w-80 bg-white border-l border-gray-200 flex flex-col">
				{/* Progress Overview */}
				<div className="p-4 border-b border-gray-200">
					<h3 className="font-semibold text-gray-800 mb-3 flex items-center">
						<TrendingUp className="h-5 w-5 mr-2" />
						{t('progressOverview')}
					</h3>
					<div className="space-y-2">
						<div className="flex justify-between text-sm">
							<span>{t('messages')}</span>
							<span className="font-medium">
								{userProfile.totalMessages}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>{t('vocabulary')}</span>
							<span className="font-medium">
								{userProfile.vocabularyCount.size} {t('words')}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span>{t('accuracy')}</span>
							<span className="font-medium">
								{userProfile.grammarAccuracy}%
							</span>
						</div>
					</div>
				</div>

				{/* Learning Goals */}
				<div className="p-4 border-b border-gray-200">
					<div className="flex items-center justify-between mb-3">
						<h3 className="font-semibold text-gray-800 flex items-center">
							<Target className="h-5 w-5 mr-2" />
							{t('learningGoals')}
						</h3>
						<button
							onClick={addCustomGoal}
							className="text-blue-600 hover:text-blue-700 text-sm font-medium"
						>
							{t('addGoal')}
						</button>
					</div>
					<div className="space-y-2">
						{learningGoals.map((goal) => (
							<div
								key={goal.id}
								className="p-2 bg-gray-50 rounded-md"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<p
											className={`text-sm ${
												goal.completed
													? 'line-through text-gray-500'
													: 'text-gray-700'
											}`}
										>
											{goal.text}
										</p>
										<div className="mt-1">
											<div className="flex items-center justify-between text-xs text-gray-500 mb-1">
												<span>{t('progress')}</span>
												<span>{goal.progress}%</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all duration-300"
													style={{
														width: `${goal.progress}%`,
													}}
												></div>
											</div>
										</div>
									</div>
									<button
										onClick={() =>
											toggleGoalCompletion(goal.id)
										}
										className="ml-2 mt-1"
									>
										{goal.completed ? (
											<CheckCircle className="h-4 w-4 text-green-600" />
										) : (
											<div className="h-4 w-4 border-2 border-gray-300 rounded-full"></div>
										)}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Real-time Feedback */}
				{feedback && (
					<div className="p-4 border-b border-gray-200">
						<h3 className="font-semibold text-gray-800 mb-3 flex items-center">
							<MessageSquare className="h-5 w-5 mr-2" />
							{t('feedback')}
						</h3>
						{feedback.positive.length > 0 && (
							<div className="mb-2">
								<p className="text-xs font-medium text-green-600 mb-1">
									{t('greatJob')}
								</p>
								{feedback.positive.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-green-700 bg-green-50 p-2 rounded"
									>
										{item}
									</p>
								))}
							</div>
						)}
						{feedback.corrections.length > 0 && (
							<div className="mb-2">
								<p className="text-xs font-medium text-orange-600 mb-1">
									{t('smallCorrections')}
								</p>
								{feedback.corrections.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-orange-700 bg-orange-50 p-2 rounded"
									>
										{item}
									</p>
								))}
							</div>
						)}
						{feedback.suggestions.length > 0 && (
							<div>
								<p className="text-xs font-medium text-blue-600 mb-1">
									{t('tryThis')}
								</p>
								{feedback.suggestions.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-blue-700 bg-blue-50 p-2 rounded"
									>
										{item}
									</p>
								))}
							</div>
						)}
					</div>
				)}

				{detailedAnalysis && (
					<div className="p-4 border-b border-gray-200">
						<h3 className="font-semibold text-gray-800 mb-3 flex items-center">
							<Brain className="h-5 w-5 mr-2" />
							AI Language Analysis
						</h3>

						<div className="space-y-3">
							{/* Level with confidence */}
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">
									Current Level:
								</span>
								<div className="flex items-center space-x-2">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(
											detailedAnalysis.level
										)}`}
									>
										{detailedAnalysis.level}
									</span>
									<span className="text-xs text-gray-500">
										(
										{Math.round(
											detailedAnalysis.confidence * 100
										)}
										% confidence)
									</span>
								</div>
							</div>

							{/* Grammar accuracy */}
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Grammar Accuracy:
								</span>
								<span className="font-medium">
									{detailedAnalysis.details.grammarAccuracy}%
								</span>
							</div>

							{/* Vocabulary level */}
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Vocabulary Level:
								</span>
								<span className="font-medium">
									{detailedAnalysis.details.vocabularyLevel}
								</span>
							</div>

							{/* Sentence complexity */}
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									Sentence Complexity:
								</span>
								<span className="font-medium">
									{
										detailedAnalysis.details
											.sentenceComplexity
									}
								</span>
							</div>

							{/* Strong points */}
							{detailedAnalysis.details.strongPoints?.length >
								0 && (
								<div className="mt-3">
									<p className="text-sm font-medium text-green-700 mb-1">
										Strong Points:
									</p>
									<ul className="text-xs text-green-600 space-y-1">
										{detailedAnalysis.details.strongPoints.map(
											(point, index) => (
												<li key={index}>• {point}</li>
											)
										)}
									</ul>
								</div>
							)}

							{/* Improvement areas */}
							{detailedAnalysis.details.improvementAreas?.length >
								0 && (
								<div className="mt-3">
									<p className="text-sm font-medium text-blue-700 mb-1">
										Focus Areas:
									</p>
									<ul className="text-xs text-blue-600 space-y-1">
										{detailedAnalysis.details.improvementAreas.map(
											(area, index) => (
												<li key={index}>• {area}</li>
											)
										)}
									</ul>
								</div>
							)}

							{/* Analysis reasoning - collapsible */}
							<details className="mt-3">
								<summary className="text-sm font-medium text-gray-700 cursor-pointer">
									Analysis Details
								</summary>
								<p className="text-xs text-gray-600 mt-2 leading-relaxed">
									{detailedAnalysis.reasoning}
								</p>
							</details>
						</div>
					</div>
				)}

				{/* Loading indicator during analysis */}
				{isAnalyzing && (
					<div className="p-4 border-b border-gray-200">
						<div className="flex items-center space-x-2">
							<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
							<span className="text-sm text-gray-600">
								Analyzing your language level...
							</span>
						</div>
					</div>
				)}

				{/* Quick Stats */}
				<div className="flex-1 p-4">
					<h3 className="font-semibold text-gray-800 mb-3 flex items-center">
						<BarChart3 className="h-5 w-5 mr-2" />
						{t('learningStats')}
					</h3>
					<div className="space-y-3">
						<div>
							<p className="text-sm text-gray-600 mb-1">
								{t('vocabularyGrowth')}
							</p>
							<div className="flex items-end space-x-1 h-8">
								{progressStats.vocabularyGrowth
									.slice(-5)
									.map((value, idx) => (
										<div
											key={idx}
											className="bg-blue-600 rounded-t"
											style={{
												height: `${
													(value / 100) * 100
												}%`,
												width: '20%',
											}}
										></div>
									))}
							</div>
						</div>
						<div>
							<p className="text-sm text-gray-600 mb-1">
								{t('grammarAccuracy')}
							</p>
							<div className="flex items-end space-x-1 h-8">
								{progressStats.grammarAccuracy
									.slice(-5)
									.map((value, idx) => (
										<div
											key={idx}
											className="bg-green-600 rounded-t"
											style={{
												height: `${value}%`,
												width: '20%',
											}}
										></div>
									))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default LanguageTutor
