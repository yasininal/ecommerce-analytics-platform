import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminSummary } from '../dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>Tüm E-ticaret platformu istatistikleri burada görüntülenecek.</p>
      
      <div class="stats-grid" *ngIf="summary">
        <div class="stat-card">
          <h3>Toplam Kullanıcı</h3>
          <p>{{ summary.totalUsers }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Mağaza</h3>
          <p>{{ summary.totalStores }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Sipariş</h3>
          <p>{{ summary.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Ciro</h3>
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
    .stat-card p { margin: 0; font-size: 24px; font-weight: bold; color: #007bff; }
    .loading { margin-top: 20px; color: #666; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  summary: AdminSummary | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getAdminSummary().subscribe({
      next: (data) => this.summary = data,
      error: (err) => console.error('Admin summary fetch error', err)
    });
  }
}
