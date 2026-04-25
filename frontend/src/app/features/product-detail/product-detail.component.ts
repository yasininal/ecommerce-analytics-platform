import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';

interface Product {
    id: number;
    name: string;
    description: string;
    unitPrice: number;
    stockQuantity: number;
    imageUrl: string;
    categoryName: string;
    storeName: string;
    sku: string;
}

interface Review {
    id: number;
    userEmail: string;
    productName: string;
    starRating: number;
    sentiment: string;
}

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    template: `
    <div class="product-page-wrapper" *ngIf="product">
      <!-- Breadcrumb / Back nav -->
      <nav class="breadcrumb">
        <a routerLink="/catalog" class="back-link">
          <span class="icon">🏘️</span>
          <span>Marketplace</span>
        </a>
        <span class="sep">/</span>
        <span class="curr">{{ product.categoryName }}</span>
      </nav>

      <div class="main-content-card single-focus">
          <!-- Hero Section -->
          <div class="product-hero">
            <div class="visual-container">
              <div class="main-image-box">
                <img *ngIf="product.imageUrl && product.imageUrl.length > 5" [src]="product.imageUrl" [alt]="product.name">
                <div *ngIf="!product.imageUrl || product.imageUrl.length <= 5" class="emoji-visual">
                  {{ getEmoji(product.categoryName) }}
                </div>
              </div>
            </div>

            <div class="details-side">
              <div class="badge-row">
                <span class="cat-tag">{{ product.categoryName }}</span>
                <span class="stock-tag" [class.low]="product.stockQuantity < 20">
                  <span class="dot"></span> {{ product.stockQuantity }} units available
                </span>
              </div>
              
              <h1 class="p-title">{{ product.name }}</h1>
              <div class="sku-info">SKU: {{ product.sku }} • Vendor: {{ product.storeName }}</div>
              
              <div class="pricing-area">
                <div class="price-display">
                  <span class="curr">$</span>
                  <span class="amt">{{ product.unitPrice }}</span>
                </div>
                <p class="tax-info">Includes all taxes and customs</p>
              </div>

              <div class="action-buttons">
                <div class="qty-selector">
                  <button class="qty-btn" (click)="quantity > 1 && quantity = quantity - 1">−</button>
                  <span class="qty-val">{{ quantity }}</span>
                  <button class="qty-btn" (click)="quantity = quantity + 1">+</button>
                </div>
                <button class="primary-btn" (click)="purchaseNow()" [disabled]="isPurchasing">
                  <span *ngIf="!isPurchasing">💳 Purchase Now</span>
                  <span *ngIf="isPurchasing">Processing...</span>
                </button>
                <button class="secondary-btn">Add to Watchlist</button>
              </div>
              <div *ngIf="paymentError" class="payment-error">⚠️ {{ paymentError }}</div>
            </div>
          </div>

          <!-- Bottom Tabs Style Content -->
          <div class="info-grid">
            <div class="info-block">
              <h3>Product Description</h3>
              <p class="desc-text">{{ product.description }}</p>
              
              <h3 style="margin-top: 40px;">Customer Reviews</h3>
              <div class="reviews-section" *ngIf="reviews.length > 0">
                <div class="review-card" *ngFor="let rev of reviews">
                  <div class="rev-header">
                    <span class="rev-user">{{ rev.userEmail }}</span>
                    <span class="rev-stars">{{ '★'.repeat(rev.starRating) }}{{ '☆'.repeat(5 - rev.starRating) }}</span>
                  </div>
                  <div class="rev-sentiment" [ngClass]="rev.sentiment.toLowerCase()">
                    AI Sentiment: {{ rev.sentiment }}
                  </div>
                </div>
              </div>
              <div *ngIf="reviews.length === 0" class="no-reviews">
                No reviews yet for this product.
              </div>
            </div>
            
            <div class="specs-grid">
              <div class="spec-card">
                <div class="s-icon">📦</div>
                <div class="s-label">Delivery</div>
                <div class="s-val">Express Free</div>
              </div>
              <div class="spec-card">
                <div class="s-icon">🛡️</div>
                <div class="s-label">Warranty</div>
                <div class="s-val">24 Months</div>
              </div>
              <div class="spec-card">
                <div class="s-icon">🔄</div>
                <div class="s-label">Returns</div>
                <div class="s-val">30 Days</div>
              </div>
            </div>
          </div>
      </div>
    </div>
  `,
    styles: [`
    :host { display: block; background: var(--bg-base); min-height: 100vh; color: var(--text-primary); }
    .product-page-wrapper { max-width: 1200px; margin: 0 auto; padding: 40px; }

    /* Navigation */
    .breadcrumb { display: flex; align-items: center; gap: 12px; margin-bottom: 30px; font-size: 13px; font-weight: 500; }
    .back-link { display: flex; align-items: center; gap: 6px; text-decoration: none; color: var(--text-secondary); transition: 0.2s; }
    .back-link:hover { color: var(--accent-light); }
    .sep { color: var(--text-muted); opacity: 0.3; }
    .curr { color: var(--text-muted); }

    .main-content-card.single-focus { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 32px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); overflow: hidden; }

    .product-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid var(--border); }
    
    .visual-container { background: var(--bg-elevated); padding: 60px; display: flex; align-items: center; justify-content: center; position: relative; }
    .main-image-box { width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; border-radius: 20px; }
    .main-image-box img { max-width: 100%; border-radius: 12px; }
    .emoji-visual { font-size: 140px; filter: drop-shadow(0 20px 30px rgba(0,0,0,0.3)); }

    .details-side { padding: 60px; display: flex; flex-direction: column; gap: 24px; }
    .badge-row { display: flex; align-items: center; gap: 16px; }
    .cat-tag { padding: 6px 12px; background: rgba(124, 92, 252, 0.1); color: var(--accent-light); border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
    .stock-tag { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #4ade80; }
    .stock-tag.low { color: #f87171; }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .p-title { font-size: 42px; font-weight: 800; margin: 0; line-height: 1.1; }
    .sku-info { font-size: 14px; color: var(--text-secondary); }

    .pricing-area { margin-top: 10px; }
    .price-display { display: flex; align-items: flex-start; gap: 4px; }
    .curr { font-size: 24px; font-weight: 600; color: var(--accent-light); margin-top: 8px; }
    .amt { font-size: 56px; font-weight: 800; }
    .tax-info { font-size: 12px; color: var(--text-muted); margin: 4px 0 0 0; }

    .action-buttons { display: flex; gap: 16px; margin-top: 20px; align-items: center; }
    .qty-selector { display: flex; align-items: center; gap: 0; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
    .qty-btn { width: 40px; height: 44px; border: none; background: transparent; color: var(--text-primary); font-size: 18px; cursor: pointer; transition: 0.2s; }
    .qty-btn:hover { background: var(--accent-glow); color: var(--accent); }
    .qty-val { width: 36px; text-align: center; font-weight: 700; font-size: 15px; }
    .primary-btn { flex: 1; padding: 18px; background: var(--accent); color: white; border: none; border-radius: 16px; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 15px; }
    .primary-btn:hover:not(:disabled) { background: var(--accent-light); transform: translateY(-4px); box-shadow: 0 10px 20px rgba(124, 92, 252, 0.4); }
    .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .secondary-btn { padding: 18px 24px; background: transparent; border: 1px solid var(--border); color: var(--text-primary); border-radius: 16px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .secondary-btn:hover { background: var(--bg-elevated); }
    .payment-error { margin-top: 12px; padding: 12px 16px; background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 12px; color: #f87171; font-size: 13px; font-weight: 600; }

    .info-grid { padding: 60px; display: grid; grid-template-columns: 1fr 300px; gap: 60px; }
    .info-block h3 { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
    .desc-text { line-height: 1.8; color: var(--text-secondary); font-size: 15px; }

    .specs-grid { display: flex; flex-direction: column; gap: 16px; }
    .spec-card { background: var(--bg-elevated); padding: 16px 20px; border-radius: 16px; border: 1px solid var(--border); display: grid; grid-template-columns: 40px 1fr; gap: 12px; align-items: center; }
    .s-icon { font-size: 20px; }
    .s-label { font-size: 11px; color: var(--text-muted); font-weight: 700; text-transform: uppercase; }
    .s-val { font-size: 14px; font-weight: 600; }

    .reviews-section { display: flex; flex-direction: column; gap: 16px; margin-top: 16px; }
    .review-card { background: var(--bg-elevated); padding: 16px; border-radius: 12px; border: 1px solid var(--border); }
    .rev-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .rev-user { font-weight: 600; font-size: 14px; }
    .rev-stars { color: var(--accent); letter-spacing: 2px; }
    .rev-sentiment { font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; display: inline-block; }
    .rev-sentiment.positive { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
    .rev-sentiment.negative { background: rgba(248, 113, 113, 0.1); color: #f87171; }
    .rev-sentiment.neutral { background: rgba(156, 163, 175, 0.1); color: #9ca3af; }
    .no-reviews { color: var(--text-muted); font-style: italic; margin-top: 16px; }
  `]
})
export class ProductDetailComponent implements OnInit {
    product?: Product;
    reviews: Review[] = [];
    quantity = 1;
    isPurchasing = false;
    paymentError = '';
    
