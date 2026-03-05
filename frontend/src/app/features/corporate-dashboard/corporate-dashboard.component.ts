import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CorporateSummary } from '../dashboard.service';

@Component({
  selector: 'app-corporate-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Mağaza Yönetim Paneli</h1>
      <p *ngIf="summary">Hoş geldiniz, <strong>{{ summary.storeName }}</strong>!</p>
      
      <div class="stats-grid" *ngIf="summary">
        <div class="stat-card">
          <h3>Aktif Ürünler</h3>
          <p>{{ summary.totalProducts }}</p>
        </div>
        <div class="stat-card">
          <h3>Siparişler</h3>
          <p>{{ summary.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Kazanç</h3>
          <p>{{ summary.totalRevenue | currency:'USD' }}</p>
        </div>
      </div>
      <div *ngIf="!summary" class="loading">Yükleniyor...</div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 20px; font-family: sans-serif; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 20px; }
    .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .stat-card h3 { margin: 0 0 10px; font-size: 16px; color: #555; }
    .stat-card p { margin: 0; font-size: 24px; font-weight: bold; color: #28a745; }
    .loading { margin-top: 20px; color: #666; }
  `]
})
export class CorporateDashboardComponent implements OnInit {
  summary: CorporateSummary | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getCorporateSummary().subscribe({
      next: (data) => this.summary = data,
      error: (err) => console.error('Corporate summary fetch error', err)
    });
  }
}
