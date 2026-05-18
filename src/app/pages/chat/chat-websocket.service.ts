import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { Stomp, CompatClient } from '@stomp/stompjs';
import { environment } from 'src/environments/environment';
import * as SockJS from 'sockjs-client';


export interface ChatMessage {
    id?: number;
    senderId: string;
    senderName: string;
    receiverId?: string;
    roomId?: string;
    content: string;
    messageType: 'CHAT' | 'JOIN' | 'LEAVE' | 'READ_RECEIPT' | 'FILE' | 'IMAGE' | 'ONLINE' | 'OFFLINE' | 'TYPING' | 'VOICE';
    timestamp?: Date;
    isRead?: boolean;
    unreadCount?: number;
    isOnline?: boolean;
    lastSeen?: any;
}

export interface ChatRoom {
    roomId: string;
    user1Id: string;
    user2Id: string;
    createdAt: Date;
    lastMessageAt: Date;
}

export interface UserInfo {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    isOnline?: boolean;
    lastSeen?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ChatWebSocketService {
    private stompClient: CompatClient | null = null;
    private messageSubject = new Subject<ChatMessage>();
    private userStatusSubject = new Subject<ChatMessage>();
    private connectionStatus = new BehaviorSubject<boolean>(false);

 private readonly SOCKET_URL =  environment.gatewayUrl + '/communication-service/ws';
    private readonly API_URL = environment.gatewayUrl + environment.chatApiUrl;
    private readonly FILE_API_URL = this.API_URL + '/files';



    public messages$ = this.messageSubject.asObservable();
    public userStatus$ = this.userStatusSubject.asObservable();
    public connected$ = this.connectionStatus.asObservable();

    constructor(private http: HttpClient, private ngZone: NgZone) { }

    connect(userId: string, userName: string): void {
        if (this.stompClient && this.stompClient.connected) {
            console.log('Already connected');
            return;
        }

        const socket = new SockJS(this.SOCKET_URL);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = (msg) => console.log('🛡️ STOMP:', msg);

        this.stompClient.connect({},
            (frame : any) => {
                console.log('✅ STOMP Connected: ' + frame);
                this.connectionStatus.next(true);

                // Subscribe to private messages
                const topic = `/topic/messages/${userId}`;
                console.log('📡 Subscribing to private topic:', topic);
                this.stompClient!.subscribe(topic, (message) => {
                    this.ngZone.run(() => {
                        console.log('📥 WebSocket FRAME RECEIVED on:', topic);
                        const chatMessage: ChatMessage = JSON.parse(message.body);
                        console.log('📥 Message content:', chatMessage.content);
                        this.messageSubject.next(chatMessage);
                    });
                });

                // Subscribe to public topic (for join/leave notifications)
                console.log('📡 Subscribing to public topic: /topic/public');
                this.stompClient!.subscribe('/topic/public', (message) => {
                    this.ngZone.run(() => {
                        const chatMessage: ChatMessage = JSON.parse(message.body);
                        this.messageSubject.next(chatMessage);
                    });
                });

                // Subscribe to user status updates
                console.log('📡 Subscribing to status topic: /topic/user-status');
                this.stompClient!.subscribe('/topic/user-status', (message) => {
                    this.ngZone.run(() => {
                        const statusMessage: ChatMessage = JSON.parse(message.body);
                        this.userStatusSubject.next(statusMessage);
                    });
                });

                // Send join notification
                this.sendJoinNotification(userId, userName);
            },
            (error :any) => {
                console.error('Connection error:', error);
                this.connectionStatus.next(false);
                // Reconnect after 5 seconds
                setTimeout(() => this.connect(userId, userName), 5000);
            }
        );
    }

    disconnect(userId: string, userName: string): void {
        if (this.stompClient) {
            this.sendLeaveNotification(userId, userName);
            this.stompClient.disconnect(() => {
                console.log('Disconnected');
                this.connectionStatus.next(false);
            });
        }
    }

    sendMessage(message: ChatMessage): void {
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(message));
        } else {
            console.error('Not connected to WebSocket');
        }
    }

    private sendJoinNotification(userId: string, userName: string): void {
        const joinMessage: ChatMessage = {
            senderId: userId,
            senderName: userName,
            content: `${userName} joined the chat`,
            messageType: 'JOIN'
        };
        if (this.stompClient && this.stompClient.connected) {
            this.stompClient.send('/app/chat.addUser', {}, JSON.stringify(joinMessage));
        }
    }

    private sendLeaveNotification(userId: string, userName: string): void {
        const leaveMessage: ChatMessage = {
            senderId: userId,
            senderName: userName,
            content: `${userName} left the chat`,
            messageType: 'LEAVE'
        };
        this.sendMessage(leaveMessage);
    }

    // REST API methods
    getUserChatRooms(userId: string): Observable<ChatRoom[]> {
        return this.http.get<ChatRoom[]>(`${this.API_URL}/rooms/${userId}`);
    }

    getRoomMessages(roomId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.API_URL}/messages/${roomId}`);
    }

    getUnreadMessages(userId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.API_URL}/unread/${userId}`);
    }

    getUnreadCount(userId: string): Observable<number> {
        return this.http.get<number>(`${this.API_URL}/unread/count/${userId}`);
    }

    markAsRead(messageId: number): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/messages/${messageId}/read`, {});
    }

    markRoomAsRead(roomId: string, userId: string): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/rooms/${roomId}/read/${userId}`, {});
    }

    getOrCreateRoom(user1Id: string, user2Id: string): Observable<string> {
        return this.http.get(`${this.API_URL}/room/${user1Id}/${user2Id}`, { responseType: 'text' });
    }

    getAllUsers(): Observable<UserInfo[]> {
        return this.http.get<UserInfo[]>(`${this.API_URL}/users`);
    }

    getRecentConversations(userId: string): Observable<ChatMessage[]> {
        return this.http.get<ChatMessage[]>(`${this.API_URL}/rooms/${userId}/recent`);
    }

    uploadFile(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        return this.http.post(this.FILE_API_URL + '/upload', formData, { responseType: 'text' });
    }

    deleteRoomMessages(roomId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/messages/${roomId}`);
    }
}
