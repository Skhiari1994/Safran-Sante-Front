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
    messageType: 'CHAT' | 'JOIN' | 'LEAVE' | 'READ_RECEIPT' | 'FILE' | 'IMAGE' | 'ONLINE' | 'OFFLINE' | 'TYPING' | 'VOICE' | 'DELETE' | 'REACTION';
    timestamp?: Date;
    isRead?: boolean;
    unreadCount?: number;
    isOnline?: boolean;
    lastSeen?: any;
    readAt?: any;
    replyToId?: number;
    reactions?: { userId: string; emoji: string }[];
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
    private connecting = false;
    private manualClose = false;

 private readonly SOCKET_URL =  environment.gatewayUrl + '/communication-service/ws';
    private readonly API_URL = environment.gatewayUrl + environment.chatApiUrl;
    private readonly FILE_API_URL = this.API_URL + '/files';



    public messages$ = this.messageSubject.asObservable();
    public userStatus$ = this.userStatusSubject.asObservable();
    public connected$ = this.connectionStatus.asObservable();

    constructor(private http: HttpClient, private ngZone: NgZone) { }

    connect(userId: string, userName: string): void {
        // déjà connecté, ou connexion en cours (layout et page du chat peuvent l'appeler en même temps)
        if (this.connecting || (this.stompClient && this.stompClient.connected)) {
            return;
        }
        this.connecting = true;
        this.manualClose = false;

        const socket = new SockJS(this.SOCKET_URL);
        this.stompClient = Stomp.over(socket);
        this.stompClient.debug = (msg) => console.log('🛡️ STOMP:', msg);

        this.stompClient.connect({},
            (frame : any) => {
                console.log('✅ STOMP Connected: ' + frame);
                this.connecting = false;
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
                this.connecting = false;
                this.connectionStatus.next(false);
                // Reconnect after 5 seconds (sauf fermeture volontaire)
                if (!this.manualClose) {
                    setTimeout(() => this.connect(userId, userName), 5000);
                }
            }
        );
    }

    disconnect(userId: string, userName: string): void {
        if (this.stompClient) {
            this.manualClose = true;
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
    /** Envoi par REST : le serveur enregistre le message, renvoie son id et le distribue au destinataire. */
    sendMessageRest(message: ChatMessage): Observable<ChatMessage> {
        return this.http.post<ChatMessage>(`${this.API_URL}/messages`, message);
    }

    /** Pose / remplace / retire (même émoji) la réaction de l'utilisateur sur un message. */
    reactToMessage(messageId: number, userId: string, emoji: string): Observable<void> {
        return this.http.put<void>(`${this.API_URL}/message/${messageId}/reaction`, null, { params: { userId, emoji } });
    }

    deleteMessage(messageId: number, userId: string): Observable<void> {
        return this.http.delete<void>(`${this.API_URL}/message/${messageId}`, { params: { userId } });
    }

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
        return this.http.get<UserInfo[]>(`${this.API_URL}/contacts`);
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
