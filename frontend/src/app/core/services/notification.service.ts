import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private counter = 0;

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success', duration = 3000) {
    const id = this.counter++;
    const notification: Notification = { id, message, type };
    
    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  private remove(id: number) {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }
}
