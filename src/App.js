import { useState, useEffect, useRef } from 'react'
import {
	Send,
	Target,
	TrendingUp,
	MessageSquare,
	CheckCircle,
	Brain,
	MessageCircle,
	Calendar,
	Settings,
	Search,
	BookOpen,
	Pencil,
	Headphones,
} from 'lucide-react'

import cityImage from './assets/city.png'
import nyImage from './assets/ny.png'
import romeImage from './assets/rome.png'
import stockholmImage from './assets/stockholm.png'

const TRANSLATIONS = {
	'en-US': {
		languageTutorTitle: 'Language Tutor',
		lessonMode: 'Lesson Mode',
		chatMode: 'Chat Mode',
		readyToPractice: 'Ready to practice',
		readyToPracticeTitle: 'You can start practicing now!',
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
		languageTutorTitle: 'Učslov',
		lessonMode: 'Režim Lekce',
		chatMode: 'Režim Konverzace',
		readyToPractice: 'Připraven procvičovat',
		readyToPracticeTitle: 'Můžete začít procvičovat!',
		startConversationHelp:
			'Začněte konverzaci a já vám pomohu se učit s personalizovanou zpětnou vazbou!',
		englishTranslation: 'Český překlad',
		tutorThinking: 'Tutor přemýšlí...',
		typeMessagePlaceholder: 'Napište zprávu',
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

// Determine which locale to use. If the appLocale constant is not set to
// '{{APP_LOCALE}}' it will take priority, otherwise the browser's preferred
// language is used. Fallback to English if no match is found.
const appLocale = 'cs-CZ'
const browserLocale =
	(typeof navigator !== 'undefined' &&
		(navigator.languages?.[0] || navigator.language)) ||
	'en-US'
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

/**
 * A fallback analysis used when the AI call fails or returns invalid data. It
 * estimates a proficiency level based solely on the number of user messages.
 */
const getFallbackAnalysis = (messageCount) => {
	let level = 'Beginner'
	if (messageCount >= 25) level = 'Advanced'
	else if (messageCount >= 15) level = 'Intermediate'
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
		levelProgression: {
			currentStage: level,
			nextMilestone: 'Continue practicing',
			estimatedProgress: '50%',
		},
	}
}

/**
 * Analyze the learner's proficiency using the AI endpoint. This mirrors the
 * original analyzeLanguageProficiency logic from the existing code. It
 * constructs a detailed prompt describing user messages and requests a JSON
 * response describing the proficiency level and various metrics. When the
 * response is invalid or an error occurs, the fallback analysis is used.
 */
const analyzeLanguageProficiency = async (messageHistory, targetLanguage) => {
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
			levelProgression: {
				currentStage: 'Beginner',
				nextMilestone: 'Continue practicing',
				estimatedProgress: '20%',
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
			levelProgression: {
				currentStage: 'Beginner',
				nextMilestone: 'Continue practicing',
				estimatedProgress: '30%',
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

// Main component implementing the refreshed design. It maintains all of the
// original application functionality while providing a dashboard‑style layout.
const LanguageTutor = () => {
	// State management for the current session. These mirror the original
	// component's state variables to preserve existing functionality.
	const [selectedLanguage, setSelectedLanguage] = useState('english')
	const [messages, setMessages] = useState([])
	const [currentMessage, setCurrentMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	// The target language only mode is permanently enabled.
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
	const messagesEndRef = useRef(null)

	// Supported languages with flag emojis
	const languages = {
		english: { name: 'English', flag: '🇺🇸' },
		swedish: { name: 'Swedish (Svenska)', flag: '🇸🇪' },
		italian: { name: 'Italian (Italiano)', flag: '🇮🇹' },
	}

	/**
	 * Send a message and handle tutor response. This mirrors the original
	 * sendMessage function.
	 */
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
			const response = await fetch('/api/claude', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt }),
			})
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}
			const parsedResponse = await response.json()
			let tutorMessage
			if (showLessonMode) {
				tutorMessage = {
					id: Date.now() + 1,
					text: parsedResponse.tutorResponse,
					continueConversation: parsedResponse.continueConversation,
					sender: 'tutor',
					timestamp: new Date(),
					isLessonMode: true,
				}
			} else {
				tutorMessage = {
					id: Date.now() + 1,
					text: parsedResponse.tutorResponse,
					continueConversation: parsedResponse.englishTranslation,
					sender: 'tutor',
					timestamp: new Date(),
					isLessonMode: false,
				}
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

	// Generate new learning goals based on level and language
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

	// Language selection handler
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

	// Toggle completion of a goal
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

	// Toggle translation visibility on tutor messages
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

	// Prompt user to add a custom goal
	const addCustomGoal = () => {
		const goalText = prompt(t('enterLearningGoal'))
		if (goalText?.trim()) {
			setLearningGoals((prev) => [
				...prev,
				{
					id: Date.now(),
					text: goalText.trim(),
					completed: false,
					progress: 0,
				},
			])
		}
	}

	// Auto-scroll to the bottom of the messages list whenever messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	return (
		<div className="flex h-screen bg-base-200 text-base-content">
			{/* Vertical navigation bar */}
			<aside className="hidden md:flex w-16 flex-col items-center py-6 bg-base-100 border-r border-base-300">
				<div className="flex flex-col space-y-6 w-full items-center">
					{/* Primary nav icons - highlight the chat icon as active */}
					<button className="btn btn-ghost btn-square text-primary bg-primary/10 flex items-center justify-center">
						<MessageCircle size={24} />
					</button>
					<button className="btn btn-ghost btn-square text-base-content hover:text-primary flex items-center justify-center">
						<Target size={24} />
					</button>
					<button className="btn btn-ghost btn-square text-base-content hover:text-primary flex items-center justify-center">
						<TrendingUp size={24} />
					</button>
					<button className="btn btn-ghost btn-square text-base-content hover:text-primary flex items-center justify-center">
						<Calendar size={24} />
					</button>
					<button className="btn btn-ghost btn-square text-base-content hover:text-primary flex items-center justify-center mt-auto">
						<Settings size={24} />
					</button>
				</div>
			</aside>
			{/* Main content area */}
			<main className="flex-1 flex flex-col px-6 py-4 overflow-y-auto space-y-6">
				{/* Header with title, language selector, lesson/chat toggle and search bar */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
					<div className="flex items-center space-x-4">
						<h1 className="text-xl font-semibold">
							{t('languageTutorTitle')}
						</h1>
						<select
							value={selectedLanguage}
							onChange={(e) =>
								handleLanguageChange(e.target.value)
							}
							className="select select-bordered select-sm"
						>
							{Object.entries(languages).map(([key, lang]) => (
								<option key={key} value={key}>
									{lang.flag} {lang.name}
								</option>
							))}
						</select>
						<label className="flex items-center cursor-pointer space-x-2">
							<input
								type="checkbox"
								className="toggle toggle-primary toggle-sm"
								checked={showLessonMode}
								onChange={() =>
									setShowLessonMode(!showLessonMode)
								}
							/>
							<span className="text-sm">
								{showLessonMode
									? t('lessonMode')
									: t('chatMode')}
							</span>
						</label>
					</div>
				</div>
				{/* Chat messages area */}
				<div className="flex-1 overflow-y-auto space-y-4 pr-1">
					{messages.length === 0 && (
						<div className="text-center text-gray-500 mt-10">
							<h2 className="text-lg font-semibold mb-2">
								{t('readyToPracticeTitle')}
							</h2>
							<p className="text-sm">
								{t('startConversationHelp')}
							</p>
						</div>
					)}
					{messages.map((message) => (
						<div
							key={message.id}
							onClick={
								message.sender === 'tutor'
									? () => toggleMessageTranslation(message.id)
									: undefined
							}
							className={`chat ${
								message.sender === 'user'
									? 'chat-end'
									: 'chat-start'
							}`}
						>
							<div className="chat-image avatar">
								<div className="w-10 rounded-full">
									<img
										src={`https://img.daisyui.com/images/profile/demo/${
											message.sender === 'user'
												? 'superperson'
												: 'batperson'
										}@192.webp`}
										alt="Učitel"
									/>
								</div>
							</div>
							<div className="chat-header">
								<time className="text-xs opacity-50">
									{message.timestamp.toLocaleTimeString([], {
										hour: '2-digit',
										minute: '2-digit',
									})}
								</time>
							</div>
							<div className="chat-bubble">
								{message.sender === 'tutor' &&
								translatedMessages.has(message.id) &&
								!targetLanguageOnlyMode
									? message.englishTranslation || message.text
									: message.text}
							</div>
						</div>
					))}
					{isLoading && (
						<div className="self-start bg-secondary text-secondary-content rounded-xl p-3 flex items-center space-x-2 shadow">
							<span className="loading loading-spinner loading-xs"></span>
							<div className="text-sm">{t('tutorThinking')}</div>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>
				{/* Input area */}
				<div className="mt-4 flex items-center gap-2">
					<input
						type="text"
						value={currentMessage}
						onChange={(e) => setCurrentMessage(e.target.value)}
						onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
						placeholder={`${t('typeMessagePlaceholder')}...`}
						className="input input-bordered w-full"
						disabled={isLoading}
					/>
					<button
						onClick={sendMessage}
						disabled={isLoading}
						className="btn btn-primary btn-square"
					>
						<Send size={20} />
					</button>
				</div>
			</main>
			{/* Right side panel for user profile and progress */}
			<aside className="hidden lg:flex w-72 flex-col space-y-4 bg-base-100 border-l border-base-300 p-4 overflow-y-auto">
				{/* Progress overview section */}
				<div className="card bg-base-200 shadow">
					<div className="card-body p-4">
						<h3 className="flex items-center font-semibold mb-2">
							<TrendingUp
								className="mr-2 text-primary"
								size={20}
							/>{' '}
							{t('progressOverview')}
						</h3>
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span>{t('messages')}</span>
								<span className="font-medium">
									{userProfile.totalMessages}
								</span>
							</div>
							<div className="flex justify-between">
								<span>{t('vocabulary')}</span>
								<span className="font-medium">
									{userProfile.vocabularyCount.size}{' '}
									{t('words')}
								</span>
							</div>
							<div className="flex justify-between">
								<span>{t('accuracy')}</span>
								<span className="font-medium">
									{userProfile.grammarAccuracy}%
								</span>
							</div>
						</div>
					</div>
				</div>
				{/* Goals section */}
				<div className="card bg-base-200 shadow">
					<div className="card-body p-4">
						<div className="flex items-center justify-between mb-2">
							<h3 className="flex items-center font-semibold">
								<Target
									className="mr-2 text-primary"
									size={20}
								/>{' '}
								{t('learningGoals')}
							</h3>
							<button
								onClick={addCustomGoal}
								className="btn btn-xs btn-outline btn-primary"
							>
								{t('addGoal')}
							</button>
						</div>
						<ul className="space-y-2">
							{learningGoals.map((goal) => (
								<li
									key={goal.id}
									className="flex items-center justify-between p-2 bg-base-100 rounded-box"
								>
									<div className="flex-1">
										<p className="text-sm font-medium">
											{goal.text}
										</p>
										<p className="text-xs opacity-60">
											{t('progress')} {goal.progress}%
										</p>
									</div>
									<button
										onClick={() =>
											toggleGoalCompletion(goal.id)
										}
										className={`btn btn-xs btn-circle ${
											goal.completed
												? 'btn-success'
												: 'btn-ghost'
										}`}
									>
										{goal.completed ? (
											<CheckCircle size={16} />
										) : (
											<div className="w-3 h-3 rounded-full border border-base-content"></div>
										)}
									</button>
								</li>
							))}
						</ul>
					</div>
				</div>
				{/* Feedback section */}
				{feedback && (
					<div className="card bg-base-200 shadow">
						<div className="card-body p-4">
							<h3 className="flex items-center font-semibold mb-2">
								<MessageSquare
									className="mr-2 text-primary"
									size={20}
								/>{' '}
								{t('feedback')}
							</h3>
							{feedback.positive?.length > 0 && (
								<div className="mb-2">
									<p className="font-semibold text-success text-sm">
										{t('greatJob')}
									</p>
									<ul className="list-disc pl-5 text-sm space-y-1">
										{feedback.positive.map((item, idx) => (
											<li key={idx}>{item}</li>
										))}
									</ul>
								</div>
							)}
							{feedback.corrections?.length > 0 && (
								<div className="mb-2">
									<p className="font-semibold text-warning text-sm">
										{t('smallCorrections')}
									</p>
									<ul className="list-disc pl-5 text-sm space-y-1">
										{feedback.corrections.map(
											(item, idx) => (
												<li key={idx}>{item}</li>
											)
										)}
									</ul>
								</div>
							)}
							{feedback.suggestions?.length > 0 && (
								<div>
									<p className="font-semibold text-info text-sm">
										{t('tryThis')}
									</p>
									<ul className="list-disc pl-5 text-sm space-y-1">
										{feedback.suggestions.map(
											(item, idx) => (
												<li key={idx}>{item}</li>
											)
										)}
									</ul>
								</div>
							)}
						</div>
					</div>
				)}
				{/* AI analysis section */}
				{detailedAnalysis && (
					<div className="card bg-base-200 shadow">
						<div className="card-body p-4">
							<h3 className="flex items-center font-semibold mb-2">
								<Brain
									className="mr-2 text-primary"
									size={20}
								/>{' '}
								AI Language Analysis
							</h3>
							<div className="space-y-2 text-sm">
								<p>
									<span className="font-semibold">
										Current Level:
									</span>{' '}
									{detailedAnalysis.level} (
									{Math.round(
										detailedAnalysis.confidence * 100
									)}
									% confidence)
								</p>
								<p>
									<span className="font-semibold">
										Grammar Accuracy:
									</span>{' '}
									{detailedAnalysis.details.grammarAccuracy}%
								</p>
								<p>
									<span className="font-semibold">
										Vocabulary Level:
									</span>{' '}
									{detailedAnalysis.details.vocabularyLevel}
								</p>
								<p>
									<span className="font-semibold">
										Sentence Complexity:
									</span>{' '}
									{
										detailedAnalysis.details
											.sentenceComplexity
									}
								</p>
								{detailedAnalysis.details.strongPoints?.length >
									0 && (
									<div>
										<p className="font-semibold">
											Strong Points:
										</p>
										<ul className="list-disc pl-5 text-sm space-y-1">
											{detailedAnalysis.details.strongPoints.map(
												(point, index) => (
													<li key={index}>{point}</li>
												)
											)}
										</ul>
									</div>
								)}
								{detailedAnalysis.details.improvementAreas
									?.length > 0 && (
									<div>
										<p className="font-semibold">
											Focus Areas:
										</p>
										<ul className="list-disc pl-5 text-sm space-y-1">
											{detailedAnalysis.details.improvementAreas.map(
												(area, index) => (
													<li key={index}>{area}</li>
												)
											)}
										</ul>
									</div>
								)}
								<div>
									<p className="font-semibold">
										Analysis Details:
									</p>
									<p className="text-xs">
										{detailedAnalysis.reasoning}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}

				{isAnalyzing && (
					<div className="card bg-base-200 shadow flex items-center gap-2 p-4">
						<span className="loading loading-spinner loading-xs"></span>
						<span className="text-sm">
							Analyzing your language level...
						</span>
					</div>
				)}
			</aside>
		</div>
	)
}

export default LanguageTutor
