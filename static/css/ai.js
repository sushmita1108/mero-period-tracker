const chatMessages = document.querySelector('#chat-messages');
const chatForm = document.querySelector('#chat-form');
const chatInput = document.querySelector('#chat-input');
const chatStorageKey = 'mero-cycle-companion-chat';

const responses = [
    { words: ['tired', 'exhausted', 'sleep'], text: 'That sounds like a low-energy day. A drink of water, something nourishing, and a little extra rest may help. You do not have to push through everything.' },
    { words: ['cramp', 'pain', 'ache'], text: 'I am sorry you are uncomfortable. A warm compress, gentle movement, and rest can feel soothing. If pain is severe or unusual, please tell a trusted adult or healthcare professional.' },
    { words: ['sweet', 'chocolate', 'craving', 'salty'], text: 'Cravings can be a normal part of your cycle. You can enjoy what sounds good and add something nourishing alongside it, like fruit, yogurt, or a warm meal.' },
    { words: ['sad', 'low', 'upset', 'cry', 'lonely'], text: 'I am glad you said something. You deserve support today. Would a small comforting step help, like texting someone you trust, listening to music, or getting cozy?' },
    { words: ['period', 'cycle', 'phase', 'ovulation'], text: 'Your cycle can change how your energy and feelings move. You can use Calendar to update your dates and Insights to notice patterns gently over time.' },
];

function addMessage(text, sender) {
    const message = document.createElement('div');
    message.className = `chat-message ${sender}`;
    message.textContent = text;
    chatMessages.appendChild(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getReply(text) {
    const normalized = text.toLowerCase();
    const match = responses.find((item) => item.words.some((word) => normalized.includes(word)));
    return match ? match.text : 'I am listening. Tell me a little more about what today feels like for you.';
}

function saveChat() {
    localStorage.setItem(chatStorageKey, JSON.stringify([...chatMessages.children].map((message) => ({ text: message.textContent, sender: message.className.split(' ')[1] }))));
}

const savedMessages = JSON.parse(localStorage.getItem(chatStorageKey) || '[]');
if (savedMessages.length) savedMessages.forEach((message) => addMessage(message.text, message.sender));
else addMessage('Hi! I am here to listen, help you notice your cycle, or simply keep you company. What is on your mind?', 'companion');

function sendMessage(text) {
    const cleanText = text.trim();
    if (!cleanText) return;
    addMessage(cleanText, 'person');
    window.setTimeout(() => { addMessage(getReply(cleanText), 'companion'); saveChat(); }, 350);
    saveChat();
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
    chatInput.value = '';
    chatInput.focus();
});

document.querySelectorAll('[data-prompt]').forEach((button) => button.addEventListener('click', () => sendMessage(button.dataset.prompt)));