    constructor(
        private route: ActivatedRoute,
        private http: HttpClient
    ) { }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.http.get<Product>(`/api/products/${id}`).subscribe(data => {
                this.product = data;
            });
            this.http.get<Review[]>(`/api/reviews/product/${id}`).subscribe(data => {
                this.reviews = data;
            });
        }
    }

    purchaseNow(): void {
        if (!this.product || this.isPurchasing) return;
        this.isPurchasing = true;
        this.paymentError = '';

        const baseUrl = window.location.origin;
        const body = {
            productName: this.product.name,
            sku: this.product.sku,
            price: this.product.unitPrice,
            quantity: this.quantity,
            successUrl: baseUrl + '/catalog',
            cancelUrl: baseUrl + '/product/' + this.product.id
        };

        this.http.post<{sessionId: string, url: string}>('/api/payments/create-checkout-session', body)
            .subscribe({
                next: (res) => {
                    // Redirect to Stripe Checkout
                    window.location.href = res.url;
                },
                error: (err) => {
                    this.isPurchasing = false;
                    this.paymentError = err.error?.error || 'Payment initialization failed. Please try again.';
                }
            });
    }

    getEmoji(cat: string): string {
        const map: any = { 'Electronics': '💻', 'Fashion': '👗', 'Home': '🏠', 'Books': '📚' };
        return map[cat] || '📦';
    }
}
