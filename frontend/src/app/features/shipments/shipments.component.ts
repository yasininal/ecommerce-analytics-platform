import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

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
        <button class="btn btn-primary">+ Create Shipment</button>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let s of stats">
          <div class="kpi-top">
            <span class="kpi-icon" [style.background]="s.bg">{{ s.icon }}</span>
          </div>
          <div class="kpi-value">{{ s.value }}</div>
          <div class="kpi-label">{{ s.label }}</div>
        </div>
      </div>

      <div class="card" style="padding:0; overflow:hidden; margin-top:24px">
        <table class="dp-table">
          <thead>
            <tr>
              <th>TRACKING ID</th>
              <th>ORDER</th>
              <th>CUSTOMER</th>
              <th>CARRIER</th>
              <th>DESTINATION</th>
              <th>STATUS</th>
              <th>ETA</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of shipments">
              <td><span style="color:var(--accent-light);font-weight:600">{{ s.tracking }}</span></td>
              <td style="color:var(--text-primary)">#{{ s.order }}</td>
              <td>{{ s.customer }}</td>
              <td>{{ s.carrier }}</td>
              <td>{{ s.dest }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-info': s.status === 'In Transit',
                  'badge-success': s.status === 'Delivered',
                  'badge-warning': s.status === 'Processing'
                }">{{ s.status }}</span>
              </td>
              <td style="color:var(--text-secondary)">{{ s.eta }}</td>
            </tr>
          </tbody>
        </table>
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
export class ShipmentsComponent {
    stats = [
        { icon: '⏳', label: 'Pending', value: '156', bg: 'rgba(255,181,71,0.2)' },
        { icon: '🚚', label: 'In Transit', value: '423', bg: 'rgba(56,189,248,0.2)' },
        { icon: '✅', label: 'Delivered', value: '1,247', bg: 'rgba(0,200,150,0.2)' },
        { icon: '↩️', label: 'Returns', value: '23', bg: 'rgba(255,92,122,0.2)' },
    ];
    shipments = [
        { tracking: 'TRK-892341', order: '7820', customer: 'James Wilson', carrier: 'FedEx', dest: 'Los Angeles, CA', status: 'In Transit', eta: 'Dec 4' },
        { tracking: 'TRK-892348', order: '7819', customer: 'Emily Johnson', carrier: 'UPS', dest: 'Chicago, IL', status: 'Processing', eta: 'Dec 5' },
        { tracking: 'TRK-892339', order: '7815', customer: 'Michael Lee', carrier: 'DHL', dest: 'Miami, FL', status: 'Delivered', eta: 'Dec 3' },
        { tracking: 'TRK-892320', order: '7810', customer: 'Sophie Davis', carrier: 'FedEx', dest: 'Dallas, TX', status: 'Delivered', eta: 'Dec 2' },
    ];
}
