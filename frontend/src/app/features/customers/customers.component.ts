import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, CustomerData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
        <!-- Add User Section -->
        <div class="card" style="margin-bottom: 24px;">
          <h3 style="margin-bottom: 16px;">Add New User 👤</h3>
          <div style="display:flex; gap:12px; flex-wrap:wrap">
            <input type="email" class="dp-input" placeholder="Email" [(ngModel)]="newUser.email" style="flex:1" />
            <input type="password" class="dp-input" placeholder="Password" [(ngModel)]="newUser.password" style="flex:1" />
            <select class="dp-input" [(ngModel)]="newUser.role" style="width:150px">
              <option value="INDIVIDUAL">INDIVIDUAL</option>
              <option value="CORPORATE">CORPORATE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <select class="dp-input" [(ngModel)]="newUser.gender" style="width:120px">
              <option value="MALE">MALE</option>
              <option value="FEMALE">FEMALE</option>
              <option value="OTHER">OTHER</option>
            </select>
            <button class="btn btn-primary" (click)="addUser()" [disabled]="addingUser">
              {{ addingUser ? 'Adding...' : 'Add User' }}
            </button>
          </div>
        </div>

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
                  <select class="membership-select" 
                          [value]="c.membershipType" 
                          (change)="onMembershipChange(c.id, $event)"
                          [style.color]="getMembershipColor(c.membershipType)">
                    <option value="BASIC">BASIC</option>
                    <option value="PREMIUM">PREMIUM</option>
                    <option value="VIP">VIP</option>
                  </select>
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
    .membership-select { 
      background: transparent; 
      border: 1px solid var(--border); 
      border-radius: 6px; 
      padding: 4px 8px; 
      font-size: 12px; 
      font-weight: 700; 
      cursor: pointer;
      outline: none;
    }
    .membership-select:focus { border-color: var(--accent); }
  `]
})
export class CustomersComponent implements OnInit {
  customers: CustomerData[] = [];
  loading = true;
  userRole = '';
  addingUser = false;
  newUser = { email: '', password: '', role: 'INDIVIDUAL', gender: 'MALE' };

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

  addUser() {
    if (!this.newUser.email || !this.newUser.password) return;
    this.addingUser = true;
    this.dashboardService.registerUser(this.newUser).subscribe({
      next: () => {
        this.addingUser = false;
        this.newUser = { email: '', password: '', role: 'INDIVIDUAL', gender: 'MALE' };
        this.ngOnInit(); // Refresh list
      },
      error: (err) => {
        this.addingUser = false;
        alert('Failed to add user: ' + (err.error?.message || 'Unknown error'));
      }
    });
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

  onMembershipChange(id: number, event: any) {
    const newType = event.target.value;
    this.dashboardService.updateCustomerMembership(id, newType).subscribe({
      next: () => {
        const customer = this.customers.find(c => c.id === id);
        if (customer) customer.membershipType = newType;
      },
      error: () => alert('Failed to update membership type.')
    });
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
