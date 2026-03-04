import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Tüm E-ticaret platformu istatistikleri burada görüntülenecek.</p>
    </div>
  `,
    styles: [`
    .dashboard-container { padding: 20px; }
  `]
})
export class AdminDashboardComponent {
}
