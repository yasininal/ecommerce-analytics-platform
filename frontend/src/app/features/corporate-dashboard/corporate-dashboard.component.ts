import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CorporateSummary } from '../dashboard.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-corporate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title">Store Dashboard 🏪</h1>
          <p class="welcome-sub" *ngIf="summary">{{ summary.storeName }} — mağazanızın bugünkü özeti</p>
        </div>
        <a routerLink="/corporate/ai-assistant" class="ai-button">
           <span>🤖</span> Talk to Data AI
        </a>
      </div>

      <div class="kpi-grid" *ngIf="summary">
        <div class="kpi-card" *ngFor="let kpi of kpis">
          <div class="kpi-top">
            <span class="kpi-icon" [style.background]="kpi.iconBg">{{ kpi.icon }}</span>
          </div>
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>

      <div class="dp-loading" *ngIf="!summary">
        <div class="spinner"></div>
        <span>Loading store data...</span>
      </div>

      <div class="card revenue-card" *ngIf="summary" style="margin-top: 24px;">
        <div style="margin-bottom:16px">
          <h2 style="font-size:16px;font-weight:600;color:var(--text-primary)">Sales Performance</h2>
          <p style="font-size:12px;color:var(--text-secondary);margin-top:3px">Mağazanızın son 7 günlük satış trendi</p>
        </div>
        <div class="chart-placeholder">
          <div class="chart-bars">
            <div class="bar" *ngFor="let h of chartBars" [style.height.%]="h"></div>
          </div>
          <div class="chart-labels">
            <span *ngFor="let d of chartDays">{{ d }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .welcome-header { margin-bottom: 28px; }
    .welcome-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
    .welcome-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; transition: all var(--transition); }
    .kpi-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
    .kpi-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-trend-up { font-size: 12px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: rgba(0,200,150,0.15); color: var(--success); }
    .kpi-value { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 13px; color: var(--text-secondary); }
    .revenue-card { padding: 24px; }
    .chart-placeholder { height: 180px; display: flex; flex-direction: column; gap: 8px; }
    .chart-bars { flex: 1; display: flex; align-items: flex-end; gap: 10px; }
    .bar { flex: 1; background: linear-gradient(to top, #00c896, rgba(0,200,150,0.3)); border-radius: 4px 4px 0 0; min-height: 10%; }
    .chart-labels { display: justify-content: space-around; font-size: 11px; color: var(--text-muted); }

    .ai-button {
      display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 700; font-size: 14px;
      box-shadow: 0 10px 20px rgba(124, 92, 252, 0.3); transition: 0.3s;
    }
    .ai-button:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(124, 92, 252, 0.4); }
    .welcome-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  `]
})
export class CorporateDashboardComponent implements OnInit {
  summary: CorporateSummary | null = null;
  kpis: any[] = [];
  chartBars = [30, 55, 42, 70, 48, 85, 60];
  chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.dashboardService.getCorporateSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.kpis = [
          { icon: '📦', label: 'Active Products', value: data.totalProducts.toLocaleString(), iconBg: 'rgba(124,92,252,0.2)' },
          { icon: '🛒', label: 'Total Orders', value: data.totalOrders.toLocaleString(), iconBg: 'rgba(56,189,248,0.2)' },
          { icon: '💰', label: 'Total Revenue', value: '$' + data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), iconBg: 'rgba(0,200,150,0.2)' },
        ];
      },
      error: (err) => console.error('Corporate summary fetch error', err)
    });
  }
}
