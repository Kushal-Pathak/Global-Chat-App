// Check if username is in local storage if not then prompt for new one and store in local storage
let current_username = localStorage.getItem("chat_username");
if (!current_username) {
  current_username = prompt("Enter your name", "GUEST") || "GUEST";
  localStorage.setItem("chat_username", current_username);
}

// Check if user id is in local storage if not then create and store new one
let current_user_id = localStorage.getItem("userID");
if (!current_user_id) {
  // Generate a random number as user id
  current_user_id = Math.floor(Math.random() * 1000000).toString();
  localStorage.setItem("chat_user_id", current_user_id);
}

// Dynamically create message UI
function createMessageUI(data) {
  const { user_id, username, message } = data;
  if ((!user_id, !username || !message)) return "";

  const isSent = user_id === current_user_id;
  const initials = username.slice(0, 2).toUpperCase();
  const safeUsername = escapeHTML(username);
  const safeMessage = escapeHTML(message);

  if (isSent) {
    return `<div class="message-wrapper sent">
                    <div class="message">${safeMessage}</div>
                <span class="initials profile" title="${safeUsername}">${initials}</span>
            </div>`;
  } else {
    return `<div class="message-wrapper received">
                <span class="initials profile" title="${safeUsername}">${initials}</span>
                <div class="message">${safeMessage}</div>
            </div>`;
  }
}

// Sanitize username and message to prevent XSS attacks
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Decide between ws:// or wss:// 
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

// Build the full URL, e.g., wss://domain-name.com
const wsUrl = `${protocol}//${window.location.host}`;

// Create the WebSocket
const ws = new WebSocket(wsUrl);

// Get send button and the message input field
const sendBtn = document.getElementById("send-btn");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");

// Listen for clicks on the send button
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") sendMessage();
});

function sendMessage() {
  const messageText = messageInput.value.trim();
  if (messageText) {
    // Check for the wildcard command to change the username.
    if (messageText.startsWith("/nick ")) {
      // Extract the new username after the command
      const newName = messageText.substring(6).trim();
      if (newName) {
        current_username = newName;
        localStorage.setItem("chat_username", current_username);
        alert(`Your name has been changed to ${current_username}`);
      }
      messageInput.value = "";
      return;
    }

    const payload = {
      user_id: current_user_id,
      username: current_username,
      message: messageText,
    };

    ws.send(JSON.stringify(payload));
    messageInput.value = "";
  }
}

// Listen for incoming messages from the server
ws.onmessage = (event) => {
  const messages = JSON.parse(event.data);
  // Dynamically create and embed message in chat box
  chatBox.innerHTML = messages.map(createMessageUI).join("");
  // Scroll to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
};

// Dynamically generate footer content
const chat_footer = document.querySelector("#chat-footer");
const footer_text = `&copy; ${new Date().getFullYear()} DEV. KUSHAL`;
chat_footer.innerHTML = footer_text;
