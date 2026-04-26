import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';
import { DashboardService, ProductData } from '../dashboard.service';

@Component({
    selector: 'app-catalog',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    template: `
    <div class="homepage">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-badge">🔥 TRENDING NOW</div>
          <h1>Discover Amazing<br>Products</h1>
          <p>Shop the latest tech, fashion & accessories with express delivery</p>
          <div class="hero-search">
            <span class="s-icon">🔍</span>
            <input type="text" [(ngModel)]="filters.search" (input)="applyFilters()" placeholder="Search for products, brands & more...">
          </div>
        </div>
      </section>

      <div class="catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="filters-sidebar">
           <div class="filter-section">
              <h3>Categories</h3>
              <div class="cat-list">
                 <button *ngFor="let cat of categories" 
                         [class.active]="filters.categoryId === cat.id"
                         (click)="setCategoryId(cat.id)"
                         class="cat-link">
                    <span class="emoji">{{ cat.emoji }}</span> {{ cat.name }}
                 </button>
              </div>
           </div>

           <div class="filter-section">
              <h3>Price Range</h3>
              <div class="price-inputs">
                 <input type="number" [(ngModel)]="filters.minPrice" (change)="applyFilters()" placeholder="Min $">
                 <span>-</span>
                 <input type="number" [(ngModel)]="filters.maxPrice" (change)="applyFilters()" placeholder="Max $">
              </div>
           </div>

           <div class="filter-section">
              <button class="clear-btn" (click)="clearFilters()">Clear All Filters</button>
           </div>
        </aside>

        <!-- Main Content -->
        <main class="products-main">
          <div class="section-head">
            <h2>🛍️ Products</h2>
            <span class="result-count">{{ filteredProducts.length }} products</span>
          </div>

          <div class="loading-overlay" *ngIf="loading">
            <div class="spinner"></div>
          </div>

          <div class="products-grid" *ngIf="!loading">
            <div class="product-card" *ngFor="let p of filteredProducts">
              <div class="card-visual" (click)="viewDetail(p.id)">
                 <div class="p-emoji">{{ getEmoji(p.categoryName) }}</div>
                 <div class="card-overlay">
                   <button class="view-btn">View Details →</button>
                 </div>
                 <button class="wishlist-btn" 
                         [class.active]="wishlistedIds.has(p.id)"
                         (click)="toggleWishlist($event, p.id)" 
                         *ngIf="canShop">
                    <span *ngIf="!wishlistedIds.has(p.id)">🤍</span>
                    <span *ngIf="wishlistedIds.has(p.id)">❤️</span>
                 </button>
                 <div class="stock-badge" *ngIf="p.stockQuantity < 10">Only {{ p.stockQuantity }} left!</div>
              </div>
              <div class="card-body">
                <div class="brand-pill" *ngIf="p.brand">{{ p.brand }}</div>
                <div class="cat-pill">{{ p.categoryName }}</div>
                <h3 class="p-title" (click)="viewDetail(p.id)">{{ p.name }}</h3>
                <div class="p-meta">
                  <span class="store">🏪 {{ p.storeName }}</span>
                </div>
                <div class="card-footer">
                  <div class="price-box">
                    <span class="currency">$</span>
                    <span class="val">{{ p.unitPrice }}</span>
                  </div>
                  <button class="add-cart-btn" (click)="addToCart($event, p)" [class.added]="addedIds.has(p.id)">
                    <span *ngIf="!addedIds.has(p.id)">🛒 Add</span>
                    <span *ngIf="addedIds.has(p.id)">✅</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="!loading && filteredProducts.length === 0">
            <div class="empty-icon">📂</div>
            <h3>No products found</h3>
            <p>Try adjusting your search or category filters.</p>
          </div>
        </main>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; background: var(--bg-base); }
    .homepage { min-height: 100vh; }

    /* ── Hero Banner ── */
    .hero-banner {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      padding: 60px 48px 50px;
      position: relative;
      overflow: hidden;
    }
    .hero-banner::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(124,92,252,0.15), transparent 70%);
      border-radius: 50%;
    }
    .hero-banner::after {
      content: '';
      position: absolute;
      bottom: -30%;
      left: -10%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(56,189,248,0.1), transparent 70%);
      border-radius: 50%;
    }
    .hero-content { position: relative; z-index: 1; max-width: 700px; }
    .hero-badge { display: inline-block; padding: 6px 14px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; border-radius: 99px; font-size: 12px; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 16px; }
    .hero-content h1 { font-size: 48px; font-weight: 800; color: white; line-height: 1.15; margin: 0 0 12px; }
    .hero-content p { font-size: 16px; color: rgba(255,255,255,0.6); margin: 0 0 24px; line-height: 1.5; }
    .hero-search { position: relative; max-width: 500px; }
    .hero-search input { width: 100%; padding: 16px 20px 16px 48px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); color: white; font-size: 15px; outline: none; transition: 0.3s; }
    .hero-search input::placeholder { color: rgba(255,255,255,0.35); }
    .hero-search input:focus { border-color: var(--accent); background: rgba(255,255,255,0.1); box-shadow: 0 0 0 4px rgba(124,92,252,0.15); }
    .s-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); font-size: 18px; opacity: 0.5; }
    .hero-stats { display: flex; align-items: center; gap: 24px; margin-top: 28px; }
    .stat { display: flex; flex-direction: column; gap: 2px; }
    .stat strong { font-size: 18px; font-weight: 800; color: white; }
    .stat span { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; text-transform: uppercase; }
    .stat-sep { width: 1px; height: 28px; background: rgba(255,255,255,0.1); }

    /* ── Catalog Layout ── */
    .catalog-layout { display: grid; grid-template-columns: 280px 1fr; gap: 32px; padding: 40px 48px; }
    
    .filters-sidebar { position: sticky; top: 100px; height: fit-content; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; padding: 24px; }
    .filter-section { margin-bottom: 32px; }
    .filter-section h3 { font-size: 15px; font-weight: 800; margin-bottom: 16px; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; }
    
    .cat-list { display: flex; flex-direction: column; gap: 8px; }
    .cat-link { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 1px solid transparent; background: none; color: var(--text-secondary); cursor: pointer; transition: 0.2s; text-align: left; font-weight: 600; font-size: 14px; }
    .cat-link:hover { background: var(--bg-elevated); color: var(--text-primary); }
    .cat-link.active { background: var(--accent); color: white; }
    
    .price-inputs { display: flex; align-items: center; gap: 10px; }
    .price-inputs input { width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-primary); outline: none; font-size: 14px; }
    .price-inputs input:focus { border-color: var(--accent); }
    
    .clear-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px solid #ef4444; background: rgba(239,68,68,0.05); color: #ef4444; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .clear-btn:hover { background: #ef4444; color: white; }

    /* ── Products Main ── */
    .products-main { min-width: 0; }
    .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .section-head h2 { font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 0; }
    .result-count { font-size: 14px; color: var(--text-muted); font-weight: 600; }

    /* Product Grid */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .product-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .product-card:hover { transform: translateY(-6px); border-color: var(--accent); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }

    .card-visual { height: 180px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; cursor: pointer; }
    .p-emoji { font-size: 64px; transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .product-card:hover .p-emoji { transform: scale(1.15) rotate(5deg); }
    
    .card-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; opacity: 0; transition: 0.3s; backdrop-filter: blur(2px); }
    .product-card:hover .card-overlay { opacity: 1; }
    .view-btn { padding: 10px 20px; background: white; color: black; border: none; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; transform: translateY(20px); transition: 0.3s 0.1s; box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
    .product-card:hover .view-btn { transform: translateY(0); }
    .view-btn:hover { background: var(--accent); color: white; }

    .wishlist-btn { position: absolute; top: 12px; right: 12px; width: 36px; height: 36px; border-radius: 50%; border: none; background: rgba(255,255,255,0.9); display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 2; transition: 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); font-size: 16px; }
    .wishlist-btn:hover { transform: scale(1.1); background: white; }
    .wishlist-btn.active { color: #f43f5e; }

    .stock-badge { position: absolute; bottom: 12px; left: 12px; background: rgba(239,68,68,0.9); color: white; font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 20px; backdrop-filter: blur(4px); }

    .card-body { padding: 18px; }
    .brand-pill { font-size: 10px; font-weight: 800; background: var(--accent-glow); color: var(--accent); padding: 4px 10px; border-radius: 20px; display: inline-block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .cat-pill { font-size: 11px; font-weight: 600; color: var(--text-muted); margin-left: 8px; }
    .p-title { font-size: 16px; font-weight: 800; color: var(--text-primary); margin: 0 0 10px 0; line-height: 1.4; transition: 0.2s; }
    .p-meta { margin-bottom: 18px; }
    .store { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--text-muted); font-weight: 500; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid var(--border); }
    .price-box { display: flex; align-items: flex-start; }
    .currency { font-size: 13px; font-weight: 700; color: var(--accent); margin-top: 3px; margin-right: 1px; }
    .val { font-size: 24px; font-weight: 900; color: var(--text-primary); }

    .add-cart-btn { padding: 10px 18px; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; font-size: 13px; font-weight: 800; display: flex; align-items: center; gap: 6px; transition: 0.2s; color: var(--text-primary); }
    .add-cart-btn:hover { background: var(--accent); border-color: var(--accent); color: white; transform: scale(1.05); box-shadow: 0 4px 15px rgba(241,100,30,0.3); }
    .add-cart-btn.added { background: #22c55e; border-color: #22c55e; color: white; }

    .empty-state { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.5; }
    .empty-state h3 { font-size: 20px; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); }

    .loading-overlay { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class CatalogComponent implements OnInit {
    products: ProductData[] = [];
    filteredProducts: ProductData[] = [];
    categories: any[] = [];
    
    filters = {
        categoryId: null as number | null,
        minPrice: null as number | null,
        maxPrice: null as number | null,
        search: ''
    };

    loading = true;
    addedIds = new Set<number>();
    wishlistedIds = new Set<number>();
    canShop = false;

    constructor(
        private dashboardService: DashboardService,
        private router: Router, 
        private cartService: CartService,
        private wishlistService: WishlistService,
        private authService: AuthService
    ) { 
        // Everyone can shop (add to cart), but some features like wishlist need login
        this.canShop = true; 
    }

    ngOnInit() { 
        this.loadCategories();
        this.applyFilters();
        if (this.authService.token) {
            this.loadWishlist();
        }
    }

    loadCategories() {
        this.dashboardService.getCategories().subscribe(list => {
            const all = { id: null, name: 'All Products', emoji: '🏠' };
            this.categories = [all, ...list.map(c => ({
                ...c,
                emoji: this.getEmoji(c.name)
            }))];
        });
    }
    
    loadWishlist() {
        if (!this.authService.token) return; // Don't load if guest
        this.wishlistService.getUserWishlist().subscribe(list => {
            this.wishlistedIds = new Set(list.map(w => w.productId));
        });
    }

    toggleWishlist(event: MouseEvent, productId: number) {
        event.stopPropagation();
        if (!this.authService.token) {
            this.router.navigate(['/login'], { queryParams: { returnUrl: '/catalog' } });
            return;
        }
        this.wishlistService.toggleWishlist(productId).subscribe(() => {
            if (this.wishlistedIds.has(productId)) {
                this.wishlistedIds.delete(productId);
            } else {
                this.wishlistedIds.add(productId);
            }
        });
    }

    applyFilters() {
        this.loading = true;
        this.dashboardService.searchProducts(this.filters).subscribe({
            next: (data) => { 
                this.filteredProducts = data; 
                this.loading = false; 
            },
            error: () => (this.loading = false)
        });
    }

    setCategoryId(id: number | null) {
        this.filters.categoryId = id;
        this.applyFilters();
    }

    clearFilters() {
        this.filters = {
            categoryId: null,
            minPrice: null,
            maxPrice: null,
            search: ''
        };
        this.applyFilters();
    }

    getEmoji(category: string): string {
        const mapping: { [key: string]: string } = {
            'All': '🏠', 'Smartphones': '📱', 'Laptops': '💻', 'Accessories': '🎧',
            'Clothing': '👕', 'Shoes': '👟', 'Bags': '👜', 'Electronics': '⚡', 'Fashion': '👗'
        };
        return mapping[category] || '📦';
    }

    viewDetail(id: number) { this.router.navigate(['/catalog', id]); }

    addToCart(event: Event, p: ProductData) {
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
