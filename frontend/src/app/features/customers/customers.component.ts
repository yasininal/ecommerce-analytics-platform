import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-customers',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Customer Management 👥</h1>
          <p>View and manage your customers</p>
        </div>
        <button class="btn btn-primary">+ Add Customer</button>
      </div>

      <!-- Summary cards -->
      <div class="kpi-grid">
        <div class="kpi-card" *ngFor="let stat of stats">
          <div class="kpi-top">
            <span class="kpi-icon" [style.background]="stat.bg">{{ stat.icon }}</span>
            <span class="kpi-trend">{{ stat.change }}</span>
          </div>
          <div class="kpi-value">{{ stat.value }}</div>
          <div class="kpi-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Table -->
      <div class="card" style="padding:0; overflow:hidden; margin-top:24px">
        <table class="dp-table">
          <thead>
            <tr>
              <th>CUSTOMER</th>
              <th>MEMBERSHIP</th>
              <th>TOTAL SPEND</th>
              <th>ORDERS</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of customers">
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar" [style.background]="c.color">{{ c.name.charAt(0) }}</div>
                  <div>
                    <p style="color:var(--text-primary);font-weight:600;font-size:13px">{{ c.name }}</p>
                    <p style="color:var(--text-muted);font-size:11px">{{ c.city }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span class="membership-badge" [style.color]="c.tierColor">{{ c.tier }}</span>
              </td>
              <td style="color:var(--text-primary);font-weight:600">{{ c.spend }}</td>
              <td>{{ c.orders }}</td>
              <td><span class="badge badge-success">Active</span></td>
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
    .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .kpi-icon { width: 36px; height: 36px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 16px; }
    .kpi-trend { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 99px; background: rgba(0,200,150,0.15); color: var(--success); }
    .kpi-value { font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 12px; color: var(--text-secondary); }
    .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .membership-badge { font-size: 13px; font-weight: 700; }
  `]
})
export class CustomersComponent {
    stats = [
        { icon: '👥', label: 'Total Customers', value: '3,421', change: '+13.4%', bg: 'rgba(124,92,252,0.2)' },
        { icon: '🆕', label: 'New This Month', value: '284', change: '+38.1%', bg: 'rgba(56,189,248,0.2)' },
        { icon: '🥇', label: 'Gold Members', value: '892', change: '+5.2%', bg: 'rgba(255,181,71,0.2)' },
        { icon: '💰', label: 'Avg. LTV', value: '$142', change: '+18.4%', bg: 'rgba(0,200,150,0.2)' },
    ];
    customers = [
        { name: 'Sarah Miller', city: 'New York', tier: '🥇 Gold', tierColor: '#ffb547', spend: '$1,284.00', orders: 14, color: 'linear-gradient(135deg,#7c5cfc,#9d80ff)' },
        { name: 'James Wilson', city: 'Chicago', tier: '🥈 Silver', tierColor: '#aaa', spend: '$756.58', orders: 8, color: 'linear-gradient(135deg,#38bdf8,#7c5cfc)' },
        { name: 'Emily Johnson', city: 'Houston', tier: '🥉 Bronze', tierColor: '#cd7f32', spend: '$432.00', orders: 5, color: 'linear-gradient(135deg,#ffb547,#ff5c7a)' },
        { name: 'Mike Brown', city: 'Phoenix', tier: '🥇 Gold', tierColor: '#ffb547', spend: '$2,100.00', orders: 22, color: 'linear-gradient(135deg,#00c896,#38bdf8)' },
    ];
}
