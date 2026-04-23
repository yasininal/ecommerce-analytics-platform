import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificationComponent } from './core/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationComponent],
  template: `
    <router-outlet></router-outlet>
    <app-notification></app-notification>
  `,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';
}
