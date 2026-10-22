import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ChatComponent } from './chat.component';
import { ChatNotificationService } from './chat-notification.service';

/**
 * Bulle de messagerie flottante (en bas à droite) : ouvre le chat dans une mini-fenêtre
 * par-dessus n'importe quelle page. Masquée sur la page complète /Chat.
 */
@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, ChatComponent],
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.scss']
})
export class ChatWidgetComponent implements OnInit, OnDestroy {

  opened = false;
  /** Fenêtre réduite à sa barre de titre (la conversation reste en place). */
  minimized = false;
  /** Fenêtre en grand format. */
  enlarged = false;
  /** Position après déplacement (null = coin par défaut, en bas à droite). */
  pos: { left: number; top: number } | null = null;
  dragging = false;
  /** Le chat n'est créé qu'à la première ouverture (évite de charger les données pour rien). */
  created = false;
  onChatPage = false;
  readonly unread$ = this.notifications.unread$;
  readonly allowed$ = this.notifications.allowed$;

  @ViewChild(ChatComponent) chat?: ChatComponent;
  @ViewChild('popup') popup?: ElementRef<HTMLElement>;

  private dragOffset = { x: 0, y: 0 };
  private static readonly STORAGE_KEY = 'chat_widget_state';

  private sub = new Subscription();

  constructor(private notifications: ChatNotificationService, private router: Router) { }

  ngOnInit(): void {
    this.restoreState();
    this.updateRoute(this.router.url);
    this.sub.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e: any) => {
      this.updateRoute(e.urlAfterRedirects || e.url);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.notifications.setChatVisible(false);
  }

  /** Clic sur la bulle : ouvre, restaure si réduite, sinon ferme. */
  toggle(): void {
    if (!this.opened) {
      this.open();
    } else if (this.minimized) {
      this.setMinimized(false);
    } else {
      this.close();
    }
  }

  open(): void {
    this.created = true;
    this.opened = true;
    this.setMinimized(false);
    this.keepInViewport();
  }

  close(): void {
    this.opened = false;
    this.minimized = false;
    // retour à la liste : les messages reçus ensuite restent « non lus » tant que la fenêtre est fermée
    this.chat?.closeConversation();
    this.notifications.setChatVisible(false);
  }

  /** Réduit la fenêtre à sa barre de titre, ou la restaure. */
  setMinimized(minimized: boolean): void {
    this.minimized = minimized;
    this.notifications.setChatVisible(this.opened && !minimized);
  }

  toggleSize(): void {
    this.enlarged = !this.enlarged;
    this.saveState();
    this.keepInViewport();
  }

  // ---------------------------------------------------------------- déplacement (glisser la barre de titre)
  startDrag(ev: PointerEvent): void {
    if ((ev.target as HTMLElement).closest('button') || !this.popup) {
      return;
    }
    const r = this.popup.nativeElement.getBoundingClientRect();
    this.dragOffset = { x: ev.clientX - r.left, y: ev.clientY - r.top };
    this.dragging = true;
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    ev.preventDefault();
  }

  onDrag(ev: PointerEvent): void {
    if (!this.dragging || !this.popup) {
      return;
    }
    const el = this.popup.nativeElement;
    this.pos = {
      left: Math.min(Math.max(0, ev.clientX - this.dragOffset.x), Math.max(0, window.innerWidth - el.offsetWidth)),
      top: Math.min(Math.max(0, ev.clientY - this.dragOffset.y), Math.max(0, window.innerHeight - el.offsetHeight))
    };
  }

  endDrag(): void {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    this.saveState();
  }

  /** Remet la fenêtre dans l'écran (redimensionnement du navigateur, changement de taille). */
  @HostListener('window:resize')
  keepInViewport(): void {
    if (!this.pos) {
      return;
    }
    setTimeout(() => {
      const el = this.popup?.nativeElement;
      if (!el || !this.pos) {
        return;
      }
      this.pos = {
        left: Math.min(Math.max(0, this.pos.left), Math.max(0, window.innerWidth - el.offsetWidth)),
        top: Math.min(Math.max(0, this.pos.top), Math.max(0, window.innerHeight - el.offsetHeight))
      };
    });
  }

  private saveState(): void {
    try {
      localStorage.setItem(ChatWidgetComponent.STORAGE_KEY, JSON.stringify({ pos: this.pos, enlarged: this.enlarged }));
    } catch { /* stockage indisponible : la position n'est simplement pas mémorisée */ }
  }

  private restoreState(): void {
    try {
      const s = JSON.parse(localStorage.getItem(ChatWidgetComponent.STORAGE_KEY) || 'null');
      if (s) {
        this.enlarged = !!s.enlarged;
        this.pos = s.pos && typeof s.pos.left === 'number' && typeof s.pos.top === 'number' ? s.pos : null;
      }
    } catch { /* état illisible : valeurs par défaut */ }
  }

  /** Ouvre la page complète de la messagerie. */
  expand(): void {
    // on retient la page actuelle pour y revenir quand la page complète sera réduite
    this.notifications.lastPageUrl = this.router.url;
    this.close();
    this.router.navigate(['/Chat']);
  }

  private updateRoute(url: string): void {
    this.onChatPage = (url || '').toLowerCase().startsWith('/chat');
    if (!this.onChatPage && this.notifications.consumeWidgetOpenRequest()) {
      this.open();
    }
    if (this.onChatPage) {
      // la page complète prend le relais : la mini-fenêtre est détruite
      this.opened = false;
      this.minimized = false;
      this.created = false;
      this.notifications.setChatVisible(false);
    }
  }
}
