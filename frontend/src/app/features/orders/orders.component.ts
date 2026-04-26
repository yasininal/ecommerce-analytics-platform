import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, OrderData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <select class="dp-input" [(ngModel)]="statusFilter" (change)="onSearch()">
          <option value="ALL">All Status</option>
          <option value="DELIVERED">Delivered</option>
          <option value="SHIPPED">Shipped</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="PROCESSING">Processing</option>
        </select>
        <select class="dp-input">
          <option>All Time</option>
          <option>Today</option>
          <option>This Week</option>
          <option>This Month</option>
        </select>
        <input class="dp-input" placeholder="🔍  Search by Order ID or Customer..." 
               [(ngModel)]="searchTerm" (input)="onSearch()"
               style="flex:1; min-width:200px" />
      </div>

      <!-- Table -->
      <div class="card" style="padding:0; overflow:hidden; margin-top:20px">
        <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading orders...</div>
        
        <table class="dp-table" *ngIf="!loading && filteredOrders.length > 0">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th *ngIf="userRole === 'ROLE_ADMIN'">STORE</th>
              <th>TOTAL</th>
              <th>SHIPPING TO</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders">
              <td><span style="color:var(--accent-light);font-weight:600">#{{ order.id }}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar">{{ order.customerEmail.charAt(0).toUpperCase() }}</div>
                  <span style="color:var(--text-primary);font-weight:500">{{ order.customerEmail }}</span>
                </div>
              </td>
              <td *ngIf="userRole === 'ROLE_ADMIN'">{{ order.storeName }}</td>
              <td style="color:var(--text-primary);font-weight:600">\${{ order.grandTotal | number:'1.2-2' }}</td>
              <td>
                <div style="font-size: 11px; color: var(--text-muted); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" [title]="order.shippingAddress">
                  {{ order.shippingAddress || 'N/A' }}
                </div>
              </td>
              <td>
                <div style="display:flex; align-items:center; gap:8px">
                  <span class="badge" [ngClass]="{
                    'badge-success': order.status === 'DELIVERED',
                    'badge-info': order.status === 'SHIPPED',
                    'badge-warning': order.status === 'PENDING' || order.status === 'PROCESSING',
                    'badge-danger': order.status === 'CANCELLED'
                  }">{{ order.status }}</span>
                  
                  <!-- Quick actions for Admin/Corporate -->
                  <select *ngIf="userRole !== 'ROLE_INDIVIDUAL'" 
                          class="status-select-sm"
                          (change)="updateStatus(order.id, $event)">
                    <option value="" disabled selected>Update...</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancel</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="!loading && filteredOrders.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
           No orders found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .filters-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-light)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .status-select-sm {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      outline: none;
      cursor: pointer;
    }
    .status-select-sm:hover { border-color: var(--accent); }
  `]
})
export class OrdersComponent implements OnInit {
  orders: OrderData[] = [];
  filteredOrders: OrderData[] = [];
  loading = true;
  userRole = '';
  searchTerm = '';
  statusFilter = 'ALL';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const userId = this.authService.getUserId();

    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getOrders().subscribe({
        next: (data) => { 
          this.orders = data; 
          this.filteredOrders = data;
          this.loading = false; 
        },
        error: () => this.loading = false
      });
    } else if (this.authService.hasRole('ROLE_CORPORATE')) {
      this.userRole = 'ROLE_CORPORATE';
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          if (summary.storeId) {
            this.dashboardService.getOrdersByStore(summary.storeId).subscribe({
              next: (data) => { 
                this.orders = data; 
                this.filteredOrders = data;
                this.loading = false; 
              },
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
          next: (data) => { 
            this.orders = data; 
            this.filteredOrders = data;
            this.loading = false; 
          },
          error: () => this.loading = false
        });
      } else {
        this.loading = false;
      }
    }
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    
    this.filteredOrders = this.orders.filter(o => {
      const matchSearch = !term || 
        o.id.toString().includes(term) || 
        o.customerEmail.toLowerCase().includes(term) ||
        o.storeName?.toLowerCase().includes(term);
        
      const matchStatus = this.statusFilter === 'ALL' || o.status === this.statusFilter;
      
      return matchSearch && matchStatus;
    });
  }

  updateStatus(id: number, event: any) {
    const newStatus = event.target.value;
    if (!newStatus) return;

    this.dashboardService.updateOrderStatus(id, newStatus).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id === id);
        if (order) {
            order.status = newStatus;
            this.onSearch(); // Refresh filter
        }
      },
      error: () => alert('Failed to update order status.')
    });
  }
}
