import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, ProductData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { StoreService } from '../../core/services/store.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Products Catalog 📦</h1>
          <p>Manage your inventory</p>
        </div>
        <button class="btn btn-primary" *ngIf="userRole !== 'ROLE_INDIVIDUAL'" (click)="openAddModal()">+ Add Product</button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select class="dp-input" [(ngModel)]="categoryFilter" (change)="onSearch()">
          <option value="ALL">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Smartphones">Smartphones</option>
          <option value="Laptops">Laptops</option>
          <option value="Fashion">Fashion</option>
          <option value="Accessories">Accessories</option>
          <option value="Clothing">Clothing</option>
          <option value="Shoes">Shoes</option>
          <option value="Bags">Bags</option>
        </select>
        <input class="dp-input" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="🔍  Search products..." style="flex:1; min-width:200px" />
      </div>

      <!-- Grid -->
      <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading products...</div>
      
      <div class="products-grid" *ngIf="!loading && filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-img">{{ getEmoji(product.categoryName) }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">\${{ product.unitPrice | number:'1.2-2' }}</p>
            <div class="product-footer">
              <span class="stock-badge">{{ product.categoryName }}</span>
              <div class="flex gap-2" *ngIf="userRole !== 'ROLE_INDIVIDUAL'">
                <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px" (click)="openEditModal(product)">Edit</button>
                <button class="btn btn-ghost text-danger" style="padding:4px 10px;font-size:12px" (click)="deleteProduct(product)">Delete</button>
              </div>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
               SKU: {{ product.sku }} <span *ngIf="userRole === 'ROLE_ADMIN'">| Store: {{ product.storeName }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && filteredProducts.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
         No products found.
      </div>
    </div>

    <!-- Modal Overlay -->
    <div class="modal-overlay" *ngIf="showModal">
      <div class="modal-card card shadow-lg">
        <h3>{{ editingProduct?.id ? 'Edit' : 'Add' }} Product</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Name</label>
            <input type="text" class="dp-input" [(ngModel)]="formProduct.name" placeholder="Product Name" />
          </div>
          <div class="form-group">
            <label>SKU</label>
            <input type="text" class="dp-input" [(ngModel)]="formProduct.sku" placeholder="Unique SKU" />
          </div>
          <div class="form-group">
            <label>Price</label>
            <input type="number" class="dp-input" [(ngModel)]="formProduct.unitPrice" />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select class="dp-input" [(ngModel)]="formProduct.categoryName">
              <option value="Electronics">Electronics</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Laptops">Laptops</option>
              <option value="Fashion">Fashion</option>
              <option value="Accessories">Accessories</option>
              <option value="Clothing">Clothing</option>
              <option value="Shoes">Shoes</option>
              <option value="Bags">Bags</option>
            </select>
          </div>
          <!-- Store Selection for Admin -->
          <div class="form-group" *ngIf="userRole === 'ROLE_ADMIN'">
            <label>Store</label>
            <select class="dp-input" [(ngModel)]="formProduct.storeName">
              <option *ngFor="let s of allStores" [value]="s.name">{{ s.name }}</option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" [disabled]="!isFormValid()" (click)="saveProduct()">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 28px 32px; }
    .filters-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; margin-bottom: 24px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
    .product-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition); }
    .product-card:hover { border-color: var(--border-strong); transform: translateY(-3px); box-shadow: var(--shadow-glow); }
    .product-img { height: 120px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .product-info { padding: 16px; }
    .product-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
    .product-price { font-size: 18px; font-weight: 700; color: var(--accent-light); margin-bottom: 12px; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; }
    .stock-badge { font-size: 11px; color: var(--success); background: rgba(0,200,150,0.15); padding: 2px 8px; border-radius: 99px; }
    
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-card { width: 450px; padding: 24px; animation: modal-in 0.3s ease; }
    @keyframes modal-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .form-grid { display: grid; grid-template-columns: 1fr; gap: 16px; margin: 20px 0; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; }
  `]
})
export class ProductsComponent implements OnInit {
  products: ProductData[] = [];
  filteredProducts: ProductData[] = [];
  loading = true;
  userRole = '';
  searchTerm = '';
  categoryFilter = 'ALL';
  
  showModal = false;
  saving = false;
  editingProduct: ProductData | null = null;
  formProduct: Partial<ProductData> = {};
  
  corporateStoreName = '';
  allStores: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private storeService: StoreService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.hasRole('ROLE_ADMIN') ? 'ROLE_ADMIN' : 
                   this.authService.hasRole('ROLE_CORPORATE') ? 'ROLE_CORPORATE' : 'ROLE_INDIVIDUAL';
    
    if (this.userRole === 'ROLE_ADMIN') {
        this.storeService.getAllStores().subscribe(stores => this.allStores = stores);
    }
    
    this.refresh();
  }

  refresh() {
    this.loading = true;
    if (this.userRole === 'ROLE_ADMIN') {
      this.dashboardService.getProducts().subscribe({
        next: (data) => { this.products = data; this.onSearch(); this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.userRole === 'ROLE_CORPORATE') {
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          this.corporateStoreName = summary.storeName;
          if (summary.storeId) {
            this.dashboardService.getProductsByStore(summary.storeId).subscribe({
              next: (data) => { this.products = data; this.onSearch(); this.loading = false; },
              error: () => this.loading = false
            });
          } else { this.loading = false; }
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchCat = this.categoryFilter === 'ALL' || p.categoryName === this.categoryFilter;
      return matchSearch && matchCat;
    });
  }

  isFormValid() {
      return this.formProduct.name && this.formProduct.sku && (this.formProduct.unitPrice !== undefined) && 
             (this.userRole === 'ROLE_CORPORATE' || this.formProduct.storeName);
  }

  openAddModal() {
    this.editingProduct = null;
    this.formProduct = { name: '', sku: '', unitPrice: 0, categoryName: 'Electronics', storeName: this.corporateStoreName };
    this.showModal = true;
  }

  openEditModal(product: ProductData) {
    this.editingProduct = product;
    this.formProduct = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
  }

  saveProduct() {
      if (!this.isFormValid()) return;
      this.saving = true;

      if (this.editingProduct?.id) {
          this.dashboardService.updateProduct(this.editingProduct.id, this.formProduct).subscribe({
              next: () => {
                  this.refresh();
                  this.closeModal();
              },
              error: () => this.saving = false
          });
      } else {
          this.dashboardService.createProduct(this.formProduct).subscribe({
              next: () => {
                  this.refresh();
                  this.closeModal();
              },
              error: () => this.saving = false
          });
      }
  }

  deleteProduct(product: ProductData) {
      if (confirm(`Are you sure you want to delete ${product.name}?`)) {
          this.dashboardService.deleteProduct(product.id).subscribe(() => this.refresh());
      }
  }

  getEmoji(category: string): string {
    switch (category) {
      case 'Smartphones': return '📱';
      case 'Laptops': return '💻';
      case 'Accessories': return '🎧';
      case 'Clothing': return '👕';
      case 'Shoes': return '👟';
      case 'Bags': return '👜';
      case 'Electronics': return '🔌';
      case 'Fashion': return '👗';
      default: return '📦';
    }
  }
}
