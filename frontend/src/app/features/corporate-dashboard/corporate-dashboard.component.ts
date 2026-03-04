import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-corporate-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-container">
      <h1>Mağaza Yönetim Paneli</h1>
      <p>Satış analitiği, mağaza ürünleri ve sipariş yönetiminiz burada olacak.</p>
    </div>
  `,
    styles: [`
    .dashboard-container { padding: 20px; }
  `]
})
export class CorporateDashboardComponent {
}
