import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, ShipmentData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-shipments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Shipments Tracking 🚚</h1>
          <p>Monitor all shipments in real-time</p>
        </div>
      </div>

      <div class="kpi-grid" *ngIf="userRole === 'ROLE_ADMIN'">
        <div class="kpi-card" *ngFor="let s of stats">
          <div class="kpi-top">
            <span class="kpi-icon" [style.background]="s.bg">{{ s.icon }}</span>
          </div>
          <div class="kpi-value">{{ s.value }}</div>
          <div class="kpi-label">{{ s.label }}</div>
        </div>
      </div>

      <div class="card" style="padding:0; overflow:hidden; margin-top:24px">
        <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading shipments...</div>
        
        <table class="dp-table" *ngIf="!loading && shipments.length > 0">
          <thead>
            <tr>
              <th>SHIPMENT ID</th>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>WAREHOUSE</th>
              <th>MODE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of shipments">
              <td><span style="color:var(--accent-light);font-weight:600">SHP-{{ s.id }}</span></td>
              <td style="color:var(--text-primary)">#{{ s.orderId }}</td>
              <td>{{ s.customerEmail }}</td>
              <td>{{ s.warehouse }}</td>
              <td>{{ s.mode }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-info': s.status === 'SHIPPED',
                  'badge-success': s.status === 'DELIVERED',
                  'badge-warning': s.status === 'PENDING'
                }">{{ s.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && shipments.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
           No shipments found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 8px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 18px; }
    .kpi-top { margin-bottom: 12px; }
    .kpi-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .kpi-value { font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); }
  `]
})
export class ShipmentsComponent implements OnInit {
  shipments: ShipmentData[] = [];
  loading = true;
  userRole = '';

  stats = [
    { icon: '⏳', label: 'Pending', value: '156', bg: 'rgba(255,181,71,0.2)' },
    { icon: '🚚', label: 'In Transit', value: '423', bg: 'rgba(56,189,248,0.2)' },
    { icon: '✅', label: 'Delivered', value: '1,247', bg: 'rgba(0,200,150,0.2)' },
    { icon: '↩️', label: 'Returns', value: '23', bg: 'rgba(255,92,122,0.2)' },
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = this.authService.getUserId();

    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getShipments().subscribe({
        next: (data) => { this.shipments = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.authService.hasRole('ROLE_CORPORATE')) {
      this.userRole = 'ROLE_CORPORATE';
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          if (summary.storeId) {
            this.dashboardService.getShipmentsByStore(summary.storeId).subscribe({
              next: (data) => { this.shipments = data; this.loading = false; },
              error: () => this.loading = false
            });
          } else {
            this.loading = false;
          }
        },
        error: () => this.loading = false
      });
    } else {
      this.userRole = 'ROLE_INDIVIDUAL';
      if (userId) {
        this.dashboardService.getShipmentsByUser(userId).subscribe({
          next: (data) => { this.shipments = data; this.loading = false; },
          error: () => this.loading = false
        });
      } else {
        this.loading = false;
      }
    }
  }
}
