import * as L from 'leaflet';

// Init map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Chat handling
const chatMessages = document.getElementById("chat-messages")!;
const chatInput = document.getElementById("chat-input") as HTMLInputElement;
const chatForm = document.getElementById("chat-form") as HTMLFormElement;

// Chat history storage
interface ChatMessage {
    sender: string;
    text: string;
    timestamp: number;
}

const STORAGE_KEY = 'map-chat-history';

// Load chat history from localStorage
function loadChatHistory(): ChatMessage[] {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    return savedHistory ? JSON.parse(savedHistory) : [];
}

// Save chat history to localStorage
function saveChatHistory(messages: ChatMessage[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// Initialize with saved history
const chatHistory = loadChatHistory();
displayChatHistory();

// Auto-expand input box
chatInput.addEventListener("input", () => {
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (chatInput.value.trim()) {
        const userMessage = chatInput.value.trim();
        addChatMessage("You", userMessage);

        // Simple echo response
        const botMessage = `You said: "${userMessage}"`;
        addChatMessage("Bot", botMessage);

        chatInput.value = "";
        chatInput.style.height = "auto"; // Reset height
    }
});

function addChatMessage(sender: string, text: string) {
    // Create a new message object
    const messageObj: ChatMessage = {
        sender,
        text,
        timestamp: Date.now()
    };

    // Add to history array
    chatHistory.push(messageObj);

    // Save to localStorage
    saveChatHistory(chatHistory);

    // Display in UI
    displayMessage(messageObj);
}

// Display a single message in the chat UI
function displayMessage(message: ChatMessage) {
    const msg = document.createElement("div");
    msg.className = "msg " +
        (message.sender === "You" ? "user" :
            message.sender === "Bot" ? "bot" : "map");
    msg.textContent = `${message.sender}: ${message.text}`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Display all messages from history
function displayChatHistory() {
    chatMessages.innerHTML = ''; // Clear existing messages
    chatHistory.forEach(message => {
        displayMessage(message);
    });
}

// Add button to clear chat history
function addClearHistoryButton() {
    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear History";
    clearButton.style.position = "absolute";
    clearButton.style.top = "5px";
    clearButton.style.right = "5px";
    clearButton.style.fontSize = "12px";
    clearButton.style.padding = "3px 6px";
    clearButton.style.background = "#f44336";
    clearButton.style.color = "white";
    clearButton.style.border = "none";
    clearButton.style.borderRadius = "4px";
    clearButton.style.cursor = "pointer";

    clearButton.addEventListener("click", () => {
        chatHistory.length = 0;
        localStorage.removeItem(STORAGE_KEY);
        displayChatHistory();
    });

    document.getElementById("chatbox")!.appendChild(clearButton);
}

addClearHistoryButton();

// Map click → show coordinates in chat
map.on("click", (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    addChatMessage("Map", `You clicked at [${lat.toFixed(2)}, ${lng.toFixed(2)}]`);
});