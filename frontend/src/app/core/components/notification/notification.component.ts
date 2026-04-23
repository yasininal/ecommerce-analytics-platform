import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div *ngFor="let n of notifications$ | async" 
           class="notification-toast" 
           [class]="n.type">
        <div class="notification-icon" [ngSwitch]="n.type">
          <span *ngSwitchCase="'success'">✓</span>
          <span *ngSwitchCase="'error'">✕</span>
          <span *ngSwitchCase="'warning'">⚠</span>
          <span *ngSwitchCase="'info'">ℹ</span>
        </div>
        <div class="notification-message">{{ n.message }}</div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
    }

    .notification-toast {
      min-width: 320px;
      max-width: 450px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 14px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      animation: toast-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      pointer-events: auto;
    }

    .notification-toast.success { border-left: 4px solid var(--success); }
    .notification-toast.error { border-left: 4px solid var(--danger); }
    .notification-toast.warning { border-left: 4px solid var(--warning); }
    .notification-toast.info { border-left: 4px solid var(--info); }

    .notification-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
    }

    .success .notification-icon { background: rgba(46, 133, 64, 0.1); color: var(--success); }
    .error .notification-icon { background: rgba(193, 58, 58, 0.1); color: var(--danger); }
    .warning .notification-icon { background: rgba(224, 168, 0, 0.1); color: var(--warning); }
    .info .notification-icon { background: rgba(0, 86, 179, 0.1); color: var(--info); }

    .notification-message {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
    }

    @keyframes toast-in {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class NotificationComponent implements OnInit {
  notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.getNotifications();
  }

  ngOnInit(): void {}
}
