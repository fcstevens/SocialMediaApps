document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Fetch and display messages
    getMessages();
});

function getMessages() {
    fetch('/get-messages')
        .then(response => response.json())
        .then(data => {
            const messagesList = document.getElementById('messages-list');
            messagesList.innerHTML = '';

            if (data && data.messages.length > 0) {
                data.messages.forEach(message => {
                    const listItem = document.createElement('li');
                    listItem.textContent = `From: ${message.sender.username}, Pet: ${message.pet.name}, Message: ${message.message}`;
                    messagesList.appendChild(listItem);
                });
            } else {
                const listItem = document.createElement('li');
                listItem.textContent = 'No messages found';
                messagesList.appendChild(listItem);
            }
        })
        .catch(error => {
            console.error('Error retrieving messages:', error);
        });
}
