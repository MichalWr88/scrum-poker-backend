export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Message {
    senderId: string;
    content: string;
    timestamp: Date;
}

export interface SocketData {
    user: User;
    message: Message;
}