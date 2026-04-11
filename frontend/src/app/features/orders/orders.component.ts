import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, OrderData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  // ... (geri kalanı config üzerinden güncelleniyor)
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Orders Management 🛒</h1>
          <p>Track and manage all orders</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select class="dp-input">
          <option>All Status</option>
          <option>Completed</option>
          <option>Shipped</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <select class="dp-input">
          <option>All Time</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
        <input class="dp-input" placeholder="🔍  Search orders..." style="flex:1; min-width:200px" />
      </div>

      <!-- Table -->
      <div class="card" style="padding:0; overflow:hidden; margin-top:20px">
        <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading orders...</div>
        
        <table class="dp-table" *ngIf="!loading && orders.length > 0">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>STORE</th>
              <th>TOTAL</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td><span style="color:var(--accent-light);font-weight:600">#{{ order.id }}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar">{{ order.customerEmail.charAt(0).toUpperCase() }}</div>
                  <span style="color:var(--text-primary);font-weight:500">{{ order.customerEmail }}</span>
                </div>
              </td>
              <td>{{ order.storeName }}</td>
              <td style="color:var(--text-primary);font-weight:600">\${{ order.grandTotal | number:'1.2-2' }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': order.status === 'DELIVERED',
                  'badge-info': order.status === 'SHIPPED',
                  'badge-warning': order.status === 'PENDING' || order.status === 'PROCESSING',
                  'badge-danger': order.status === 'CANCELLED'
                }">{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="!loading && orders.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
           No orders found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .filters-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-light)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderData[] = [];
  loading = true;
  userRole = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = this.authService.getUserId();

    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getOrders().subscribe({
        next: (data) => { this.orders = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.authService.hasRole('ROLE_CORPORATE')) {
      this.userRole = 'ROLE_CORPORATE';
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          if (summary.storeId) {
            this.dashboardService.getOrdersByStore(summary.storeId).subscribe({
              next: (data) => { this.orders = data; this.loading = false; },
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
        this.dashboardService.getOrdersByUser(userId).subscribe({
          next: (data) => { this.orders = data; this.loading = false; },
          error: () => this.loading = false
        });
      } else {
        this.loading = false;
      }
    }
  }
}
