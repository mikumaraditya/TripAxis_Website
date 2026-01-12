import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notification = signal<Notification | null>(null);
  private timer: any;

  show(message: string, type: 'success' | 'error', duration: number = 3000) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    
    this.notification.set({ message, type });

    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  hide() {
    this.notification.set(null);
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}