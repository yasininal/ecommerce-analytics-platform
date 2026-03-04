import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-individual-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <h1>Alışveriş Paneli</h1>
      <p>Geçmiş siparişleriniz, favorileriniz ve profil bilgileriniz burada.</p>
    </div>
  `,
    styles: [`
    .dashboard-container { padding: 20px; }
  `]
})
export class IndividualDashboardComponent {
}
