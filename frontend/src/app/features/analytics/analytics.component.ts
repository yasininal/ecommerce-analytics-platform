import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-analytics',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Analytics Dashboard 📈</h1>
          <p>Deep insights into your store performance</p>
        </div>
        <button class="btn btn-ghost" (click)="exportReport()">↓ Export Report</button>
      </div>

      <!-- KPI row -->
      <div class="analytics-kpis">
        <div class="analytics-kpi" *ngFor="let kpi of kpis">
          <div class="kpi-header">
            <span class="kpi-icon-sm" [style.background]="kpi.bg">{{ kpi.icon }}</span>
            <span [class]="kpi.trendUp ? 'trend-up' : 'trend-down'">{{ kpi.trend }}</span>
          </div>
          <div class="kpi-big-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>
      
      <div *ngIf="loading" class="dp-loading"><div class="spinner"></div> Calculating insights...</div>

      <!-- Charts row -->
      <div class="charts-row" *ngIf="!loading">
        <!-- Sales Trends -->
        <div class="card chart-card" style="flex:2">
          <div style="margin-bottom:16px">
            <h2 style="font-size:15px;font-weight:600;color:var(--text-primary)">Sales Trends</h2>
          </div>
          <div class="line-chart">
            <div class="line-chart-area">
              <svg viewBox="0 0 400 120" preserveAspectRatio="none" style="width:100%;height:100%">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#7c5cfc" stop-opacity="0.5"/>
                    <stop offset="100%" stop-color="#7c5cfc" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <path d="M0 90 C40 80, 70 60, 100 55 S160 30, 200 35 S280 20, 320 25 S370 40, 400 30 L400 120 L0 120 Z" fill="url(#lineGrad)"/>
                <path d="M0 90 C40 80, 70 60, 100 55 S160 30, 200 35 S280 20, 320 25 S370 40, 400 30" fill="none" stroke="#7c5cfc" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="chart-labels">
              <span *ngFor="let m of months">{{ m }}</span>
            </div>
          </div>
        </div>

        <!-- Categories Donut -->
        <div class="card chart-card" style="flex:1">
          <div style="margin-bottom:16px">
            <h2 style="font-size:15px;font-weight:600;color:var(--text-primary)">Categories</h2>
          </div>
          <div class="donut-container">
            <svg viewBox="0 0 120 120" style="width:120px;height:120px;transform:rotate(-90deg)">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#1a1a35" stroke-width="20"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#7c5cfc" stroke-width="20" stroke-dasharray="113 170" stroke-dashoffset="0"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#38bdf8" stroke-width="20" stroke-dasharray="57 226" stroke-dashoffset="-113"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#00c896" stroke-width="20" stroke-dasharray="45 238" stroke-dashoffset="-170"/>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#ff5c7a" stroke-width="20" stroke-dasharray="68 215" stroke-dashoffset="-215"/>
            </svg>
          </div>
          <div class="donut-legend">
            <div class="legend-item" *ngFor="let cat of categories">
              <span class="legend-dot" [style.background]="cat.color"></span>
              <span>{{ cat.name }}</span>
              <span style="margin-left:auto;font-weight:600;color:var(--text-primary)">{{ cat.pct }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-content { padding: 28px 32px; }
    .analytics-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .analytics-kpi { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; }
    .kpi-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .kpi-icon-sm { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .trend-up { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: rgba(0,200,150,0.15); color: var(--success); }
    .trend-down { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: rgba(255,92,122,0.15); color: var(--danger); }
    .kpi-big-value { font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); }
    .charts-row { display: flex; gap: 20px; }
    .chart-card { padding: 24px; }
    .line-chart { display: flex; flex-direction: column; gap: 8px; height: 160px; }
    .line-chart-area { flex: 1; }
    .chart-labels { display: flex; justify-content: space-around; font-size: 11px; color: var(--text-muted); }
    .donut-container { display: flex; justify-content: center; margin-bottom: 16px; }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  `]
})
export class AnalyticsComponent implements OnInit {
    loading = true;
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    kpis: any[] = [];
    categories = [
        { name: 'Fashion', color: '#7c5cfc', pct: 40 },
        { name: 'Electronics', color: '#38bdf8', pct: 20 },
        { name: 'Home', color: '#00c896', pct: 16 },
        { name: 'Beauty', color: '#ff5c7a', pct: 24 },
    ];

    constructor(private dashboardService: DashboardService, private authService: AuthService) {}

    ngOnInit() {
        if (this.authService.hasRole('ROLE_ADMIN')) {
            this.dashboardService.getAdminSummary().subscribe({
                next: (data) => this.processData(data.totalRevenue, data.totalOrders),
                error: () => this.loading = false
            });
        } else {
            this.dashboardService.getCorporateSummary().subscribe({
                next: (data) => this.processData(data.totalRevenue, data.totalOrders),
                error: () => this.loading = false
            });
        }
    }

    processData(revenue: number, orders: number) {
        this.kpis = [
            { icon: '💰', label: 'Total Revenue', value: '$' + revenue.toLocaleString(), trend: '+12.5%', trendUp: true, bg: 'rgba(124,92,252,0.2)' },
            { icon: '🔄', label: 'Total Orders', value: orders.toLocaleString(), trend: '+0.4%', trendUp: true, bg: 'rgba(56,189,248,0.2)' },
            { icon: '🛒', label: 'Avg Order Value', value: '$' + (revenue / (orders || 1)).toFixed(2), trend: '+7.5%', trendUp: true, bg: 'rgba(0,200,150,0.2)' },
            { icon: '↩️', label: 'Performance', value: 'High', trend: 'Stable', trendUp: true, bg: 'rgba(255,92,122,0.2)' },
        ];
        this.loading = false;
    }

    exportReport() {
        alert('Report export started... Preparing PDF.');
    }
}
