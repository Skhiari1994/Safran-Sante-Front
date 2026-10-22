import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChatWebSocketService, ChatMessage } from './chat-websocket.service';

/**
 * Notifications globales de la messagerie : garde la connexion ouverte sur toutes les pages,
 * compte les messages non lus (pastille du menu, titre de l'onglet) et joue un son à la réception
 * quand l'utilisateur n'est pas sur la page du chat.
 */
@Injectable({ providedIn: 'root' })
export class ChatNotificationService {
  private unread = new BehaviorSubject<number>(0);
  readonly unread$ = this.unread.asObservable();

  /**
   * Le profil de l'utilisateur a-t-il l'autorisation « Chat » (page des autorisations par profil) ?
   * null tant que le menu n'est pas chargé.
   */
  private allowed = new BehaviorSubject<boolean | null>(null);
  readonly allowed$ = this.allowed.asObservable();

  private userId = '';
  private userName = '';
  private started = false;
  private subs = new Subscription();
  private refreshTimer: any;
  private pollTimer: any;
  private chatVisible = false;
  private openRequested = false;
  private static readonly LAST_PAGE_KEY = 'chat_last_page';

  /**
   * Dernière page de l'application visitée hors messagerie (retour depuis la page complète).
   * Mémorisée dans sessionStorage pour survivre à un rechargement de la page /Chat.
   */
  get lastPageUrl(): string {
    try {
      return sessionStorage.getItem(ChatNotificationService.LAST_PAGE_KEY) || '/';
    } catch {
      return '/';
    }
  }

  set lastPageUrl(url: string) {
    try {
      sessionStorage.setItem(ChatNotificationService.LAST_PAGE_KEY, url);
    } catch { /* stockage indisponible : retour à l'accueil par défaut */ }
  }

  constructor(private chatWs: ChatWebSocketService, private router: Router) { }

  /**
   * Appelé quand le menu du profil est chargé : sans l'autorisation « Chat », ni bulle, ni son,
   * ni notification, ni connexion au serveur de messagerie.
   */
  setAllowed(allowed: boolean): void {
    this.allowed.next(allowed);
    if (allowed) {
      this.start();
    } else {
      this.stop();
    }
  }

  /** Déconnexion : oublie l'autorisation du profil précédent. */
  reset(): void {
    this.allowed.next(null);
    this.stop();
  }

  /** Démarre la messagerie (appelé par setAllowed quand le profil y a droit). */
  start(): void {
    const user = this.readStoredUser();
    if (!user) {
      return;
    }
    if (this.started && this.userId === user.id) {
      return;
    }
    this.stop();

    this.started = true;
    this.userId = user.id;
    this.userName = user.name;
    this.chatWs.connect(user.id, user.name);

    this.subs = new Subscription();
    this.subs.add(this.chatWs.messages$.subscribe(m => this.onMessage(m)));
    this.subs.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects || e.url || '/';
      if (!url.toLowerCase().startsWith('/chat') && !url.toLowerCase().startsWith('/auth')) {
        this.lastPageUrl = url;
      }
      this.scheduleRefresh(1500);
    }));
    this.pollTimer = setInterval(() => this.refresh(), 30000);
    this.refresh();
  }

  /** Demande l'ouverture de la mini-fenêtre dès que la page complète est quittée. */
  requestWidgetOpen(): void {
    this.openRequested = true;
  }

  consumeWidgetOpenRequest(): boolean {
    const requested = this.openRequested;
    this.openRequested = false;
    return requested;
  }

  /** La mini-fenêtre du chat est ouverte : elle gère elle-même le son et la lecture des messages. */
  setChatVisible(visible: boolean): void {
    this.chatVisible = visible;
    if (!visible) {
      this.scheduleRefresh(500);
    }
  }

  /** À appeler à la déconnexion (destruction du layout). */
  stop(): void {
    if (!this.started) {
      return;
    }
    this.started = false;
    this.subs.unsubscribe();
    clearTimeout(this.refreshTimer);
    clearInterval(this.pollTimer);
    this.chatWs.disconnect(this.userId, this.userName);
    this.userId = '';
    this.setUnread(0);
  }

  private onMessage(m: ChatMessage): void {
    const visible = ['CHAT', 'FILE', 'IMAGE', 'VOICE'].includes(m.messageType);
    if (!visible || m.receiverId !== this.userId || m.senderId === this.userId) {
      return;
    }
    if (this.onChatPage()) {
      // la page du chat joue déjà son propre son et marque la conversation comme lue
      this.scheduleRefresh(2000);
      return;
    }
    this.playSound();
    this.scheduleRefresh(300);
  }

  private onChatPage(): boolean {
    return this.chatVisible || this.router.url.toLowerCase().startsWith('/chat');
  }

  private scheduleRefresh(delayMs: number): void {
    clearTimeout(this.refreshTimer);
    this.refreshTimer = setTimeout(() => this.refresh(), delayMs);
  }

  private refresh(): void {
    if (!this.userId) {
      return;
    }
    this.chatWs.getUnreadCount(this.userId).subscribe({
      next: n => this.setUnread(Number(n) || 0),
      error: () => { /* le compteur reste inchangé tant que le service ne répond pas */ }
    });
  }

  private setUnread(n: number): void {
    this.unread.next(n);
    const base = document.title.replace(/^\(\d+\)\s*/, '');
    document.title = n > 0 ? `(${n}) ${base}` : base;
  }

  private playSound(): void {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    audio.volume = 1;
    audio.play().catch(() => { /* son bloqué par le navigateur tant que l'utilisateur n'a pas interagi */ });
  }

  /** Utilisateur enregistré à la connexion (même règle que la page du chat). */
  private readStoredUser(): { id: string; name: string } | null {
    const raw = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
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
      if (!id) {
        return null;
      }
      const name = (typeof u['useLogin'] === 'string' && u['useLogin']) || id;
      return { id, name };
    } catch {
      return null;
    }
  }
}
