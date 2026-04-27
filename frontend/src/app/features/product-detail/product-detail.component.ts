import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
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
    comment: string;
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
                <button class="primary-btn" (click)="addToCart()" [class.added]="addedToCart">
                  <span *ngIf="!addedToCart">🛒 Add to Cart</span>
                  <span *ngIf="addedToCart">✅ Added!</span>
                </button>
                <a routerLink="/cart" class="secondary-btn" *ngIf="addedToCart">View Cart</a>
              </div>
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
                  <p class="rev-comment" *ngIf="rev.comment">{{ rev.comment }}</p>
                </div>
              </div>
              <div *ngIf="reviews.length === 0" class="no-reviews">
                No reviews yet for this product.
              </div>

              <!-- Write Review Form -->
              <div class="write-review-box" *ngIf="isLoggedIn">
                 <h4 style="margin-top:20px; font-weight:700;">Write a Review</h4>
                 <div class="star-rating-select">
                    <span *ngFor="let s of [1,2,3,4,5]" (click)="newReview.starRating = s" 
                          [class.active]="s <= newReview.starRating">★</span>
                 </div>
                 <textarea [(ngModel)]="newReview.comment" placeholder="What did you think about this product?" class="review-input"></textarea>
                  <button class="primary-btn submit-rev-btn" 
                          (click)="submitReview()" 
                          [disabled]="newReview.starRating === 0 || !newReview.comment || isSubmitting">
                    <span *ngIf="!isSubmitting">Submit Review</span>
                    <span *ngIf="isSubmitting">🧠 AI Analyzing...</span>
                  </button>
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
    .rev-comment { font-size: 14px; margin-top: 10px; line-height: 1.5; color: var(--text-primary); }
    
    .write-review-box { background: var(--bg-elevated); padding: 20px; border-radius: 16px; border: 1px solid var(--border); margin-top: 24px; }
    .star-rating-select { font-size: 24px; cursor: pointer; color: var(--border); margin-bottom: 12px; }
    .star-rating-select span.active { color: var(--accent); }
    .review-input { width: 100%; height: 80px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 12px; color: var(--text-primary); margin-bottom: 12px; resize: none; font-family: inherit; }
    .submit-rev-btn { padding: 12px 20px; font-size: 13px; width: auto; }
  `]
})
export class ProductDetailComponent implements OnInit {
    product?: Product;
    reviews: Review[] = [];
    quantity = 1;
    addedToCart = false;
    canShop = false;
    isLoggedIn = false;
    isSubmitting = false;
    newReview = { starRating: 0, comment: '' };
    
    constructor(
        private route: ActivatedRoute,
        private http: HttpClient,
        private cartService: CartService,
        private authService: AuthService
    ) { 
        this.canShop = true; // Everyone can see and add to cart
        this.isLoggedIn = !!this.authService.token;
    }

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

    addToCart(): void {
        if (!this.product) return;
        this.cartService.addToCart({
            productId: this.product.id,
            productName: this.product.name,
            price: this.product.unitPrice,
            quantity: this.quantity,
            storeName: this.product.storeName,
            categoryName: this.product.categoryName
        });
        this.addedToCart = true;
        setTimeout(() => this.addedToCart = false, 3000);
    }

    getEmoji(cat: string): string {
        const map: any = { 'Electronics': '💻', 'Fashion': '👗', 'Home': '🏠', 'Books': '📚' };
        return map[cat] || '📦';
    }

    submitReview() {
        if (!this.product || this.newReview.starRating === 0) return;
        const payload = {
            productId: this.product.id,
            userId: this.authService.getUserId(),
            starRating: this.newReview.starRating,
            comment: this.newReview.comment
        };
        this.isSubmitting = true;
        this.http.post<Review>('/api/reviews', payload).subscribe({
            next: (rev) => {
                this.reviews.unshift(rev);
                this.newReview = { starRating: 0, comment: '' };
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Review submission failed', err);
                this.isSubmitting = false;
                alert('Failed to submit review. Please try again.');
            }
        });
    }
}
