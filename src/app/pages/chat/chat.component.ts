import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, TemplateRef } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { ChatUser, ChatMessage } from './chat.model';
import { chatData, chatMessagesData } from './data';
import { ChatWebSocketService, ChatMessage as WSChatMessage } from './chat-websocket.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbModalRef, NgbNavChangeEvent } from '@ng-bootstrap/ng-bootstrap';
 
@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit, OnDestroy {
 
  @ViewChild('scrollEleRecent') scrollEleRecent: any;
  @ViewChild('scrollRef') scrollRef: any;
  @ViewChild('deleteModalTpl') deleteModalTpl!: TemplateRef<unknown>;
  @ViewChild('lightboxTpl') lightboxTpl!: TemplateRef<unknown>;

  private deleteModalRef: NgbModalRef | null = null;
  private lightboxModalRef: NgbModalRef | null = null;
 
  username = '';
  currentUserId: string = '';
  currentUserName: string = '';
  selectedUser: ChatUser | null = null;
  selectedImage: string = '';
  currentRoomId: string | null = null;
  chatServerUrl: string = environment.gatewayUrl + '/communication-service';
 
  // bread crumb items
  breadCrumbItems: Array<{}> = [];
  chatData: ChatUser[] = [];
  chatMessagesData: ChatMessage[] = [];
  // Form submit
  chatSubmit: boolean = false;
  usermessage: string = '';
  emoji: any = '';
  searchMessageQuery = '';
  showSearchInput = false;
  activeTab: string = 'Groupes';
  formData!: UntypedFormGroup;
 
  get totalUnreadCount(): number {
    return this.chatData ? this.chatData.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0) : 0;
  }
 
 
  // WebSocket
  private messageSubscription: Subscription = new Subscription();
  private connectionSubscription: Subscription = new Subscription();
  isConnected = false;
 
  // Typing indicator
  isOtherUserTyping = false;
  private isMyTypingSent = false;
  private myTypingTimeout: any;
 
  // Sound
  isSoundEnabled = true;
  private typingAudio: HTMLAudioElement | null = null;
 
  // Voice Recording
  isRecording = false;
  recordingTime = 0;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingInterval: any;
  private recordingCancelled = false;
 
  // Contacts
  contactGroups: { letter: string; users: any[] }[] = [];
 
  constructor(
    public formBuilder: UntypedFormBuilder,
    private chatWebSocketService: ChatWebSocketService,
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
  ) {

  }
 
  ngOnInit() {
    this.activeTab = 'Groupes';
    this.breadCrumbItems = [{ label: 'masu' }, { label: 'Chat', active: true }];
    this.formData = this.formBuilder.group({
      message: ['', [Validators.required]],
    });
    this.onListScroll();
 
    // 1. Get User Info
    const userInfo = this._getCurrentUser();
    this.currentUserId = userInfo.id;
    this.currentUserName = userInfo.name;
 
    // Header MUST be empty until a chat is selected
    this.username = '';
    this.selectedUser = null;
    this.chatMessagesData = [];
 
    // Check localStorage for last chat
    const lastUserId = localStorage.getItem('chat_last_user_id');
    const lastUserName = localStorage.getItem('chat_last_user_name');
    const lastGroupId = localStorage.getItem('chat_last_group_id');
    const lastGroupName = localStorage.getItem('chat_last_group_name');
 
    // 2. Initialize WebSocket
    this._initWebSocket();
 
    // 3. Load data
    this._loadContacts();
    this._loadRecentConversations();
 
    // 4. Attempt to resume last active (if not chatting with self)
    if (lastGroupId && lastGroupName) {
      console.log('🔄 Resuming last group chat:', lastGroupName);
      setTimeout(() => this.chatGroup(lastGroupName, lastGroupId), 800);
    } else if (lastUserId && lastUserName && lastUserId !== this.currentUserId) {
      console.log('🔄 Resuming last active chat with:', lastUserName);
      setTimeout(() => this.chatUser({ id: lastUserId, displayName: lastUserName }), 500);
    }
 
    // Changer l'onglet vers 'Chat' après 2 secondes
    setTimeout(() => {
      this.activeTab = 'Chat';
      console.log('📑 [DEBUG] Tab changed to:', this.activeTab);
    }, 1000);
  }
 
  onClickChat() {
    this.activeTab = 'Chat';
  }
 
  chatGroup(name: string, roomId: string) {
    console.log('🏘️ chatGroup() called for:', name, 'Room:', roomId);
    this.username = name;
    this.chatMessagesData = [];
    this.selectedUser = null;
    this.currentRoomId = roomId;
 
    // Save state
    localStorage.setItem('chat_last_group_id', roomId);
    localStorage.setItem('chat_last_group_name', name);
    localStorage.removeItem('chat_last_user_id');
    localStorage.removeItem('chat_last_user_name');
 
    // Load history
    this._loadChatHistory(roomId);
    this.onListScroll();
  }
 
  private _loadRecentConversations() {
    if (!this.currentUserId) {
      return;
    }
 
    this.chatWebSocketService.getRecentConversations(this.currentUserId).subscribe({
      next: (conversations) => {
        if (conversations.length === 0) {
          console.warn('⚠️ No conversations found for user');
        }
        this.chatData = conversations.map(conv => {
          let lastMessage = conv.content || '';
          if (lastMessage.includes('/api/chat/files/view/')) {
            lastMessage = 'Vous avez reçu un fichier';
          }
 
          return {
            id: conv.senderId,
            name: conv.senderName || 'Unknown User',
            message: lastMessage,
            time: this._formatTimestamp(conv.timestamp),
            color: 'success',
            unreadCount: conv.unreadCount || 0,
            isOnline: conv.isOnline,
            lastSeen: this._formatTimestamp(conv.lastSeen)
          };
        });
 
        // FORCE UI REFRESH
        this.cdr.detectChanges();
 
        // AUTO-SELECT logic
        if (!this.username && this.chatData.length > 0) {
          const first = this.chatData[0];
          console.log('⚡ Auto-selecting first conversation:', first.name);
          this.chatUser({ id: first.id, displayName: first.name, isOnline: first.isOnline, lastSeen: first.lastSeen });
        }
      },
      error: (error) => {
        console.error('❌ Error loading recent conversations:', error);
      }
    });
  }
 
  private _loadContacts() {
    console.log('👥 Loading contact list...');
    this.chatWebSocketService.getAllUsers().subscribe({
      next: (users) => {
        console.log('👥 Contacts received:', users.length);
 
        // Filter out current user
        const otherUsers = users.filter(u => u.id !== this.currentUserId);
 
        // Group by first letter
        const groups: { [key: string]: any[] } = {};
        otherUsers.forEach(user => {
          let name = user.username;
          if (user.firstName) {
            name = user.firstName;
            if (user.lastName) {
              name += ' ' + user.lastName;
            }
          }
          name = name.trim();
 
          // Check regex for ID pattern (8 digits, - or _, 3 digits)
          const idPattern = /^\d{8}[-_]\d{3}$/;
          if (user.username && idPattern.test(user.username)) {
            // Using \u202A (LRE) and \u202C (PDF) to force LTR for the ID part
            name = `${name} \u202A(${user.username})\u202C`;
          }
 
          const letter = name.charAt(0).toUpperCase();
          if (!groups[letter]) {
            groups[letter] = [];
          }
          groups[letter].push({
            ...user,
            displayName: name,
            initial: letter,
            isOnline: user.isOnline,
            lastSeen: this._formatTimestamp(user.lastSeen)
          });
        });
 
        // Convert to array and sort
        this.contactGroups = Object.keys(groups).sort().map(letter => ({
          letter,
          users: groups[letter]
        }));
      },
      error: (error) => console.error('❌ Error loading contacts:', error)
    });
  }
 
  chatUser(userData: any) {
    const userId = userData.id;
    const userName = userData.displayName;
    localStorage.setItem('chat_last_user_id', userId);
    localStorage.setItem('chat_last_user_name', userName);
    this.chatUsername(userName, {
      id: userId,
      name: userName,
      message: '',
      time: '',
      color: '',
      isOnline: userData.isOnline,
      lastSeen: userData.lastSeen
    });
  }
 
  onTabSelect(ev: NgbNavChangeEvent): void {
    if (ev.nextId != null) {
      this.activeTab = String(ev.nextId);
    }
    console.log('📑 [DEBUG] Tab changed to:', this.activeTab);
  }
 
  ngAfterViewInit() {
    if (this.scrollEleRecent) {
      console.log('👀 [LOG_DEBUG] scrollEleRecent found. SimpleBar:', this.scrollEleRecent.SimpleBar);
    }
 
    if (this.scrollEleRecent && this.scrollEleRecent.SimpleBar) {
      this.scrollEleRecent.SimpleBar.getScrollElement().scrollTop = 100;
    }
    if (this.scrollRef && this.scrollRef.SimpleBar) {
      this.scrollRef.SimpleBar.getScrollElement().scrollTop = 200;
    }
  }
 
  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.connectionSubscription) {
      this.connectionSubscription.unsubscribe();
    }
    if (this.currentUserId && this.currentUserName) {
      this.chatWebSocketService.disconnect(this.currentUserId, this.currentUserName);
    }
  }
 
  private _initWebSocket() {
    // Get current user from app session (same store as login) or chat fallback id
    const userInfo = this._getCurrentUser();
    this.currentUserId = userInfo.id;
    this.currentUserName = userInfo.name;
 
    console.log('🛠️ WebSocket Init - User:', this.currentUserName, 'ID:', this.currentUserId);
 
    // Connect to WebSocket
    this.chatWebSocketService.connect(this.currentUserId, this.currentUserName);
 
    // Subscribe to connection status
    this.connectionSubscription = this.chatWebSocketService.connected$.subscribe(
      connected => {
        this.isConnected = connected;
        console.log('🌐 WebSocket Connection Status:', connected ? 'CONNECTED' : 'DISCONNECTED');
      }
    );
 
    // Subscribe to incoming messages
    this.messageSubscription = this.chatWebSocketService.messages$.subscribe(
      (message: WSChatMessage) => {
        this._handleIncomingMessage(message);
      }
    );
 
    // Subscribe to user status updates
    this.chatWebSocketService.userStatus$.subscribe(status => {
      this._handleStatusUpdate(status);
    });
  }
 
  private _handleStatusUpdate(status: WSChatMessage) {
    const isOnline = status.messageType === 'ONLINE';
    console.log('📡 Status Update:', status.senderId, isOnline ? 'ONLINE' : 'OFFLINE');
 
    // 1. Update in Recent Chat List (chatData)
    this.chatData = this.chatData.map(user => {
      if (user.id === status.senderId) {
        return {
          ...user,
          isOnline: isOnline,
          lastSeen: this._formatTimestamp(status.timestamp)
        };
      }
      return user;
    });
 
    // 2. Update in Contact List
    this.contactGroups = this.contactGroups.map(group => ({
      ...group,
      users: group.users.map((u: any) => {
        if (u.id === status.senderId) {
          return {
            ...u,
            isOnline: isOnline,
            lastSeen: this._formatTimestamp(status.timestamp)
          };
        }
        return u;
      })
    }));
 
    // 3. Update active conversation header
    if (this.selectedUser && this.selectedUser.id === status.senderId) {
      this.selectedUser = {
        ...this.selectedUser,
        isOnline: isOnline,
        lastSeen: this._formatTimestamp(status.timestamp)
      };
    }
  }

  /** User object saved by login (`localStorage`) or legacy session (`sessionStorage`). */
  private _readStoredAppUser(): { id: string; name: string } | null {
    const raw =
      localStorage.getItem('currentUser') ||
      sessionStorage.getItem('currentUser');
    if (!raw) {
      return null;
    }
    try {
      const u = JSON.parse(raw) as Record<string, unknown>;
      const id =
        (u['id'] != null && String(u['id'])) ||
        (typeof u['username'] === 'string' && u['username']) ||
        (typeof u['email'] === 'string' && u['email']) ||
        (typeof u['useLogin'] === 'string' && u['useLogin']) ||
        '';
      const name =
        (typeof u['firstName'] === 'string' && u['firstName']) ||
        (typeof u['username'] === 'string' && u['username']) ||
        (typeof u['useLogin'] === 'string' && u['useLogin']) ||
        (typeof u['email'] === 'string' && u['email']) ||
        '';
      if (!id && !name) {
        return null;
      }
      return { id: id || 'anonymous', name: name || 'User' };
    } catch {
      return null;
    }
  }

  private _getCurrentUser(): { id: string; name: string } {
    const stored = this._readStoredAppUser();
    if (stored) {
      return stored;
    }

    // fallback for local testing - MUST BE STABLE
    console.warn('⚠️ No logged-in user in storage, using persistent chat id...');
    let persistentId = localStorage.getItem('chat_stable_id');
    if (!persistentId) {
      // If we have an old session ID, migrate it to localStorage
      const oldSessionId = sessionStorage.getItem('chat_userId');
      persistentId = oldSessionId || ('user-' + Math.floor(Math.random() * 1000000));
      localStorage.setItem('chat_stable_id', persistentId);
      console.log('🆕 Set persistent ID:', persistentId);
    } else {
      console.log('✅ Found existing persistent ID:', persistentId);
    }
 
    return {
      id: persistentId,
      name: this.username // Default 'Steven Franklin'
    };
  }
 
  private _handleIncomingMessage(message: WSChatMessage) {
    console.log('📬 NEW MESSAGE RECEIVED from WebSocket:', message);
 
    // 1. Handle READ_RECEIPT separately
    if (this.currentRoomId && message.roomId === this.currentRoomId && message.messageType === 'READ_RECEIPT') {
      console.log('📖 READ RECEIPT received. Updating UI checks.');
      this.chatMessagesData = this.chatMessagesData.map(msg => {
        if (msg.align === 'right') {
          return { ...msg, isRead: true };
        }
        return msg;
      });
      this._loadRecentConversations();
      return;
    }
 
    // 2. Handle TYPING status
    if (message.messageType === 'TYPING') {
      const isTyping = (message.content === 'START');
 
      // Update active chat indicator
      if (this.currentRoomId && message.roomId === this.currentRoomId) {
        if (message.senderId !== this.currentUserId) {
          this.isOtherUserTyping = isTyping;
          this._manageTypingSound(isTyping);
          if (this.isOtherUserTyping) {
            this.onListScroll();
          }
        }
      }
 
      // Update sidebar status
      this.chatData = this.chatData.map(user => {
        if (user.id === message.senderId) {
          return { ...user, isTyping: isTyping };
        }
        return user;
      });
      return;
    }
 
    // 3. Handle normal messages (CHAT, FILE, IMAGE, VOICE)
    const isVisibleType = ['CHAT', 'FILE', 'IMAGE', 'VOICE'].includes(message.messageType);
 
    if (this.currentRoomId && message.roomId === this.currentRoomId && isVisibleType) {
      // If we received a message, they stopped typing
      this.isOtherUserTyping = false;
      this._manageTypingSound(false);
 
      // Skip if it's our own message (we already added it locally)
      if (message.senderId === this.currentUserId) {
        console.log('⏭️ Skipping echo of own message');
        return;
      }
 
      console.log('✅ New message for current room, type:', message.messageType);
 
      const resolvedName = message.senderId === this.currentUserId
        ? this.currentUserName
        : (this.selectedUser?.name || message.senderName);
 
      const chatMsg: ChatMessage = {
        name: resolvedName,
        message: message.content,
        time: this._formatTimestamp(message.timestamp),
        isRead: message.isRead,
        align: undefined,
        messageType: message.messageType,
        date: message.timestamp ? new Date(message.timestamp) : new Date()
      };
 
      this.chatMessagesData = [...this.chatMessagesData, chatMsg];
      this.onListScroll();
 
      // PLAY SOUND for incoming message
      if (message.senderId !== this.currentUserId) {
        this._playSound('receive');
      }
 
      // Mark as read
      if (message.id) {
        this.chatWebSocketService.markAsRead(message.id).subscribe();
      }
      this._loadRecentConversations();
    } else {
      // Message for another room or no room active
      console.log('🔇 Updating sidebar only (room mismatch or inactive).');
      this._loadRecentConversations();
    }
  }
 
  private _formatTimestamp(timestamp: any): string {
    if (!timestamp) return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
 
    try {
      // If timestamp is a string or number
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }
 
  private _playSound(type: 'send' | 'receive') {
    if (!this.isSoundEnabled) return;
 
    let soundUrl = '';
    switch (type) {
      case 'send':
        // Modern "Pop" for sending
        soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3';
        break;
      case 'receive':
        // Clear "Ding" for receiving
        soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3';
        break;
    }
 
    if (soundUrl) {
      const audio = new Audio(soundUrl);
      audio.volume = 1;
      audio.play().catch(e => console.log('🔊 Sound blocked by browser policy.'));
    }
  }
 
  private _manageTypingSound(isTyping: boolean) {
    if (!this.isSoundEnabled) {
      if (this.typingAudio) {
        this.typingAudio.pause();
        this.typingAudio = null;
      }
      return;
    }
 
    if (isTyping) {
      if (!this.typingAudio) {
        // Message pop alert for typing
        this.typingAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        this.typingAudio.loop = true;
        this.typingAudio.volume = 0.4; // Softer for loop
        this.typingAudio.play().catch(e => console.log('🔊 Typing sound blocked.'));
      }
    } else {
      if (this.typingAudio) {
        this.typingAudio.pause();
        this.typingAudio = null;
      }
    }
  }
 
  get form() {
    return this.formData.controls;
  }
 
  private _fetchData() {
    this.chatData = [];
    this.chatMessagesData = [];
  }
 
  onListScroll() {
    if (this.scrollRef && this.scrollRef.SimpleBar) {
      setTimeout(() => {
        const scrollElement = this.scrollRef.SimpleBar.getScrollElement();
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      }, 200);
    }
  }
 
  chatUsername(name : any, user?: ChatUser) {
    this.username = name;
    this.usermessage = 'Hello';
    this.chatMessagesData = [];
 
    this.selectedUser = user || null;
 
    // START FETCHING HISTORY
    if (user && user.id) {
      // Save last chat user to LocalStorage
      localStorage.setItem('chat_last_user_id', user.id);
      localStorage.setItem('chat_last_user_name', name);
 
      this.currentRoomId = null; // Clear old room ID
      console.log('🔄 Requesting Room for:', this.currentUserId, 'and', user.id);
 
      // 1. Get Room ID (or create one)
      this.chatWebSocketService.getOrCreateRoom(this.currentUserId, user.id).subscribe(
        roomId => {
          console.log('🏠 ROOM FOUND/CREATED:', roomId);
          this.currentRoomId = roomId;
 
          // 2. Fetch History
          this._loadChatHistory(roomId);
 
          // 3. Mark all as read
          this.chatWebSocketService.markRoomAsRead(roomId, this.currentUserId).subscribe(() => {
            console.log('✅ Room marked as read');
            this._loadRecentConversations(); // Refresh sidebar after marking as read
          });
        },
        error => {
          console.error('❌ ERROR creating/getting room:', error);
        }
      );
    } else {
      console.error('❌ ERROR: No user ID provided in chatUsername()');
      // Default hello message
      this.usermessage = 'Hello';
      const currentDate = new Date();
      this.chatMessagesData.push({
        name: this.username,
        message: this.usermessage,
        time: currentDate.getHours() + ':' + currentDate.getMinutes()
      });
    }
  }
 
  private _loadChatHistory(roomId: string) {
    console.log('📜 FETCHING HISTORY for room:', roomId);
    this.chatWebSocketService.getRoomMessages(roomId).subscribe(
      messages => {
        console.log('📜 HISTORY RECEIVED:', messages.length, 'messages found');
        this.chatMessagesData = messages
          .filter(msg => msg.messageType === 'CHAT' || msg.messageType === 'FILE' || msg.messageType === 'IMAGE' || msg.messageType === 'VOICE')
          .map(msg => {
            // FIX: Use correctly decoded local names
            const resolvedName = msg.senderId === this.currentUserId
              ? this.currentUserName
              : (this.selectedUser?.name || msg.senderName);
 
            return {
              name: resolvedName,
              message: msg.content,
              time: this._formatTimestamp(msg.timestamp),
              isRead: msg.isRead,
              align: msg.senderId === this.currentUserId ? 'right' : undefined,
              messageType: msg.messageType,
              date: msg.timestamp ? new Date(msg.timestamp) : new Date()
            };
          });
        console.log('📜 UI updated with history. Scroll triggered.');
        this.cdr.detectChanges();
        this.onListScroll();
      },
      error => console.error('❌ Error loading chat history:', error)
    );
  }
 
  messageSave() {
    const message = String(this.formData.get('message')?.value ?? '');
    const currentDate = new Date();
 
    if (this.formData.valid && message && message.trim()) {
      const wsMessage: WSChatMessage = {
        senderId: this.currentUserId,
        senderName: this.currentUserName,
        receiverId: this.selectedUser?.id || undefined,
        roomId: this.currentRoomId || undefined,
        content: message.trim(),
        messageType: 'CHAT',
        timestamp: currentDate
      };
 
      console.log('📤 WebSocket Payload:', wsMessage);
 
      // Add locally immediately for snappy feel
      const localMsg: ChatMessage = {
        name: this.currentUserName,
        message: message.trim(),
        time: currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
        align: 'right'
      };
 
      this.chatMessagesData = [...this.chatMessagesData, localMsg];
      this.onListScroll();
 
      // PLAY SOUND for sending
      this._playSound('send');
 
      // Send via WebSocket
      this.chatWebSocketService.sendMessage(wsMessage);
 
      // Stop typing status
      this.sendTypingStatus('STOP');
      this.isMyTypingSent = false;
      if (this.myTypingTimeout) clearTimeout(this.myTypingTimeout);
 
      this.formData.reset();
      this.emoji = '';
 
      // --- IMMEDIATE SIDEBAR UPDATE (Sort & Content) ---
      if (this.selectedUser) {
        const existingIndex = this.chatData.findIndex(u => u.id === this.selectedUser?.id);
        const newSidebarItem: ChatUser = {
          id: this.selectedUser.id,
          name: this.selectedUser.name,
          message: message.trim(),
          time: localMsg.time,
          color: 'success',
          unreadCount: 0
        };
 
        if (existingIndex > -1) {
          this.chatData.splice(existingIndex, 1);
          this.chatData.unshift(newSidebarItem);
        } else {
          this.chatData.unshift(newSidebarItem);
        }
      }
 
    }
 
    // Update sidebar from backend after short delay to ensure DB handles the write
    setTimeout(() => {
      this._loadRecentConversations();
    }, 500);
  }
 
 
  // Delete Message
  deleteMessage(event: any) {
    event.target.closest('li').remove();
  }
 
  // Copy Message
  copyMessage(event: any) {
    navigator.clipboard.writeText(event.target.closest('li').querySelector('p').innerHTML);
  }
 
  // Delete All Message (Persistent)
  deleteAllMessage(_event?: Event): void {
    if (!this.currentRoomId) return;
    this.deleteModalRef = this.modalService.open(this.deleteModalTpl, { centered: true, backdrop: 'static' });
  }

  private closeDeleteModal(): void {
    this.deleteModalRef?.close();
    this.deleteModalRef = null;
  }
 
  confirmDelete() {
    if (!this.currentRoomId) return;
 
    this.chatWebSocketService.deleteRoomMessages(this.currentRoomId).subscribe({
      next: () => {
        console.log('🗑️ Conversation deleted successfully');
        this.chatMessagesData = [];
        this.onListScroll();
        this._loadRecentConversations(); // Refresh sidebar
        this.closeDeleteModal();
      },
      error: (err) => {
        console.error('❌ Error deleting conversation:', err);
        this.closeDeleteModal();
      }
    });
  }
 
  onTyping() {
    if (!this.selectedUser || !this.currentRoomId) return;
 
    if (!this.isMyTypingSent) {
      this.sendTypingStatus('START');
      this.isMyTypingSent = true;
    }
 
    if (this.myTypingTimeout) clearTimeout(this.myTypingTimeout);
    this.myTypingTimeout = setTimeout(() => {
      this.sendTypingStatus('STOP');
      this.isMyTypingSent = false;
    }, 3000);
  }
 
  sendTypingStatus(status: 'START' | 'STOP') {
    const message: WSChatMessage = {
      senderId: this.currentUserId,
      senderName: this.currentUserName,
      receiverId: this.selectedUser?.id,
      roomId: this.currentRoomId?.toString(),
      content: status,
      messageType: 'TYPING',
      timestamp: new Date()
    };
    this.chatWebSocketService.sendMessage(message);
  }
 
  // VOICE RECORDING LOGIC
  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.isRecording = true;
        this.recordingTime = 0;
        this.audioChunks = [];
        this.mediaRecorder = new MediaRecorder(stream);
 
        // Notify typing
        this.onTyping();
 
        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };
 
        this.mediaRecorder.onstop = () => {
          if (this.audioChunks.length > 0 && !this.recordingCancelled) {
            this._processAudioAndSend();
          }
          // Reset cancel flag
          this.recordingCancelled = false;
        };
 
        this.mediaRecorder.start();
        this.recordingInterval = setInterval(() => {
          this.recordingTime++;
        }, 1000);
      })
      .catch(err => {
        console.error('❌ Could not start recording:', err);
        alert('Veuillez autoriser l\'accès au microphone pour envoyer des vocaux.');
      });
  }
 
  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.cleanupRecording();
    }
  }
 
  cancelRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.recordingCancelled = true;
      this.audioChunks = [];
      this.mediaRecorder.stop();
      this.cleanupRecording();
    }
  }
 
  private cleanupRecording() {
    this.isRecording = false;
    clearInterval(this.recordingInterval);
    if (this.mediaRecorder) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    this.sendTypingStatus('STOP');
  }
 
  private _processAudioAndSend() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    const audioFile = new File([audioBlob], `voice_msg_${Date.now()}.webm`, { type: 'audio/webm' });
 
    this.chatWebSocketService.uploadFile(audioFile).subscribe({
      next: (fileUrl) => {
        const cleanUrl = fileUrl.replace(/"/g, '');
        const message: WSChatMessage = {
          senderId: this.currentUserId,
          senderName: this.currentUserName,
          receiverId: this.selectedUser?.id,
          content: cleanUrl,
          roomId: this.currentRoomId?.toString(),
          messageType: 'VOICE',
          timestamp: new Date()
        };
 
        this.chatWebSocketService.sendMessage(message);
 
        // Immediate local update
        this.chatMessagesData.push({
          name: this.currentUserName,
          message: cleanUrl, // In UI, we check messageType and use <audio>
          time: 'Just now',
          align: 'right',
          isRead: false,
          messageType: 'VOICE',
          date: new Date()
        });
 
        this.onListScroll();
        this._playSound('send');
      }
    });
  }
 
  // UTILS
  formatRecordingTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
 
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      console.log('📂 Uploading file:', file.name);
      this.chatWebSocketService.uploadFile(file).subscribe({
        next: (fileUrl) => {
          console.log('✅ File uploaded, url:', fileUrl);
          const cleanUrl = fileUrl.replace(/"/g, '');
 
          const isImage = cleanUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/);
          const message: WSChatMessage = {
            senderId: this.currentUserId,
            senderName: this.currentUserName,
            receiverId: this.selectedUser?.id, // CRITICAL for real-time
            content: cleanUrl,
            roomId: this.currentRoomId?.toString(),
            messageType: isImage ? 'IMAGE' : 'FILE',
            timestamp: new Date()
          };
 
          this.chatWebSocketService.sendMessage(message);
 
          // Immediate local update
          this.chatMessagesData.push({
            name: this.currentUserName,
            message: cleanUrl,
            time: 'Just now',
            align: 'right',
            isRead: false,
            messageType: isImage ? 'IMAGE' : 'FILE',
            date: new Date()
          });
 
          if (this.selectedUser) {
            const existingIndex = this.chatData.findIndex(u => u.id === this.selectedUser?.id);
            const newSidebarItem: ChatUser = {
              id: this.selectedUser.id,
              name: this.selectedUser.name,
              message: 'Vous avez reçu un fichier',
              time: 'Just now',
              color: 'success',
              unreadCount: 0
            };
 
            if (existingIndex > -1) {
              this.chatData.splice(existingIndex, 1);
              this.chatData.unshift(newSidebarItem);
            } else {
              this.chatData.unshift(newSidebarItem);
            }
          }
          this._loadRecentConversations();
        },
        error: (err) => console.error('❌ Upload failed', err)
      });
    }
  }
 
 
  openLightbox(image: string): void {
    this.selectedImage = image;
    this.lightboxModalRef = this.modalService.open(this.lightboxTpl, {
      centered: true,
      size: 'lg',
      windowClass: 'chat-lightbox-modal'
    });
  }

  // Emoji Picker
  showEmojiPicker = false;
  sets: any = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]
  set: any = 'twitter';
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }
 
  addEmoji(event: any) {
    const current = String(this.formData.get('message')?.value ?? '');
    const text = current ? `${current}${event.emoji.native}` : event.emoji.native;
    this.formData.patchValue({ message: text });
    this.showEmojiPicker = false;
  }
 
  onFocus() {
    this.showEmojiPicker = false;
  }
 
  onBlur() {
  }
 
  closeReplay() {
    document.querySelector('.replyCard')?.classList.remove('show');
  }
 
  // Contact Search
  ContactSearch() {
    var input: any, filter: any, ul: any, li: any, a: any | undefined, i: any, txtValue: any;
    input = document.getElementById("searchContact") as HTMLAreaElement;
    filter = input.value.toUpperCase();
    ul = document.querySelectorAll(".chat-list");
    ul.forEach((item: any) => {
      li = item.getElementsByTagName("li");
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("h5")[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
        }
      }
    })
  }
 
  toggleSearchInput() {
    this.showSearchInput = !this.showSearchInput;
    if (!this.showSearchInput) {
      this.searchMessageQuery = '';
    }
  }
 
  get filteredMessages() {
    if (!this.searchMessageQuery) {
      return this.chatMessagesData;
    }
    const query = this.searchMessageQuery.toLowerCase();
    return this.chatMessagesData.filter(msg =>
      (msg.message ?? '').toLowerCase().includes(query) ||
      (msg.name ?? '').toLowerCase().includes(query)
    );
  }
 
  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const currentMsg = this.filteredMessages[index];
    const prevMsg = this.filteredMessages[index - 1]; // This works because we iterate on filteredMessages in the template
 
    const d1 = currentMsg.date || new Date();
    const d2 = prevMsg.date || new Date();
 
    return d1.getDate() !== d2.getDate() ||
      d1.getMonth() !== d2.getMonth() ||
      d1.getFullYear() !== d2.getFullYear();
  }
 
  getMessageDate(msg: ChatMessage): string {
    const d = msg.date || new Date();
    const today = new Date();
 
    if (d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()) {
      return "Aujourd'hui";
    }
 
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear()) {
      return "Hier";
    }
 
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
 
 
}
 
 