const socket = io();

socket.on('connect', () => {
    console.log('Connected to the server');
});

socket.on('message', (data) => {
    console.log('Message from server:', data);
});

function sendMessage(message: string) {
    socket.emit('message', message);
}

// Example usage
const messageInput = document.getElementById('messageInput') as HTMLInputElement;
const sendButton = document.getElementById('sendButton') as HTMLButtonElement;

sendButton.addEventListener('click', () => {
    const message = messageInput.value;
    sendMessage(message);
    messageInput.value = '';
});