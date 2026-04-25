import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface OrderDto {
    id: number;
    userEmail: string;
    storeName: string;
    status: string;
    grandTotal: number;
}

@Component({
    selector: 'app-my-orders',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="orders-page">
      <div class="orders-header">
        <h1>📦 My Orders</h1>
        <p>Track and manage your purchases</p>
      </div>

      <div class="orders-empty" *ngIf="orders.length === 0 && !loading">
        <div class="empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
        <a routerLink="/catalog" class="browse-btn">Browse Products</a>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading your orders...</p>
      </div>

      <div class="orders-grid" *ngIf="orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
          <div class="order-top">
            <span class="order-id">Order #{{ order.id }}</span>
            <span class="status-badge" [ngClass]="order.status.toLowerCase()">{{ order.status }}</span>
          </div>
          <div class="order-details">
            <div class="detail-row">
              <span class="label">Store</span>
              <span class="value">{{ order.storeName }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total</span>
              <span class="value price">\${{ order.grandTotal.toFixed(2) }}</span>
            </div>
          </div>
          <div class="order-progress">
            <div class="progress-step" [class.active]="isStepActive(order.status, 'PENDING')" [class.done]="isStepDone(order.status, 'PENDING')">
              <div class="step-dot"></div><span>Ordered</span>
            </div>
            <div class="progress-line" [class.filled]="isStepDone(order.status, 'PROCESSING')"></div>
            <div class="progress-step" [class.active]="isStepActive(order.status, 'PROCESSING')" [class.done]="isStepDone(order.status, 'PROCESSING')">
              <div class="step-dot"></div><span>Processing</span>
            </div>
            <div class="progress-line" [class.filled]="isStepDone(order.status, 'SHIPPED')"></div>
            <div class="progress-step" [class.active]="isStepActive(order.status, 'SHIPPED')" [class.done]="isStepDone(order.status, 'SHIPPED')">
              <div class="step-dot"></div><span>Shipped</span>
            </div>
            <div class="progress-line" [class.filled]="isStepDone(order.status, 'DELIVERED')"></div>
            <div class="progress-step" [class.active]="isStepActive(order.status, 'DELIVERED')" [class.done]="isStepDone(order.status, 'DELIVERED')">
              <div class="step-dot"></div><span>Delivered</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .orders-page { max-width: 900px; margin: 0 auto; padding: 40px; }
    .orders-header h1 { font-size: 28px; font-weight: 800; margin: 0; }
    .orders-header p { color: var(--text-muted); margin: 4px 0 32px; }

    .orders-empty { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 80px; margin-bottom: 20px; opacity: 0.3; }
    .orders-empty h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .orders-empty p { color: var(--text-muted); margin-bottom: 24px; }
    .browse-btn { display: inline-block; padding: 14px 32px; background: var(--accent); color: white; border-radius: 14px; text-decoration: none; font-weight: 700; }

    .loading-state { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .orders-grid { display: flex; flex-direction: column; gap: 16px; }
    .order-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; padding: 24px; transition: 0.2s; }
    .order-card:hover { border-color: var(--accent); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
    .order-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .order-id { font-weight: 800; font-size: 16px; }
    .status-badge { padding: 6px 14px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .status-badge.pending { background: rgba(251,191,36,0.1); color: #f59e0b; }
    .status-badge.processing { background: rgba(96,165,250,0.1); color: #3b82f6; }
    .status-badge.shipped { background: rgba(168,85,247,0.1); color: #a855f7; }
    .status-badge.delivered { background: rgba(74,222,128,0.1); color: #22c55e; }
    .status-badge.cancelled { background: rgba(248,113,113,0.1); color: #ef4444; }
    .status-badge.returned { background: rgba(248,113,113,0.1); color: #ef4444; }

    .order-details { display: flex; gap: 32px; margin-bottom: 20px; }
    .detail-row { display: flex; flex-direction: column; gap: 2px; }
    .label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
    .value { font-size: 14px; font-weight: 600; }
    .price { font-size: 18px; font-weight: 800; color: var(--accent); }

    .order-progress { display: flex; align-items: center; gap: 0; }
    .progress-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
    .progress-step span { font-size: 10px; color: var(--text-muted); font-weight: 600; }
    .step-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--border); transition: 0.3s; }
    .progress-step.active .step-dot { background: var(--accent); box-shadow: 0 0 12px rgba(241,100,30,0.4); }
    .progress-step.done .step-dot { background: #22c55e; }
    .progress-step.active span, .progress-step.done span { color: var(--text-primary); }
    .progress-line { flex: 1; height: 2px; background: var(--border); margin: 0 8px; margin-bottom: 20px; }
    .progress-line.filled { background: #22c55e; }
  `]
})
export class MyOrdersComponent implements OnInit {
    orders: OrderDto[] = [];
    loading = true;

    private statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

    constructor(private http: HttpClient) { }

    ngOnInit() {
        this.http.get<OrderDto[]>('/api/orders/my-orders').subscribe({
            next: (data) => {
                this.orders = data.sort((a, b) => b.id - a.id);
                this.loading = false;
            },
            error: () => { this.loading = false; }
        });
    }

    isStepActive(status: string, step: string): boolean {
        return status === step;
    }

    isStepDone(status: string, step: string): boolean {
        const si = this.statusOrder.indexOf(status);
        const ti = this.statusOrder.indexOf(step);
        return si > ti;
    }
}
