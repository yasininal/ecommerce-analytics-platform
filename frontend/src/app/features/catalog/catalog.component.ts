import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

export interface Product {
    id: number;
    name: string;
    sku: string;
    unitPrice: number;
    categoryName: string;
    storeName: string;
    description?: string;
    imageUrl?: string;
    stockQuantity: number;
}

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="marketplace-wrapper">
      <!-- Sidebar / Filters -->
      <aside class="filter-sidebar">
        <div class="sidebar-header">
          <span class="sidebar-icon">📑</span>
          <h2>Filters</h2>
        </div>

        <div class="filter-section">
          <label class="section-label">Categories</label>
          <div class="category-links">
            <button *ngFor="let cat of categories" 
                    [class.active]="activeCategory === cat"
                    (click)="setCategory(cat)"
                    class="category-btn">
              <span class="cat-emoji">{{ getEmoji(cat) }}</span>
              <span class="cat-name">{{ cat }}</span>
            </button>
          </div>
        </div>

        <div class="filter-section promo-banner">
          <div class="promo-content">
            <span class="promo-badge">NEW</span>
            <h4>AI Assistant Ready!</h4>
            <p>Need deep insights? Talk to our AI on any product page.</p>
          </div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="marketplace-content">
        <header class="marketplace-header">
          <div class="header-main">
            <div class="title-group">
              <h1 class="page-title">Digital Marketplace</h1>
              <p class="results-count">Showing {{ filteredProducts.length }} products</p>
            </div>
            <div class="search-box">
              <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="What are you looking for?">
              <span class="search-icon">🔍</span>
            </div>
          </div>
        </header>

        <div class="products-wrap">
          <div class="loading-overlay" *ngIf="loading">
             <div class="spinner"></div>
          </div>

          <div class="products-grid" *ngIf="!loading">
            <div class="product-card" *ngFor="let p of filteredProducts" (click)="viewDetail(p.id)">
              <div class="card-visual">
                 <img *ngIf="p.imageUrl && p.imageUrl.length > 5" [src]="p.imageUrl" [alt]="p.name" class="p-img">
                 <div *ngIf="!p.imageUrl || p.imageUrl.length <= 5" class="p-emoji">
                    {{ getEmoji(p.categoryName) }}
                 </div>
                 <div class="card-overlay">
                   <button class="view-btn">View Insights →</button>
                 </div>
              </div>
              
              <div class="card-body">
                <div class="cat-pill">{{ p.categoryName }}</div>
                <h3 class="p-title">{{ p.name }}</h3>
                <div class="p-meta">
                  <span class="store">🏪 {{ p.storeName }}</span>
                </div>
                <div class="card-footer">
                  <div class="price-box">
                    <span class="currency">$</span>
                    <span class="val">{{ p.unitPrice }}</span>
                  </div>
                  <button class="add-cart-btn" (click)="addToCart($event, p)" [class.added]="addedIds.has(p.id)">
                    <span *ngIf="!addedIds.has(p.id)">🛒</span>
                    <span *ngIf="addedIds.has(p.id)">✅</span>
                  </button>
                </div>
                <div class="stock-row">
                  <div class="stock-status" [class.low]="p.stockQuantity < 20">
                    <div class="dot"></div>
                    {{ p.stockQuantity }} left
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loading && filteredProducts.length === 0">
            <div class="empty-icon">📂</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filters.</p>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; background: var(--bg-base); min-height: 100vh; }
    .marketplace-wrapper { display: grid; grid-template-columns: 280px 1fr; gap: 0; min-height: 100vh; }
    
    /* Sidebar Styling */
    .filter-sidebar { 
      background: var(--bg-surface); 
      border-right: 1px solid var(--border); 
      padding: 30px 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 32px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }
    .sidebar-header { display: flex; align-items: center; gap: 12px; }
    .sidebar-icon { font-size: 24px; }
    .sidebar-header h2 { font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0; }
    
    .section-label { font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 16px; }
    .category-links { display: flex; flex-direction: column; gap: 6px; }
    .category-btn { 
      display: flex; 
      align-items: center; 
      gap: 12px; 
      padding: 12px 16px; 
      border-radius: 12px; 
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
    }
    .category-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
    .category-btn.active { background: var(--accent-light); color: white; border-color: var(--accent); box-shadow: 0 4px 12px rgba(124, 92, 252, 0.2); }
    .cat-emoji { font-size: 18px; }
    .cat-name { font-size: 14px; font-weight: 500; }

    .promo-banner { margin-top: auto; padding: 20px; background: linear-gradient(135deg, rgba(124,92,252,0.1), rgba(56,189,248,0.1)); border: 1px solid var(--accent); border-radius: 16px; }
    .promo-badge { background: var(--accent); color: white; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
    .promo-content h4 { font-size: 14px; margin: 0 0 4px 0; color: var(--text-primary); }
    .promo-content p { font-size: 12px; color: var(--text-secondary); margin: 0; line-height: 1.4; }

    /* Main Content Styling */
    .marketplace-content { padding: 40px; }
    .marketplace-header { margin-bottom: 40px; }
    .header-main { display: flex; justify-content: space-between; align-items: center; gap: 40px; }
    .page-title { font-size: 32px; font-weight: 800; color: var(--text-primary); margin: 0 0 4px 0; }
    .results-count { font-size: 14px; color: var(--text-muted); margin: 0; }
    
    .search-box { position: relative; width: 400px; }
    .search-box input { 
      width: 100%; 
      padding: 14px 20px 14px 48px; 
      background: var(--bg-surface); 
      border: 1px solid var(--border); 
      border-radius: 14px; 
      color: var(--text-primary); 
      font-size: 14px;
      transition: all 0.2s;
    }
    .search-box input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(124, 92, 252, 0.1); outline: none; }
    .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); opacity: 0.5; font-size: 18px; }

    /* Product Grid */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
    .product-card { 
      background: var(--bg-surface); 
      border: 1px solid var(--border); 
      border-radius: 20px; 
      overflow: hidden; 
      cursor: pointer; 
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .product-card:hover { transform: translateY(-8px); border-color: var(--accent); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    
    .card-visual { 
      height: 220px; 
      background: var(--bg-elevated); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      position: relative;
      overflow: hidden;
    }
    .p-img { width: 100%; height: 100%; object-fit: cover; }
    .p-emoji { font-size: 80px; transition: transform 0.3s; }
    .product-card:hover .p-emoji { transform: scale(1.1); }
    
    .card-overlay { 
      position: absolute; 
      inset: 0; 
      background: rgba(0,0,0,0.4); 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      opacity: 0; 
      transition: 0.3s; 
      backdrop-filter: blur(4px);
    }
    .product-card:hover .card-overlay { opacity: 1; }
    .view-btn { padding: 10px 20px; background: white; color: black; border-radius: 12px; font-weight: 700; border: none; font-size: 13px; transform: translateY(10px); transition: 0.3s; }
    .product-card:hover .view-btn { transform: translateY(0); }

    .card-body { padding: 24px; }
    .cat-pill { font-size: 10px; font-weight: 800; color: var(--accent-light); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em; }
    .p-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 12px 0; line-height: 1.3; }
    .p-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .store { font-size: 12px; color: var(--text-secondary); }

    .card-footer { display: flex; justify-content: space-between; align-items: flex-end; padding-top: 16px; border-top: 1px solid var(--border); }
    .price-box { display: flex; align-items: flex-start; gap: 2px; }
    .currency { font-size: 14px; font-weight: 600; color: var(--accent-light); margin-top: 4px; }
    .val { font-size: 24px; font-weight: 800; color: var(--text-primary); }

    .stock-status { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: #4ade80; }
    .stock-status.low { color: #f87171; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .stock-row { padding: 0 24px 16px; }
    .add-cart-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .add-cart-btn:hover { background: var(--accent); border-color: var(--accent); transform: scale(1.1); }
    .add-cart-btn.added { background: #22c55e; border-color: #22c55e; }

    .empty-state { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.5; }
    .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); }
  `]
})
export class CatalogComponent implements OnInit {
    products: Product[] = [];
    filteredProducts: Product[] = [];
    categories: string[] = ['All', 'Electronics', 'Smartphones', 'Laptops', 'Accessories', 'Fashion', 'Clothing', 'Shoes', 'Bags'];
    activeCategory = 'All';
    searchQuery = '';
    loading = true;
    addedIds = new Set<number>();

    constructor(private http: HttpClient, private router: Router, private cartService: CartService) { }

    ngOnInit() { this.loadProducts(); }

    loadProducts() {
        this.http.get<Product[]>('/api/products').subscribe({
            next: (data) => { this.products = data; this.filterProducts(); this.loading = false; },
            error: () => (this.loading = false)
        });
    }

    getEmoji(category: string): string {
        const mapping: { [key: string]: string } = {
            'All': '🏠', 'Smartphones': '📱', 'Laptops': '💻', 'Accessories': '🎧',
            'Clothing': '👕', 'Shoes': '👟', 'Bags': '👜', 'Electronics': '⚡', 'Fashion': '👗'
        };
        return mapping[category] || '📦';
    }

    setCategory(cat: string) { this.activeCategory = cat; this.filterProducts(); }

    filterProducts() {
        this.filteredProducts = this.products.filter(p => {
            const matchesCat = this.activeCategory === 'All' || p.categoryName === this.activeCategory;
            const matchesSearch = p.name.toLowerCase().includes(this.searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });
    }

    viewDetail(id: number) { this.router.navigate(['/catalog', id]); }

    addToCart(event: Event, p: Product) {
        event.stopPropagation();
        this.cartService.addToCart({
            productId: p.id,
            productName: p.name,
            price: p.unitPrice,
            quantity: 1,
            storeName: p.storeName,
            categoryName: p.categoryName
        });
        this.addedIds.add(p.id);
        setTimeout(() => this.addedIds.delete(p.id), 2000);
    }
}
