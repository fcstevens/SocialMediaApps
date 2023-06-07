document.addEventListener('DOMContentLoaded', getMessages);

async function getMessages() {
    const response = await fetch('/getmessages');
    const { messages } = await response.json();

    const messagesList = document.getElementById('messages-list');

    if (messages.length === 0) {
        messagesList.innerHTML = '<p>No messages.</p>';
    } else {
        let html = '';
        messages.forEach(message => {
            html += `
        <li>
          <strong>From:</strong> ${message.sender}<br>
          <strong>To:</strong> ${message.recipient}<br>
          <strong>Message:</strong> ${message.message}
        </li>
      `;
        });
        messagesList.innerHTML = html;
    }
}

// Function to send a message
async function sendMessage() {
    const sender = document.getElementById('sender').value;
    const recipient = document.getElementById('recipient').value;
    const message = document.getElementById('message').value;

    const response = await fetch('/sendmessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sender, recipient, message })
    });

    if (response.ok) {
        document.getElementById('message').value = '';
        getMessages();
    }
}
