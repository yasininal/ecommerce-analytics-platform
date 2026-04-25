import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CorporateSummary } from '../dashboard.service';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface OrderDto {
    id: number;
    customerEmail: string;
    storeName: string;
    status: string;
    grandTotal: number;
}

@Component({
  selector: 'app-corporate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-content">
      <div class="welcome-header">
        <div>
          <h1 class="welcome-title">Store Dashboard 🏪</h1>
          <p class="welcome-sub" *ngIf="summary">{{ summary.storeName }} — store overview and order management</p>
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

      <!-- Incoming Orders Section -->
      <div class="orders-section" *ngIf="summary">
        <div class="section-header">
          <h2>📋 Incoming Orders</h2>
          <div class="tab-bar">
            <button *ngFor="let tab of tabs" [class.active]="activeTab === tab.key" (click)="activeTab = tab.key" class="tab-btn">
              {{ tab.label }} <span class="tab-count">{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <div class="orders-table" *ngIf="filteredOrders.length > 0">
          <div class="table-header">
            <span>Order</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div class="table-row" *ngFor="let order of filteredOrders">
            <span class="order-id">#{{ order.id }}</span>
            <span class="customer-email">{{ order.customerEmail }}</span>
            <span class="order-total">\${{ order.grandTotal.toFixed(2) }}</span>
            <span class="status-pill" [ngClass]="order.status.toLowerCase()">{{ order.status }}</span>
            <div class="action-col">
              <button *ngIf="order.status === 'PENDING'" class="act-btn confirm" (click)="updateStatus(order, 'PROCESSING')">✓ Confirm</button>
              <button *ngIf="order.status === 'PROCESSING'" class="act-btn ship" (click)="updateStatus(order, 'SHIPPED')">🚚 Ship</button>
              <button *ngIf="order.status === 'SHIPPED'" class="act-btn deliver" (click)="updateStatus(order, 'DELIVERED')">📦 Delivered</button>
              <button *ngIf="order.status === 'PENDING' || order.status === 'PROCESSING'" class="act-btn cancel" (click)="cancelOrder(order)">✕ Cancel & Refund</button>
              <span *ngIf="order.status === 'DELIVERED' || order.status === 'CANCELLED' || order.status === 'RETURNED' || order.status === 'REFUNDED'" class="done-label">—</span>
            </div>
          </div>
        </div>

        <div class="empty-orders" *ngIf="filteredOrders.length === 0">
          <p>No {{ activeTab === 'all' ? '' : activeTab }} orders found.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .welcome-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
    .welcome-title { font-size: 24px; font-weight: 700; color: var(--text-primary); }
    .welcome-sub { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
    .kpi-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; transition: all var(--transition); }
    .kpi-card:hover { border-color: var(--border-strong); transform: translateY(-2px); }
    .kpi-top { margin-bottom: 14px; }
    .kpi-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .kpi-value { font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .kpi-label { font-size: 13px; color: var(--text-secondary); }

    .orders-section { margin-top: 28px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
    .section-header h2 { font-size: 18px; font-weight: 700; margin: 0; }
    .tab-bar { display: flex; gap: 6px; }
    .tab-btn { padding: 6px 14px; border-radius: 99px; border: 1px solid var(--border); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
    .tab-btn:hover { background: var(--bg-hover); }
    .tab-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
    .tab-count { background: rgba(255,255,255,0.2); padding: 1px 6px; border-radius: 99px; font-size: 10px; }
    .tab-btn.active .tab-count { background: rgba(255,255,255,0.3); }

    .table-header { display: grid; grid-template-columns: 80px 1fr 100px 120px 160px; gap: 12px; padding: 10px 16px; font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; border-bottom: 1px solid var(--border); }
    .table-row { display: grid; grid-template-columns: 80px 1fr 100px 120px 160px; gap: 12px; padding: 14px 16px; align-items: center; border-bottom: 1px solid var(--border); transition: 0.2s; }
    .table-row:hover { background: var(--bg-hover); }
    .table-row:last-child { border-bottom: none; }
    .order-id { font-weight: 700; font-size: 14px; }
    .customer-email { font-size: 13px; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; }
    .order-total { font-weight: 700; font-size: 14px; }

    .status-pill { padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; display: inline-block; text-align: center; }
    .status-pill.pending { background: rgba(251,191,36,0.15); color: #f59e0b; }
    .status-pill.processing { background: rgba(96,165,250,0.15); color: #3b82f6; }
    .status-pill.shipped { background: rgba(168,85,247,0.15); color: #a855f7; }
    .status-pill.delivered { background: rgba(74,222,128,0.15); color: #22c55e; }
    .status-pill.cancelled { background: rgba(248,113,113,0.15); color: #ef4444; }
    .status-pill.returned { background: rgba(248,113,113,0.15); color: #ef4444; }
    .status-pill.refunded { background: rgba(16,185,129,0.15); color: #10b981; }

    .action-col { display: flex; gap: 6px; }
    .act-btn { padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-size: 11px; font-weight: 700; transition: 0.2s; white-space: nowrap; }
    .act-btn.confirm { background: rgba(74,222,128,0.15); color: #22c55e; }
    .act-btn.confirm:hover { background: #22c55e; color: white; }
    .act-btn.ship { background: rgba(168,85,247,0.15); color: #a855f7; }
    .act-btn.ship:hover { background: #a855f7; color: white; }
    .act-btn.deliver { background: rgba(96,165,250,0.15); color: #3b82f6; }
    .act-btn.deliver:hover { background: #3b82f6; color: white; }
    .act-btn.cancel { background: rgba(248,113,113,0.15); color: #ef4444; padding: 6px 10px; }
    .act-btn.cancel:hover { background: #ef4444; color: white; }
    .done-label { color: var(--text-muted); font-size: 14px; }

    .empty-orders { text-align: center; padding: 32px; color: var(--text-muted); }

    .ai-button {
      display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, var(--accent), var(--accent-light));
      color: white; padding: 12px 24px; border-radius: 99px; text-decoration: none; font-weight: 700; font-size: 14px;
      box-shadow: 0 10px 20px rgba(124, 92, 252, 0.3); transition: 0.3s;
    }
    .ai-button:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(124, 92, 252, 0.4); }
  `]
})
export class CorporateDashboardComponent implements OnInit {
  summary: CorporateSummary | null = null;
  kpis: any[] = [];
  orders: OrderDto[] = [];
  activeTab = 'all';

  tabs = [
    { key: 'all', label: 'All', count: 0 },
    { key: 'pending', label: 'Pending', count: 0 },
    { key: 'processing', label: 'Processing', count: 0 },
    { key: 'shipped', label: 'Shipped', count: 0 },
    { key: 'delivered', label: 'Delivered', count: 0 },
    { key: 'refunded', label: 'Refunded', count: 0 },
  ];

  constructor(private dashboardService: DashboardService, private http: HttpClient) { }

  ngOnInit(): void {
    this.dashboardService.getCorporateSummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.kpis = [
          { icon: '📦', label: 'Active Products', value: data.totalProducts.toLocaleString(), iconBg: 'rgba(124,92,252,0.2)' },
          { icon: '🛒', label: 'Total Orders', value: data.totalOrders.toLocaleString(), iconBg: 'rgba(56,189,248,0.2)' },
          { icon: '💰', label: 'Total Revenue', value: '$' + data.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), iconBg: 'rgba(0,200,150,0.2)' },
          { icon: '🕐', label: 'Pending Orders', value: '0', iconBg: 'rgba(251,191,36,0.2)' },
        ];
      },
      error: (err) => console.error('Corporate summary fetch error', err)
    });

    this.loadOrders();
  }

  loadOrders() {
    this.http.get<OrderDto[]>('/api/orders/my-store-orders').subscribe({
      next: (data) => {
        this.orders = data;
        this.updateTabs();
        const pending = data.filter(o => o.status === 'PENDING').length;
        if (this.kpis.length > 3) this.kpis[3].value = pending.toString();
      }
    });
  }

  updateTabs() {
    this.tabs[0].count = this.orders.length;
    this.tabs[1].count = this.orders.filter(o => o.status === 'PENDING').length;
    this.tabs[2].count = this.orders.filter(o => o.status === 'PROCESSING').length;
    this.tabs[3].count = this.orders.filter(o => o.status === 'SHIPPED').length;
    this.tabs[4].count = this.orders.filter(o => o.status === 'DELIVERED').length;
    this.tabs[5].count = this.orders.filter(o => o.status === 'REFUNDED' || o.status === 'CANCELLED').length;
  }

  get filteredOrders(): OrderDto[] {
    if (this.activeTab === 'all') return this.orders;
    if (this.activeTab === 'refunded') {
        return this.orders.filter(o => o.status === 'REFUNDED' || o.status === 'CANCELLED');
    }
    return this.orders.filter(o => o.status.toLowerCase() === this.activeTab);
  }

  updateStatus(order: OrderDto, newStatus: string) {
    this.http.patch<any>(`/api/orders/${order.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        order.status = newStatus;
        this.updateTabs();
        if (this.kpis.length > 3) {
          this.kpis[3].value = this.orders.filter(o => o.status === 'PENDING').length.toString();
        }
      },
      error: (err) => console.error('Status update failed', err)
    });
  }

  cancelOrder(order: OrderDto) {
      if (confirm(`Are you sure you want to cancel Order #${order.id}? This will process a full refund to the customer.`)) {
          this.updateStatus(order, 'REFUNDED');
      }
  }
}
