// src/App.js
import React, { useState, useEffect, useRef } from 'react'
import {
	Send,
	BookOpen,
	Target,
	TrendingUp,
	MessageSquare,
	CheckCircle,
	Star,
	BarChart3,
	Languages,
	Mic,
	MicOff,
	Volume2,
	VolumeX,
} from 'lucide-react'
import './App.css'

const TRANSLATIONS = {
	'cs-CZ': {
		languageTutorTitle: 'Jazykový Tutor',
		lessonMode: 'Režim Lekce',
		chatMode: 'Režim Konverzace',
		readyToPractice: 'Připraven/a procvičovat',
		startConversationHelp:
			'Začněte konverzaci a já vám pomohu se učit s personalizovanou zpětnou vazbou!',
		nativeTranslation: 'Český překlad',
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
		addGoalButton: 'Přidat cíl',
		cancel: 'Zrušit',
		englishOnly: 'Pouze anglicky',
		withTranslations: 'S překlady',
		languageMode: 'Režim jazyka:',
		startListening: 'Klikněte pro mluvení',
		stopListening: 'Klikněte pro zastavení',
		speechEnabled: 'Zvuk zapnut',
		speechDisabled: 'Zvuk vypnut',
		sorryTroubleResponding:
			'Omlouvám se, mám potíže s odpovědí. Pokračujme v procvičování!',
		keepPracticing: 'Pokračujme v procvičování!',
		liveMode: 'Live režim',
		normalMode: 'Normální režim',
		liveModeActive: '🔴 LIVE - Mluvte volně',
	},
}

const t = (key) => TRANSLATIONS['cs-CZ'][key] || key

