import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, ProductData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

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
        <button class="btn btn-primary" *ngIf="userRole !== 'ROLE_INDIVIDUAL'">+ Add Product</button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select class="dp-input">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Smartphones</option>
          <option>Laptops</option>
          <option>Fashion</option>
        </select>
        <input class="dp-input" placeholder="🔍  Search products..." style="flex:1; min-width:200px" />
      </div>

      <!-- Grid -->
      <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading products...</div>
      
      <div class="products-grid" *ngIf="!loading && products.length > 0">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-img">{{ getEmoji(product.categoryName) }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">\${{ product.unitPrice | number:'1.2-2' }}</p>
            <div class="product-footer">
              <span class="stock-badge">{{ product.categoryName }}</span>
              <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px">Edit</button>
            </div>
            <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">
               SKU: {{ product.sku }} | Store: {{ product.storeName }}
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && products.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
         No products found.
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
  `]
})
export class ProductsComponent implements OnInit {
  products: ProductData[] = [];
  loading = true;
  userRole = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getProducts().subscribe({
        next: (data) => { this.products = data; this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.authService.hasRole('ROLE_CORPORATE')) {
      this.userRole = 'ROLE_CORPORATE';
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          if (summary.storeId) {
            this.dashboardService.getProductsByStore(summary.storeId).subscribe({
              next: (data) => { this.products = data; this.loading = false; },
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
      this.loading = false; // Individuals usually don't need a product grid here
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
