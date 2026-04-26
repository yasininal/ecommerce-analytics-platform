import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, StoreData } from '../../core/services/store.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService, AddressData } from '../dashboard.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div *ngIf="isAdmin || isCorporate">
          <p>Manage your store profile and status</p>
        </div>
      </div>

      <!-- Add Store Section (Admin Only) -->
      <div class="card" *ngIf="isAdmin" style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 16px;">Add New Store 🏪</h3>
        <div style="display:flex; gap:12px; flex-wrap:wrap">
          <input type="text" class="dp-input" placeholder="Store Name" [(ngModel)]="newStore.name" style="flex:1" />
          <input type="email" class="dp-input" placeholder="Owner Email (Corporate User)" [(ngModel)]="newStore.ownerEmail" style="flex:1" />
          <button class="btn btn-primary" (click)="addStore()" [disabled]="addingStore">
            {{ addingStore ? 'Adding...' : 'Create Store' }}
          </button>
        </div>
      </div>

      <div *ngIf="loading" class="dp-loading">
        <div class="spinner"></div> Loading details...
      </div>

      <div class="store-grid" *ngIf="!loading && (isAdmin || isCorporate) && stores.length > 0">
        <div class="card" *ngFor="let store of stores">
          <div class="card-header">
            <h3>{{ store.name }}</h3>
            <span class="badge" [ngClass]="{
              'badge-success': store.status === 'ACTIVE',
              'badge-danger': store.status === 'SUSPENDED',
              'badge-warning': store.status === 'INACTIVE'
            }">{{ store.status }}</span>
          </div>

          <form (ngSubmit)="saveStore(store)" class="settings-form">
            <div class="form-group">
              <label>Store ID</label>
              <input type="text" class="dp-input" [value]="store.id" disabled />
            </div>

            <div class="form-group">
              <label>Owner Email</label>
              <input type="text" class="dp-input" [value]="store.ownerEmail" disabled />
            </div>

            <div class="form-group">
              <label>Store Name</label>
              <input type="text" name="name_{{store.id}}" class="dp-input" [(ngModel)]="store.name" required />
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ updatingId === store.id ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Address Management -->
      <div class="card" style="margin-top: 24px;">
        <div class="card-header">
           <h3 style="margin:0">My Saved Addresses 📍</h3>
           <button class="btn btn-primary btn-sm" (click)="showAddressForm = !showAddressForm">
              {{ showAddressForm ? 'Cancel' : '+ Add Address' }}
           </button>
        </div>

        <div *ngIf="showAddressForm" class="address-form" style="margin-top: 20px; padding: 20px; background: var(--bg-elevated); border-radius: 12px;">
           <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div class="form-group">
                 <label>Title (e.g. Home, Work)</label>
                 <input type="text" class="dp-input" [(ngModel)]="newAddress.title" placeholder="Home" />
              </div>
              <div class="form-group">
                 <label>City</label>
                 <input type="text" class="dp-input" [(ngModel)]="newAddress.city" placeholder="Istanbul" />
              </div>
           </div>
           <div class="form-group" style="margin-top: 16px;">
              <label>Full Address</label>
              <textarea class="dp-input" [(ngModel)]="newAddress.fullAddress" rows="3" placeholder="Street, Block, etc."></textarea>
           </div>
           <div class="form-actions" style="margin-top: 16px;">
              <button class="btn btn-primary" (click)="saveAddress()">Save Address</button>
           </div>
        </div>

        <div class="address-list" style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px;">
           <div class="address-card" *ngFor="let addr of addresses" [class.default]="addr.isDefault">
              <div class="addr-title">
                 <span>{{ addr.title }}</span>
                 <span class="def-badge" *ngIf="addr.isDefault">DEFAULT</span>
              </div>
              <div class="addr-body">
                 <p>{{ addr.fullAddress }}</p>
                 <p><strong>{{ addr.city }}</strong></p>
              </div>
              <div class="addr-footer">
                 <button class="text-danger" (click)="deleteAddress(addr.id!)">Delete</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .store-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    .card-header h3 {
      font-size: 16px;
      color: var(--text-primary);
      margin: 0;
    }
    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-group label {
      font-size: 12px;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .form-actions {
      margin-top: 10px;
      display: flex;
      justify-content: flex-end;
    }
    .mt-3 { margin-top: 12px; }
    .dp-input:disabled { background: var(--bg-surface); color: var(--text-muted); cursor: not-allowed; }
    .brand-pill { font-size: 10px; font-weight: 800; background: rgba(56,189,248,0.1); color: #38bdf8; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-bottom: 4px; text-transform: uppercase; }
    
    /* Address Styles */
    .address-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 16px; position: relative; transition: 0.2s; }
    .address-card.default { border-color: var(--accent); box-shadow: 0 4px 12px var(--accent-glow); }
    .addr-title { font-weight: 800; font-size: 14px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; }
    .def-badge { font-size: 9px; padding: 2px 6px; background: var(--accent); color: white; border-radius: 4px; }
    .addr-body p { font-size: 13px; color: var(--text-secondary); margin: 0; }
    .addr-footer { margin-top: 12px; border-top: 1px solid var(--border); padding-top: 8px; display: flex; justify-content: flex-end; }
    .addr-footer button { background: none; border: none; font-size: 12px; font-weight: 700; cursor: pointer; }
  `]
})
export class SettingsComponent implements OnInit {
  stores: StoreData[] = [];
  loading = true;
  updatingId: number | null = null;
  successMsg: number | null = null;
  errorMsg: number | null = null;
  
  isAdmin = false;
  isCorporate = false;
  addingStore = false;
  newStore = { name: '', ownerEmail: '' };

  // Addresses
  addresses: AddressData[] = [];
  showAddressForm = false;
  newAddress: AddressData = { title: '', fullAddress: '', city: '', isDefault: false };

  constructor(
    private storeService: StoreService, 
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.isAdmin = this.authService.hasRole('ROLE_ADMIN');
    this.isCorporate = this.authService.hasRole('ROLE_CORPORATE');
    this.loadStores();
    this.loadAddresses();
  }

  loadAddresses() {
    this.dashboardService.getAddresses().subscribe(list => this.addresses = list);
  }

  saveAddress() {
    if (!this.newAddress.title || !this.newAddress.fullAddress) return;
    this.dashboardService.addAddress(this.newAddress).subscribe(() => {
        this.showAddressForm = false;
        this.newAddress = { title: '', fullAddress: '', city: '', isDefault: false };
        this.loadAddresses();
    });
  }

  deleteAddress(id: number) {
    this.dashboardService.deleteAddress(id).subscribe(() => this.loadAddresses());
  }

  addStore() {
    if (!this.newStore.name || !this.newStore.ownerEmail) return;
    this.addingStore = true;
    this.storeService.createStore(this.newStore).subscribe({
      next: () => {
        this.addingStore = false;
        this.newStore = { name: '', ownerEmail: '' };
        this.loadStores();
      },
      error: (err) => {
        this.addingStore = false;
        alert('Failed to create store: ' + (err.error?.message || 'User not found or not Corporate'));
      }
    });
  }

  loadStores() {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    if (!roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_CORPORATE')) {
      this.loading = false;
      return;
    }
    
    this.loading = true;
    if (roles.includes('ROLE_ADMIN')) {
      this.storeService.getAllStores().subscribe({
        next: (data) => {
          this.stores = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    } else {
      this.storeService.getMyStores().subscribe({
        next: (data) => {
          this.stores = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  saveStore(store: StoreData) {
    this.updatingId = store.id;
    this.successMsg = null;
    this.errorMsg = null;
    
    this.storeService.updateStore(store.id, { name: store.name, status: store.status }).subscribe({
      next: (res) => {
        this.updatingId = null;
        this.successMsg = store.id;
        setTimeout(() => this.successMsg = null, 3000);
      },
      error: (err) => {
        console.error(err);
        this.updatingId = null;
        this.errorMsg = store.id;
        setTimeout(() => this.errorMsg = null, 3000);
      }
    });
  }
}
