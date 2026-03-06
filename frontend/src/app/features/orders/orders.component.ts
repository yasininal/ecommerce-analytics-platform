import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
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
        <button class="btn btn-primary">+ New Order</button>
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
        <table class="dp-table">
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>CUSTOMER</th>
              <th>PRODUCTS</th>
              <th>TOTAL</th>
              <th>DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of orders">
              <td><span style="color:var(--accent-light);font-weight:600">{{ order.id }}</span></td>
              <td>
                <div style="display:flex;align-items:center;gap:10px">
                  <div class="avatar">{{ order.customer.charAt(0) }}</div>
                  <span style="color:var(--text-primary);font-weight:500">{{ order.customer }}</span>
                </div>
              </td>
              <td>{{ order.products }} items</td>
              <td style="color:var(--text-primary);font-weight:600">{{ order.total }}</td>
              <td>{{ order.date }}</td>
              <td>
                <span class="badge" [ngClass]="{
                  'badge-success': order.status === 'Completed',
                  'badge-info': order.status === 'Shipped',
                  'badge-warning': order.status === 'Pending',
                  'badge-danger': order.status === 'Cancelled'
                }">{{ order.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
    styles: [`
    .page-content { padding: 28px 32px; }
    .filters-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; }
    .avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-light)); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0; }
  `]
})
export class OrdersComponent {
    orders = [
        { id: '#ORD-7821', customer: 'Sarah Miller', products: 3, total: '$284.00', date: 'Dec 2, 2024', status: 'Completed' },
        { id: '#ORD-7820', customer: 'James Wilson', products: 2, total: '$156.00', date: 'Dec 2, 2024', status: 'Shipped' },
        { id: '#ORD-7819', customer: 'Emily Johnson', products: 5, total: '$432.00', date: 'Dec 1, 2024', status: 'Pending' },
        { id: '#ORD-7818', customer: 'Mike Brown', products: 1, total: '$89.99', date: 'Dec 1, 2024', status: 'Cancelled' },
        { id: '#ORD-7817', customer: 'Sophie Davis', products: 4, total: '$320.50', date: 'Nov 30, 2024', status: 'Completed' },
        { id: '#ORD-7816', customer: 'Chris Anderson', products: 2, total: '$198.00', date: 'Nov 30, 2024', status: 'Shipped' },
    ];
}
