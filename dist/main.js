console.log("Script execution started");
// Debug function
function debug(msg, data) {
    console.log(`[DEBUG] ${msg}`, data || '');
    // Also add to DOM for mobile debugging
    const debugDiv = document.getElementById('debug-console') || createDebugConsole();
    const msgEl = document.createElement('div');
    msgEl.textContent = `${msg} ${data ? JSON.stringify(data) : ''}`;
    debugDiv.appendChild(msgEl);
    // Keep only latest 10 messages
    while (debugDiv.children.length > 10) {
        debugDiv.removeChild(debugDiv.firstChild);
    }
}
// Create debug console element
function createDebugConsole() {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'debug-console';
    debugDiv.style.position = 'fixed';
    debugDiv.style.top = '10px';
    debugDiv.style.left = '10px';
    debugDiv.style.width = '80%';
    debugDiv.style.maxHeight = '150px';
    debugDiv.style.overflow = 'auto';
    debugDiv.style.background = 'rgba(0,0,0,0.7)';
    debugDiv.style.color = 'white';
    debugDiv.style.fontSize = '12px';
    debugDiv.style.padding = '5px';
    debugDiv.style.zIndex = '1000';
    debugDiv.style.fontFamily = 'monospace';
    document.body.appendChild(debugDiv);
    return debugDiv;
}
// Init map
debug("Initializing map");
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);
debug("Map initialized");
// Chat handling
debug("Getting DOM elements");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatForm = document.getElementById("chat-form");
// Log DOM elements
debug("DOM elements found", {
    chatMessages: !!chatMessages,
    chatInput: !!chatInput,
    chatForm: !!chatForm
});
if (!chatMessages || !chatInput || !chatForm) {
    debug("ERROR: Missing DOM elements", {
        chatMessages: document.getElementById("chat-messages"),
        chatInput: document.getElementById("chat-input"),
        chatForm: document.getElementById("chat-form")
    });
    throw new Error("Critical DOM elements not found");
}
const STORAGE_KEY = 'map-chat-history';
// Load chat history from localStorage
function loadChatHistory() {
    debug("Loading chat history");
    try {
        const savedHistory = localStorage.getItem(STORAGE_KEY);
        debug("Saved history", savedHistory);
        const parsed = savedHistory ? JSON.parse(savedHistory) : [];
        debug("Parsed history", parsed);
        return parsed;
    }
    catch (e) {
        debug("Error loading chat history", e);
        return [];
    }
}
// Save chat history to localStorage
function saveChatHistory(messages) {
    debug("Saving chat history", messages.length);
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
    catch (e) {
        debug("Error saving chat history", e);
    }
}
// Initialize with saved history
const chatHistory = loadChatHistory();
debug("Chat history loaded", chatHistory.length);
// Display all messages from history
function displayChatHistory() {
    debug("Displaying chat history");
    chatMessages.innerHTML = ''; // No more error
    chatHistory.forEach((message, i) => {
        debug(`Displaying message ${i + 1}/${chatHistory.length}`);
        displayMessage(message);
    });
}
displayChatHistory();
// Auto-expand input box
chatInput.addEventListener("input", () => {
    debug("Input changed");
    chatInput.style.height = "auto";
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});
chatForm.addEventListener("submit", (e) => {
    debug("Form submitted");
    e.preventDefault();
    if (chatInput.value.trim()) {
        const userMessage = chatInput.value.trim();
        debug("User message", userMessage);
        addChatMessage("You", userMessage);
        // Simple echo response
        const botMessage = `You said: "${userMessage}"`;
        debug("Bot response", botMessage);
        addChatMessage("Bot", botMessage);
        chatInput.value = "";
        chatInput.style.height = "auto"; // Reset height
    }
    else {
        debug("Empty message, not sending");
    }
});
function addChatMessage(sender, text) {
    debug(`Adding message from ${sender}`, text);
    // Create a new message object
    const messageObj = {
        sender,
        text,
        timestamp: Date.now()
    };
    // Add to history array
    chatHistory.push(messageObj);
    debug("New history length", chatHistory.length);
    // Save to localStorage
    saveChatHistory(chatHistory);
    // Display in UI
    displayMessage(messageObj);
}
// Display a single message in the chat UI
function displayMessage(message) {
    debug("Displaying message", message);
    try {
        const msg = document.createElement("div");
        msg.className = "msg";
        if (message.sender === "You") {
            msg.className += " user";
        }
        else if (message.sender === "Bot") {
            msg.className += " bot";
        }
        else {
            msg.className += " map";
        }
        msg.textContent = `${message.sender}: ${message.text}`;
        chatMessages.appendChild(msg); // No more error
        chatMessages.scrollTop = chatMessages.scrollHeight; // No more error
        debug("Message displayed successfully");
    }
    catch (e) {
        debug("Error displaying message", e);
    }
}
// Add button to clear chat history
function addClearHistoryButton() {
    debug("Adding clear history button");
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
        debug("Clear history clicked");
        chatHistory.length = 0;
        localStorage.removeItem(STORAGE_KEY);
        displayChatHistory();
        debug("History cleared");
    });
    const chatbox = document.getElementById("chatbox");
    if (chatbox) {
        chatbox.appendChild(clearButton);
        debug("Clear button added");
    }
    else {
        debug("ERROR: Chatbox not found for clear button");
    }
}
addClearHistoryButton();
// Map click → show coordinates in chat
map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    debug("Map clicked", { lat, lng });
    addChatMessage("Map", `You clicked at [${lat.toFixed(2)}, ${lng.toFixed(2)}]`);
});
debug("Script execution completed");
export {};
