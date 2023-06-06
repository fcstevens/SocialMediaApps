// Assuming you have access to the 'users.js' module and its functions

function changeUsername() {
  // Get the new username from the input field
  const newUsername = document.getElementById('new-username').value;

  // Get the currently logged-in user (you can modify this based on your authentication mechanism)
  const currentUser = 'user1'; // Assuming you have the currently logged-in user

  // Update the username using the 'updateUsername' function from 'users.js'
  users.updateUsername(currentUser, newUsername);

  async function updateUsername(username, newUsername) {
    try {
      const user = findUser(username);
      if (user) {
        user.username = newUsername;
        console.log(user); // Log the updated user details

        // Perform the necessary operations to update the username in the database
        // For example, you can call a function from the models/User.js module to update the username in the database.
        await changeUsername(user._id, newUsername);
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.log('Error updating username:', error);
    }
  }

  // Clear the input field
  document.getElementById('new-username').value = '';

  // Display a success message or perform any other desired actions
  alert('Username changed successfully!');
  console.log('Username Changed');
}

// Inside client.js
document.addEventListener('DOMContentLoaded', () => {
  // ...existing code...

  // Handle message button click
  const messageButtons = document.querySelectorAll('.message-btn');
  messageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const petId = button.dataset.petId;
      const messageInput = button.parentElement.querySelector('.message-input');
      const message = messageInput.value.trim();

      if (message) {
        const data = { petId, message };
        sendMessage(data);
      }
    });
  });
});

function sendMessage(data) {
  fetch('/send-message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(result => {
      console.log('Message Sent')
      // Handle the response (e.g., display success message, update UI, etc.)
    })
    .catch(error => {
      // Handle the error (e.g., display error message, log, etc.)
      console.log('Message failed to send')
    });
}
