export interface ChatUser {
    id?: string;
    image?: string;
    name: string;
    message: string;
    time: string;
    color: string;
    unreadCount?: number;
    isOnline?: boolean;
    lastSeen?: string;
    isTyping?: boolean;
}

export interface ChatMessage {
    id?: number;
    replyToId?: number;
    readTime?: string;
    reactions?: { userId: string; emoji: string }[];
    failed?: boolean;
    payload?: any;
    align?: string;
    name?: string;
    message: string;
    time: string;
    isRead?: boolean;
    messageType?: string;
    date?: Date;
}
