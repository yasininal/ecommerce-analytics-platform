import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/auth/auth.service';

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
    <div class="homepage">
      <!-- Hero Banner -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-badge">🔥 TRENDING NOW</div>
          <h1>Discover Amazing<br>Products</h1>
          <p>Shop the latest tech, fashion & accessories with express delivery</p>
          <div class="hero-search">
            <span class="s-icon">🔍</span>
            <input type="text" [(ngModel)]="searchQuery" (input)="filterProducts()" placeholder="Search for products, brands & more...">
          </div>
          <div class="hero-stats">
            <div class="stat"><strong>{{ products.length }}+</strong><span>Products</span></div>
            <div class="stat-sep"></div>
            <div class="stat"><strong>2</strong><span>Stores</span></div>
            <div class="stat-sep"></div>
            <div class="stat"><strong>FREE</strong><span>Shipping</span></div>
          </div>
        </div>
      </section>

      <!-- Category Quick Access -->
      <section class="category-strip">
        <button *ngFor="let cat of categories"
                [class.active]="activeCategory === cat.name"
                (click)="setCategory(cat.name)"
                class="cat-chip">
          <span class="cat-icon">{{ cat.emoji }}</span>
          <span class="cat-label">{{ cat.name }}</span>
        </button>
      </section>

      <!-- Products Grid -->
      <section class="products-section">
        <div class="section-head">
          <h2 *ngIf="activeCategory === 'All'">🛍️ All Products</h2>
          <h2 *ngIf="activeCategory !== 'All'">{{ getEmoji(activeCategory) }} {{ activeCategory }}</h2>
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
               <button class="wishlist-btn" (click)="toggleWishlist($event, p.id)" *ngIf="canShop">
                  <span *ngIf="!wishlistedIds.has(p.id)">🤍</span>
                  <span *ngIf="wishlistedIds.has(p.id)">❤️</span>
               </button>
               <div class="stock-badge" *ngIf="p.stockQuantity < 10">Only {{ p.stockQuantity }} left!</div>
            </div>
            <div class="card-body">
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
      </section>
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

    /* ── Category Strip ── */
    .category-strip { display: flex; gap: 10px; padding: 20px 48px; overflow-x: auto; background: var(--bg-surface); border-bottom: 1px solid var(--border); }
    .cat-chip { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 99px; border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; transition: 0.2s; white-space: nowrap; font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .cat-chip:hover { border-color: var(--accent); color: var(--text-primary); }
    .cat-chip.active { background: var(--accent); color: white; border-color: var(--accent); box-shadow: 0 4px 12px rgba(124,92,252,0.3); }
    .cat-icon { font-size: 16px; }

    /* ── Products Section ── */
    .products-section { padding: 32px 48px 60px; }
    .section-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .section-head h2 { font-size: 22px; font-weight: 800; color: var(--text-primary); margin: 0; }
    .result-count { font-size: 13px; color: var(--text-muted); font-weight: 600; }

    /* Product Grid */
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
    .product-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .product-card:hover { transform: translateY(-6px); border-color: var(--accent); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }

    .card-visual {
      height: 200px;
      background: var(--bg-elevated);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      cursor: pointer;
    }
    .p-emoji { font-size: 72px; transition: transform 0.3s; }
    .product-card:hover .p-emoji { transform: scale(1.1); }
    .stock-badge { position: absolute; top: 12px; right: 12px; padding: 4px 10px; background: rgba(239,68,68,0.9); color: white; border-radius: 8px; font-size: 11px; font-weight: 700; }

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
    .view-btn { padding: 10px 20px; background: white; color: black; border-radius: 12px; font-weight: 700; border: none; font-size: 13px; transform: translateY(10px); transition: 0.3s; cursor: pointer; }
    .product-card:hover .view-btn { transform: translateY(0); }
    .wishlist-btn { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.2); backdrop-filter: blur(4px); border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; z-index: 2; font-size: 16px; }
    .wishlist-btn:hover { transform: scale(1.1); background: rgba(255,255,255,0.4); }

    .card-body { padding: 20px; }
    .cat-pill { font-size: 10px; font-weight: 800; color: var(--accent-light); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
    .p-title { font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0 0 8px 0; line-height: 1.3; cursor: pointer; }
    .p-title:hover { color: var(--accent); }
    .p-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .store { font-size: 12px; color: var(--text-secondary); }

    .card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); }
    .price-box { display: flex; align-items: flex-start; gap: 2px; }
    .currency { font-size: 14px; font-weight: 600; color: var(--accent-light); margin-top: 4px; }
    .val { font-size: 22px; font-weight: 800; color: var(--text-primary); }

    .add-cart-btn { padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-elevated); cursor: pointer; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: 0.2s; color: var(--text-primary); }
    .add-cart-btn:hover { background: var(--accent); border-color: var(--accent); color: white; transform: scale(1.05); }
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
    products: Product[] = [];
    filteredProducts: Product[] = [];
    categories = [
        { name: 'All', emoji: '🏠' },
        { name: 'Smartphones', emoji: '📱' },
        { name: 'Laptops', emoji: '💻' },
        { name: 'Accessories', emoji: '🎧' },
        { name: 'Clothing', emoji: '👕' },
        { name: 'Shoes', emoji: '👟' },
        { name: 'Bags', emoji: '👜' },
    ];
    activeCategory = 'All';
    searchQuery = '';
    loading = true;
    addedIds = new Set<number>();
    wishlistedIds = new Set<number>();
    canShop = false;

    constructor(
        private http: HttpClient, 
        private router: Router, 
        private cartService: CartService,
        private wishlistService: WishlistService,
        private authService: AuthService
    ) { 
        this.canShop = !!this.authService.getUserId();
    }

    ngOnInit() { 
        this.loadProducts(); 
        if (this.canShop) {
            this.loadWishlist();
        }
    }
    
    loadWishlist() {
        this.wishlistService.getUserWishlist().subscribe(list => {
            list.forEach(w => this.wishlistedIds.add(w.productId));
        });
    }

    toggleWishlist(event: Event, productId: number) {
        event.stopPropagation();
        this.wishlistService.toggleWishlist(productId).subscribe(() => {
            if (this.wishlistedIds.has(productId)) {
                this.wishlistedIds.delete(productId);
            } else {
                this.wishlistedIds.add(productId);
            }
        });
    }

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
