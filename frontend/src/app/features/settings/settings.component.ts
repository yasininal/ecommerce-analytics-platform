import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService, StoreData } from '../../core/services/store.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Store Settings</h1>
          <p>Manage your store profile and status</p>
        </div>
      </div>

      <div *ngIf="loading" class="dp-loading">
        <div class="spinner"></div> Loading store details...
      </div>

      <div *ngIf="!loading && stores.length === 0" class="card text-muted">
        No stores found for this account.
      </div>

      <div class="store-grid" *ngIf="!loading && stores.length > 0">
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

            <div class="form-group">
              <label>Status</label>
              <select name="status_{{store.id}}" class="dp-input" [(ngModel)]="store.status">
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn btn-primary">
                {{ updatingId === store.id ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
            
            <div *ngIf="successMsg === store.id" class="text-success text-sm mt-3">Store updated successfully!</div>
            <div *ngIf="errorMsg === store.id" class="text-danger text-sm mt-3">Failed to update store.</div>
          </form>
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
    .mt-3 {
      margin-top: 12px;
    }
    .dp-input:disabled {
        background: var(--bg-surface);
        color: var(--text-muted);
        cursor: not-allowed;
    }
  `]
})
export class SettingsComponent implements OnInit {
  stores: StoreData[] = [];
  loading = true;
  updatingId: number | null = null;
  successMsg: number | null = null;
  errorMsg: number | null = null;

  constructor(private storeService: StoreService, private authService: AuthService) {}

  ngOnInit() {
    this.loadStores();
  }

  loadStores() {
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
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
