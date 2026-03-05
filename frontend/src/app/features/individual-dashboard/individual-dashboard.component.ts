import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, IndividualSummary } from '../dashboard.service';

@Component({
  selector: 'app-individual-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Alışveriş Paneli</h1>
      <p *ngIf="summary">Hoş geldin, <strong>{{ summary.name }}</strong>!</p>
      
      <div class="stats-grid" *ngIf="summary">
        <div class="stat-card">
          <h3>Toplam Siparişin</h3>
          <p>{{ summary.totalOrders }}</p>
        </div>
        <div class="stat-card">
          <h3>Toplam Harcaman</h3>
          <p>{{ summary.totalSpent | currency:'USD' }}</p>
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
    .stat-card p { margin: 0; font-size: 24px; font-weight: bold; color: #17a2b8; }
    .loading { margin-top: 20px; color: #666; }
  `]
})
export class IndividualDashboardComponent implements OnInit {
  summary: IndividualSummary | null = null;

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getIndividualSummary().subscribe({
      next: (data) => this.summary = data,
      error: (err) => console.error('Individual summary fetch error', err)
    });
  }
}
