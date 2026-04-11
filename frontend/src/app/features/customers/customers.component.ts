import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CustomerData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Customer Management 👥</h1>
          <p>View and manage all registered customers on the platform.</p>
        </div>
      </div>

      <div *ngIf="userRole !== 'ROLE_ADMIN'" style="padding:40px; text-align:center; color:var(--text-secondary)">
         You do not have permission to view all customers.
      </div>

      <ng-container *ngIf="userRole === 'ROLE_ADMIN'">
        <!-- Table -->
        <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading customers...</div>
        
        <div class="card" style="padding:0; overflow:hidden; margin-top:24px" *ngIf="!loading && customers.length > 0">
          <table class="dp-table">
            <thead>
              <tr>
                <th>CUSTOMER</th>
                <th>MEMBERSHIP</th>
                <th>GENDER</th>
                <th>AGE</th>
                <th>STATUS</th>
                <th style="text-align:right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let c of customers">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="avatar" [style.background]="getGradient(c.id)">{{ c.email.charAt(0).toUpperCase() }}</div>
                    <div>
                      <p style="color:var(--text-primary);font-weight:600;font-size:13px">{{ c.email }}</p>
                      <p style="color:var(--text-muted);font-size:11px">{{ c.city || 'Unknown Location' }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="membership-badge" [style.color]="getMembershipColor(c.membershipType)">{{ c.membershipType }}</span>
                </td>
                <td style="color:var(--text-secondary)">{{ c.gender }}</td>
                <td>{{ c.age ? c.age : 'N/A' }}</td>
                <td><span class="badge badge-success">Active</span></td>
                <td style="text-align:right">
                  <button class="btn btn-ghost" style="color:var(--danger)" (click)="deleteCust(c.id)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div *ngIf="!loading && customers.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
           No customers found.
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .membership-badge { font-size: 13px; font-weight: 700; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: CustomerData[] = [];
  loading = true;
  userRole = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getCustomers().subscribe({
        next: (data) => { this.customers = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else {
      this.userRole = this.authService.hasRole('ROLE_CORPORATE') ? 'ROLE_CORPORATE' : 'ROLE_INDIVIDUAL';
      this.loading = false;
    }
  }

  deleteCust(id: number) {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.dashboardService.deleteCustomer(id).subscribe({
        next: () => {
          this.customers = this.customers.filter(c => c.id !== id);
        },
        error: (err) => alert('Failed to delete customer.')
      });
    }
  }

  getMembershipColor(type: string): string {
    switch (type) {
      case 'PREMIUM': return '#38bdf8';
      case 'VIP': return '#ffb547';
      default: return '#aaa';
    }
  }

  getGradient(id: number): string {
    const colors = [
      'linear-gradient(135deg,#7c5cfc,#9d80ff)',
      'linear-gradient(135deg,#38bdf8,#7c5cfc)',
      'linear-gradient(135deg,#ffb547,#ff5c7a)',
      'linear-gradient(135deg,#00c896,#38bdf8)'
    ];
    return colors[id % colors.length];
  }
}