const LanguageTutor = () => {
	const [selectedLanguage, setSelectedLanguage] = useState('english')
	const [messages, setMessages] = useState([])
	const [currentMessage, setCurrentMessage] = useState('')
	const [isLoading, setIsLoading] = useState(false)
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
			text: 'Zvládnout základní anglické pozdravy',
			completed: false,
			progress: 0,
			type: 'greetings',
			targetWords: [
				'hello',
				'hi',
				'good morning',
				'good afternoon',
				'good evening',
				'how are you',
				'nice to meet you',
				'goodbye',
				'bye',
				'see you',
			],
			usedWords: new Set(),
			targetCount: 10,
		},
		{
			id: 2,
			text: 'Naučit se přítomný čas (Present Simple)',
			completed: false,
			progress: 0,
			type: 'grammar',
			targetPatterns: [
				'am',
				'is',
				'are',
				'do',
				'does',
				'have',
				'has',
				'work',
				'works',
				'live',
				'lives',
			],
			usedPatterns: new Set(),
			targetCount: 15,
		},
		{
			id: 3,
			text: 'Rozšířit slovní zásobu o každodenní výrazy',
			completed: false,
			progress: 0,
			type: 'vocabulary',
			targetWords: [
				'family',
				'house',
				'food',
				'work',
				'school',
				'friend',
				'time',
				'day',
				'week',
				'month',
				'year',
				'today',
				'tomorrow',
				'yesterday',
			],
			usedWords: new Set(),
			targetCount: 20,
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
	const [showGoalModal, setShowGoalModal] = useState(false)
	const [newGoalText, setNewGoalText] = useState('')
	const [englishOnlyMode, setEnglishOnlyMode] = useState(false)
	const [isListening, setIsListening] = useState(false)
	const [speechEnabled, setSpeechEnabled] = useState(true)
	const [recognition, setRecognition] = useState(null)
	const [liveMode, setLiveMode] = useState(false)
	const [silenceTimeout, setSilenceTimeout] = useState(null)
	const messagesEndRef = useRef(null)

	const languages = {
		english: { name: 'English', flag: '🇺🇸' },
		spanish: { name: 'Spanish (Español)', flag: '🇪🇸' },
		french: { name: 'French (Français)', flag: '🇫🇷' },
		german: { name: 'German (Deutsch)', flag: '🇩🇪' },
		japanese: { name: 'Japanese (日本語)', flag: '🇯🇵' },
		italian: { name: 'Italian (Italiano)', flag: '🇮🇹' },
		portuguese: { name: 'Portuguese (Português)', flag: '🇵🇹' },
		chinese: { name: 'Chinese (中文)', flag: '🇨🇳' },
		korean: { name: 'Korean (한국어)', flag: '🇰🇷' },
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	useEffect(() => {
		initializeSpeechRecognition()
	}, [selectedLanguage])

	useEffect(() => {
		if (liveMode && !isListening && recognition) {
			startListening()
		}
	}, [liveMode])

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	const getLanguageCode = (language) => {
		const languageCodes = {
			english: 'en-US',
			spanish: 'es-ES',
			french: 'fr-FR',
			german: 'de-DE',
			japanese: 'ja-JP',
			italian: 'it-IT',
			portuguese: 'pt-PT',
			chinese: 'zh-CN',
			korean: 'ko-KR',
		}
		return languageCodes[language] || 'en-US'
	}

	const initializeSpeechRecognition = () => {
		if (
			!('webkitSpeechRecognition' in window) &&
			!('SpeechRecognition' in window)
		) {
			return
		}

		const SpeechRecognition =
			window.webkitSpeechRecognition || window.SpeechRecognition
		const recognitionInstance = new SpeechRecognition()

		recognitionInstance.continuous = liveMode
		recognitionInstance.interimResults = true
		recognitionInstance.lang = getLanguageCode(selectedLanguage)

		recognitionInstance.onstart = () => {
			setIsListening(true)
		}

		recognitionInstance.onend = () => {
			setIsListening(false)
			if (liveMode && !isListening) {
				// Restart listening in live mode
				setTimeout(() => {
					if (liveMode) startListening()
				}, 100)
			}
		}

		recognitionInstance.onresult = (event) => {
			let finalTranscript = ''
			let interimTranscript = ''

			for (let i = event.resultIndex; i < event.results.length; i++) {
				const transcript = event.results[i][0].transcript
				if (event.results[i].isFinal) {
					finalTranscript += transcript
				} else {
					interimTranscript += transcript
				}
			}

			if (finalTranscript) {
				setCurrentMessage(finalTranscript)

				if (liveMode) {
					// Clear existing silence timeout
					if (silenceTimeout) {
						clearTimeout(silenceTimeout)
					}

					// Set new silence timeout
					const timeout = setTimeout(() => {
						if (finalTranscript.trim()) {
							sendMessage(finalTranscript)
						}
					}, 3000) // 3 seconds of silence

					setSilenceTimeout(timeout)
				}
			} else if (interimTranscript && !liveMode) {
				setCurrentMessage(interimTranscript)
			}
		}

		recognitionInstance.onerror = (event) => {
			console.error('Speech recognition error:', event.error)
			setIsListening(false)
		}

		setRecognition(recognitionInstance)
	}

	const startListening = () => {
		if (!recognition || isListening) return

		try {
			recognition.continuous = liveMode
			recognition.lang = getLanguageCode(selectedLanguage)
			recognition.start()
		} catch (error) {
			console.error('Error starting speech recognition:', error)
		}
	}

	const stopListening = () => {
		if (recognition && isListening) {
			recognition.stop()
		}
		if (silenceTimeout) {
			clearTimeout(silenceTimeout)
			setSilenceTimeout(null)
		}
	}

	const speakText = (text, language = selectedLanguage) => {
		if (!speechEnabled || !text) return

		window.speechSynthesis.cancel()

		const utterance = new SpeechSynthesisUtterance(text)
		utterance.lang = getLanguageCode(language)
		utterance.rate = 0.9
		utterance.pitch = 1

		const voices = window.speechSynthesis.getVoices()
		const targetVoice = voices.find((voice) =>
			voice.lang.startsWith(getLanguageCode(language).split('-')[0])
		)

		if (targetVoice) {
			utterance.voice = targetVoice
		}

		window.speechSynthesis.speak(utterance)
	}

	const updateGoalProgress = (userMessage) => {
		setLearningGoals((prevGoals) =>
			prevGoals.map((goal) => {
				if (goal.completed) return goal

				const messageWords = userMessage.toLowerCase().split(/\s+/)
				let newUsedWords = new Set(goal.usedWords || [])
				let newUsedPatterns = new Set(goal.usedPatterns || [])
				let progressIncrease = 0

				if (goal.type === 'greetings' && goal.targetWords) {
					goal.targetWords.forEach((word) => {
						if (
							userMessage
								.toLowerCase()
								.includes(word.toLowerCase()) &&
							!newUsedWords.has(word)
						) {
							newUsedWords.add(word)
							progressIncrease += 100 / goal.targetCount
						}
					})
				}

				if (goal.type === 'grammar' && goal.targetPatterns) {
					goal.targetPatterns.forEach((pattern) => {
						if (
							messageWords.includes(pattern.toLowerCase()) &&
							!newUsedPatterns.has(pattern)
						) {
							newUsedPatterns.add(pattern)
							progressIncrease += 100 / goal.targetCount
						}
					})
				}

				if (goal.type === 'vocabulary' && goal.targetWords) {
					goal.targetWords.forEach((word) => {
						if (
							messageWords.includes(word.toLowerCase()) &&
							!newUsedWords.has(word)
						) {
							newUsedWords.add(word)
							progressIncrease += 100 / goal.targetCount
						}
					})
				}

				if (goal.type === 'custom') {
					messageWords.forEach((word) => {
						if (
							word.length > 2 &&
							!newUsedWords.has(word) &&
							/^[a-zA-Z]+$/.test(word)
						) {
							newUsedWords.add(word)
							progressIncrease += 100 / goal.targetCount
						}
					})
				}

				const newProgress = Math.min(
					100,
					(goal.progress || 0) + progressIncrease
				)
				const isCompleted = newProgress >= 100

				return {
					...goal,
					usedWords: newUsedWords,
					usedPatterns: newUsedPatterns,
					progress: Math.round(newProgress),
					completed: isCompleted,
				}
			})
		)
	}

	const analyzeProficiencyLevel = (messageHistory) => {
		if (messageHistory.length < 3) return 'Beginner'
		if (messageHistory.length < 10) return 'Beginner'
		if (messageHistory.length < 20) return 'Intermediate'
		return 'Advanced'
	}

	const sendMessage = async (messageText = currentMessage) => {
		if (!messageText.trim() || isLoading) return

		const userMessage = {
			id: Date.now(),
			text: messageText,
			sender: 'user',
			timestamp: new Date(),
		}

		setMessages((prev) => [...prev, userMessage])
		if (!liveMode) setCurrentMessage('')
		setIsLoading(true)

		updateGoalProgress(messageText)

		try {
			const conversationHistory = [...messages, userMessage]
			const detectedLevel = analyzeProficiencyLevel(conversationHistory)

			const requestData = {
				message: messageText,
				conversationHistory: conversationHistory.slice(-5),
				userProfile: {
					proficiencyLevel: detectedLevel,
					learningGoals: learningGoals.map((g) => g.text),
					englishOnlyMode,
					showLessonMode,
					selectedLanguage: languages[selectedLanguage].name,
				},
			}

			// Call our API endpoint instead of Claude directly
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestData),
			})

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`)
			}

			const parsedResponse = await response.json()

			const tutorMessage = {
				id: Date.now() + 1,
				text: parsedResponse.tutorResponse,
				englishTranslation: parsedResponse.czechTranslation,
				sender: 'tutor',
				timestamp: new Date(),
			}

			setMessages((prev) => [...prev, tutorMessage])
			setFeedback(parsedResponse.feedback)

			if (speechEnabled) {
				speakText(parsedResponse.tutorResponse, selectedLanguage)
			}

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

			if (liveMode) {
				setCurrentMessage('') // Clear message in live mode after sending
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

	const toggleLiveMode = () => {
		const newLiveMode = !liveMode
		setLiveMode(newLiveMode)

		if (newLiveMode) {
			// Start live mode
			if (!isListening) {
				startListening()
			}
		} else {
			// Stop live mode
			stopListening()
			if (silenceTimeout) {
				clearTimeout(silenceTimeout)
				setSilenceTimeout(null)
			}
		}
	}

	const getProficiencyColor = (level) => {
		const colors = {
			Beginner: 'text-green-600 bg-green-100',
			Intermediate: 'text-yellow-600 bg-yellow-100',
			Advanced: 'text-red-600 bg-red-100',
			Native: 'text-purple-600 bg-purple-100',
		}
		return colors[level] || colors.Beginner
	}

	const speechSupported =
		'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

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
									setSelectedLanguage(e.target.value)
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
							<div className="flex items-center space-x-2">
								<span className="text-sm text-gray-600">
									{t('languageMode')}
								</span>
								<button
									onClick={() =>
										setEnglishOnlyMode(!englishOnlyMode)
									}
									className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
										englishOnlyMode
											? 'bg-red-100 text-red-700 border border-red-200'
											: 'bg-green-100 text-green-700 border border-green-200'
									}`}
								>
									{englishOnlyMode
										? t('englishOnly')
										: t('withTranslations')}
								</button>
							</div>

							{speechSupported && (
								<button
									onClick={toggleLiveMode}
									className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
										liveMode
											? 'bg-red-500 text-white animate-pulse'
											: 'bg-purple-200 text-purple-700 hover:bg-purple-300'
									}`}
								>
									{liveMode
										? t('liveModeActive')
										: t('liveMode')}
								</button>
							)}

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
							<p className="text-gray-500 mb-4">
								{t('startConversationHelp')}
							</p>
							{liveMode && (
								<div className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm animate-pulse">
									<Star className="h-4 w-4 mr-2" />
									{t('liveModeActive')}
								</div>
							)}
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
										: 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 transition-colors cursor-pointer'
								}`}
							>
								<p className="pr-4">{message.text}</p>
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
					{!liveMode && (
						<div className="flex space-x-2">
							<button
								onClick={
									isListening ? stopListening : startListening
								}
								disabled={!speechSupported}
								className={`px-3 py-2 rounded-md transition-colors ${
									isListening
										? 'bg-red-500 text-white animate-pulse'
										: speechSupported
										? 'bg-blue-200 text-blue-700 hover:bg-blue-300'
										: 'bg-gray-100 text-gray-400 cursor-not-allowed'
								}`}
							>
								{isListening ? (
									<MicOff className="h-5 w-5" />
								) : (
									<Mic className="h-5 w-5" />
								)}
							</button>

							<input
								type="text"
								value={currentMessage}
								onChange={(e) =>
									setCurrentMessage(e.target.value)
								}
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
								onClick={() => setSpeechEnabled(!speechEnabled)}
								className={`px-3 py-2 rounded-md transition-colors ${
									speechEnabled
										? 'bg-green-200 text-green-700 hover:bg-green-300'
										: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
								}`}
							>
								{speechEnabled ? (
									<Volume2 className="h-5 w-5" />
								) : (
									<VolumeX className="h-5 w-5" />
								)}
							</button>

							<button
								onClick={() => sendMessage()}
								disabled={isLoading || !currentMessage.trim()}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								<Send className="h-5 w-5" />
							</button>
						</div>
					)}

					{liveMode && (
						<div className="text-center py-4">
							<div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg">
								<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2"></div>
								<span className="font-medium">
									{t('liveModeActive')}
								</span>
							</div>
							<p className="text-sm text-gray-500 mt-2">
								Mluvte volně - automaticky odpovím po 3
								vteřinách ticha
							</p>
							{currentMessage && (
								<div className="mt-2 p-2 bg-gray-100 rounded text-sm">
									Zachycuji: "{currentMessage}"
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Sidebar - Goals, Progress, etc. */}
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
							onClick={() => setShowGoalModal(true)}
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
													className={`h-2 rounded-full transition-all duration-500 ${
														goal.progress > 0
															? 'bg-blue-600'
															: 'bg-gray-300'
													}`}
													style={{
														width: `${goal.progress}%`,
													}}
												></div>
											</div>
										</div>
									</div>
									<button
										onClick={() => {
											setLearningGoals((prev) =>
												prev.map((g) =>
													g.id === goal.id
														? {
																...g,
																completed:
																	!g.completed,
																progress:
																	g.completed
																		? g.progress
																		: 100,
														  }
														: g
												)
											)
										}}
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

				{/* Feedback */}
				{feedback && (
					<div className="p-4 border-b border-gray-200">
						<h3 className="font-semibold text-gray-800 mb-3 flex items-center">
							<MessageSquare className="h-5 w-5 mr-2" />
							{t('feedback')}
						</h3>
						{feedback.positive?.length > 0 && (
							<div className="mb-2">
								<p className="text-xs font-medium text-green-600 mb-1">
									{t('greatJob')}
								</p>
								{feedback.positive.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-green-700 bg-green-50 p-2 rounded mb-1"
									>
										{item}
									</p>
								))}
							</div>
						)}
						{feedback.corrections?.length > 0 && (
							<div className="mb-2">
								<p className="text-xs font-medium text-orange-600 mb-1">
									{t('smallCorrections')}
								</p>
								{feedback.corrections.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-orange-700 bg-orange-50 p-2 rounded mb-1"
									>
										{item}
									</p>
								))}
							</div>
						)}
						{feedback.suggestions?.length > 0 && (
							<div>
								<p className="text-xs font-medium text-blue-600 mb-1">
									{t('tryThis')}
								</p>
								{feedback.suggestions.map((item, idx) => (
									<p
										key={idx}
										className="text-sm text-blue-700 bg-blue-50 p-2 rounded mb-1"
									>
										{item}
									</p>
								))}
							</div>
						)}
					</div>
				)}

				{/* Stats */}
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
					</div>
				</div>
			</div>

			{/* Goal Modal */}
			{showGoalModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
						<h3 className="text-lg font-semibold text-gray-800 mb-4">
							{t('enterLearningGoal')}
						</h3>
						<input
							type="text"
							value={newGoalText}
							onChange={(e) => setNewGoalText(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter' && newGoalText.trim()) {
									const newGoal = {
										id: Date.now(),
										text: newGoalText.trim(),
										completed: false,
										progress: 0,
										type: 'custom',
										usedWords: new Set(),
										targetCount: 50,
									}
									setLearningGoals((prev) => [
										...prev,
										newGoal,
									])
									setNewGoalText('')
									setShowGoalModal(false)
								}
							}}
							placeholder="Např.: Naučit se budoucí čas"
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
							autoFocus
						/>
						<div className="flex space-x-3">
							<button
								onClick={() => {
									if (newGoalText.trim()) {
										const newGoal = {
											id: Date.now(),
											text: newGoalText.trim(),
											completed: false,
											progress: 0,
											type: 'custom',
											usedWords: new Set(),
											targetCount: 50,
										}
										setLearningGoals((prev) => [
											...prev,
											newGoal,
										])
										setNewGoalText('')
										setShowGoalModal(false)
									}
								}}
								disabled={!newGoalText.trim()}
								className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{t('addGoalButton')}
							</button>
							<button
								onClick={() => {
									setNewGoalText('')
									setShowGoalModal(false)
								}}
								className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
							>
								{t('cancel')}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default LanguageTutor
