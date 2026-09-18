const chatMessages = document.querySelector('#chat-messages');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const languageSelect = document.querySelector('#chat-language');
const voiceToggle = document.querySelector('#voice-toggle');
const micButton = document.querySelector('#mic-button');
const voiceStatus = document.querySelector('#voice-status');
const dailyQuestion = document.querySelector('#daily-question');
const dailyQuestionButton = document.querySelector('#daily-question-button');
const chatStorageKey = 'mero-cycle-companion-chat';
const firstName = document.body.dataset.userName || 'friend';
const dayNumber = Math.floor(Date.now() / 86400000);
const dailyQuestions = [
    'What would make today feel a little softer?',
    'What is one small thing your body needs today?',
    'What feeling would you like to make room for?',
    'What are you proud of yourself for this week?',
    'What kind of care sounds comforting right now?',
];
const todaysQuestion = dailyQuestions[dayNumber % dailyQuestions.length];
dailyQuestion.textContent = todaysQuestion;
let speakReplies = false;
let selectedLanguage = localStorage.getItem('mero-cycle-language') || 'en-US';
languageSelect.value = selectedLanguage;

const responses = [
    { words: ['tired', 'exhausted', 'sleep'], text: 'That sounds like a low-energy day. A drink of water, something nourishing, and a little extra rest may help. You do not have to push through everything.' },
    { words: ['cramp', 'pain', 'ache'], text: 'I am sorry you are uncomfortable. A warm compress, gentle movement, and rest can feel soothing. If pain is severe or unusual, please tell a trusted adult or healthcare professional.' },
    { words: ['sweet', 'chocolate', 'craving', 'salty'], text: 'Cravings can be a normal part of your cycle. You can enjoy what sounds good and add something nourishing alongside it, like fruit, yogurt, or a warm meal.' },
    { words: ['sad', 'low', 'upset', 'cry', 'lonely'], text: 'I am glad you said something. You deserve support today. Would a small comforting step help, like texting someone you trust, listening to music, or getting cozy?' },
    { words: ['period', 'cycle', 'phase', 'ovulation'], text: 'Your cycle can change how your energy and feelings move. You can use Calendar to update your dates and Insights to notice patterns gently over time.' },
];

const translations = {
    'hi-IN': { welcome: 'नमस्ते! मैं सुनने और आपका साथ देने के लिए यहां हूं। आज आपके मन में क्या है?', fallback: 'मैं सुन रही हूं। आज का दिन आपके लिए कैसा है, थोड़ा और बताइए।', tired: 'यह थकान भरा दिन लगता है। पानी पीना, कुछ पौष्टिक खाना और थोड़ा आराम मदद कर सकता है।', cramps: 'आपको असहज महसूस हो रहा है, इसका मुझे अफसोस है। गर्म सिकाई, हल्की हलचल और आराम मदद कर सकते हैं।', sweet: 'क्रेविंग आपके चक्र का सामान्य हिस्सा हो सकती है। जो अच्छा लगे उसका आनंद लें और साथ में कुछ पौष्टिक भी खाएं।', sad: 'आपने बताया, यह अच्छी बात है। आप मदद और सहारे की हकदार हैं। किसी भरोसेमंद व्यक्ति से बात करना कैसा रहेगा?', cycle: 'आपका चक्र आपकी ऊर्जा और भावनाओं को प्रभावित कर सकता है। कैलेंडर में तारीखें अपडेट करके पैटर्न देखें।' },
    'es-ES': { welcome: '¡Hola! Estoy aquí para escucharte y acompañarte. ¿Qué tienes en mente hoy?', fallback: 'Te escucho. Cuéntame un poco más sobre cómo te sientes hoy.', tired: 'Parece un día de poca energía. Beber agua, comer algo nutritivo y descansar un poco puede ayudarte.', cramps: 'Siento que estés incómoda. Una compresa caliente, movimiento suave y descanso pueden aliviarte.', sweet: 'Los antojos pueden ser una parte normal de tu ciclo. Disfruta lo que te apetezca y añade algo nutritivo.', sad: 'Me alegra que lo hayas contado. Mereces apoyo. ¿Te ayudaría hablar con alguien de confianza?', cycle: 'Tu ciclo puede cambiar tu energía y tus emociones. Actualiza el calendario para notar tus patrones.' },
    'ne-NP': { welcome: 'नमस्ते! म तपाईंलाई सुन्न र साथ दिन यहाँ छु। आज तपाईंको मनमा के छ?', fallback: 'म सुन्दैछु। आज तपाईंलाई कस्तो लागिरहेको छ, अझ भन्नुहोस्।', tired: 'आज थकान भएको जस्तो छ। पानी पिउनु, पौष्टिक खाना खानु र केही आराम गर्नु उपयोगी हुन सक्छ।', cramps: 'तपाईंलाई असहज भएकोमा मलाई दुःख लाग्यो। न्यानो सेकाइ, हल्का चलायमान र आरामले मद्दत गर्न सक्छ।', sweet: 'चक्रका बेला क्रेभिङ हुनु सामान्य हुन सक्छ। मन लागेको कुरा खानुहोस् र सँगै पौष्टिक कुरा पनि खानुहोस्।', sad: 'तपाईंले भन्नुभयो, यो राम्रो कुरा हो। विश्वासिलो व्यक्तिसँग कुरा गर्दा कस्तो होला?', cycle: 'तपाईंको चक्रले ऊर्जा र भावनामा असर गर्न सक्छ। क्यालेन्डरमा मिति राखेर आफ्ना ढाँचाहरू बुझ्नुहोस्।' },
};

function addMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function speak(text) {
    if (!speakReplies || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    window.speechSynthesis.speak(utterance);
}

function getReply(text) {
    const normalized = text.toLowerCase();
    const match = responses.find((item) => item.words.some((word) => normalized.includes(word)));
    if (selectedLanguage === 'en-US') return match ? match.text : 'I am listening. Tell me a little more about what today feels like for you.';
    const language = translations[selectedLanguage];
    if (!match) return language.fallback;
    if (match.words.includes('tired')) return language.tired;
    if (match.words.includes('cramp')) return language.cramps;
    if (match.words.includes('sweet')) return language.sweet;
    if (match.words.includes('sad')) return language.sad;
    return language.cycle;
}

function saveChat() {
    localStorage.setItem(chatStorageKey, JSON.stringify([...chatMessages.children].map((message) => ({ text: message.textContent, sender: message.className.split(' ')[1] }))));
}

const savedMessages = JSON.parse(localStorage.getItem(chatStorageKey) || '[]');
if (savedMessages.length) savedMessages.forEach((message) => addMessage(message.text, message.sender));
else addMessage(`Hi ${firstName}! I am here for your daily check-in. ${todaysQuestion}`, 'companion');

function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    addMessage(cleanText, 'person');
    window.setTimeout(() => { const reply = getReply(cleanText); addMessage(reply, 'companion'); speak(reply); saveChat(); }, 350);
    saveChat();
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
    chatInput.value = '';
    chatInput.focus();
});

document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
dailyQuestionButton.addEventListener('click', () => { chatInput.value = todaysQuestion; chatInput.focus(); });

languageSelect.addEventListener('change', () => {
    selectedLanguage = languageSelect.value;
    localStorage.setItem('mero-cycle-language', selectedLanguage);
    const welcome = selectedLanguage === 'en-US' ? 'I am here with you. What is on your mind today?' : translations[selectedLanguage].welcome;
    addMessage(welcome, 'companion');
    speak(welcome);
});

voiceToggle.addEventListener('click', () => {
    speakReplies = !speakReplies;
    voiceToggle.setAttribute('aria-pressed', String(speakReplies));
    voiceToggle.textContent = speakReplies ? '🔇 Stop reading replies' : '🔊 Read replies aloud';
});

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) micButton.disabled = true;
else {
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLanguage;
    recognition.interimResults = false;
    micButton.addEventListener('click', () => { recognition.lang = selectedLanguage; micButton.classList.add('listening'); micButton.setAttribute('aria-label', 'Listening'); if (voiceStatus) voiceStatus.textContent = 'Listening... speak now'; recognition.start(); });
    recognition.addEventListener('result', (event) => { const transcript = event.results[0][0].transcript; chatInput.value = transcript; if (voiceStatus) voiceStatus.textContent = 'Sending your voice message...'; sendMessage(transcript); chatInput.value = ''; });
    recognition.addEventListener('error', () => { if (voiceStatus) voiceStatus.textContent = 'Microphone could not hear that. Please try again.'; });
    recognition.addEventListener('end', () => { micButton.classList.remove('listening'); micButton.setAttribute('aria-label', 'Speak and send your message'); if (voiceStatus && voiceStatus.textContent === 'Listening... speak now') voiceStatus.textContent = 'Type a message or tap the microphone to speak.'; });
    languageSelect.addEventListener('change', () => { recognition.lang = languageSelect.value; });
}
