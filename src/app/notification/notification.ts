import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
  animations: [
    trigger('state', [
      state('void', style({
        opacity: 0,
        transform: 'translateX(100%)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'translateX(0)'
      })),
      transition('* => void', animate('0.3s ease-in-out')),
      transition('void => *', animate('0.3s ease-in-out'))
    ])
  ]
})
export class Notification {
  notification: any;

  constructor(private notificationService: NotificationService) {
    this.notification = this.notificationService.notification;
  }

  hide() {
    this.notificationService.hide();
  }
}