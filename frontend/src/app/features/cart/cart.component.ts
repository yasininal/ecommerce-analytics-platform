import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, CartItem } from '../../core/services/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="cart-page">
      <div class="cart-header">
        <h1>🛒 Shopping Cart</h1>
        <p class="item-count">{{ items.length }} item(s)</p>
      </div>

      <div class="cart-empty" *ngIf="items.length === 0">
        <div class="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Browse the marketplace and add some products!</p>
        <a routerLink="/catalog" class="browse-btn">Browse Products</a>
      </div>

      <div class="cart-layout" *ngIf="items.length > 0">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of items">
            <div class="item-emoji">{{ getEmoji(item.categoryName) }}</div>
            <div class="item-info">
              <h3>{{ item.productName }}</h3>
              <p class="item-store">{{ item.storeName }}</p>
            </div>
            <div class="item-qty">
              <button class="q-btn" (click)="updateQty(item.productId, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button class="q-btn" (click)="updateQty(item.productId, item.quantity + 1)">+</button>
            </div>
            <div class="item-price">\${{ (item.price * item.quantity).toFixed(2) }}</div>
            <button class="remove-btn" (click)="remove(item.productId)">✕</button>
          </div>
        </div>

        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>\${{ cartService.getTotal().toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span class="free">FREE</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-row total">
            <span>Total</span>
            <span>\${{ cartService.getTotal().toFixed(2) }}</span>
          </div>
          <button class="checkout-btn" (click)="checkout()" [disabled]="isCheckingOut">
            <span *ngIf="!isCheckingOut">💳 Proceed to Checkout</span>
            <span *ngIf="isCheckingOut">Processing...</span>
          </button>
          <div *ngIf="checkoutError" class="checkout-error">⚠️ {{ checkoutError }}</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .cart-page { max-width: 1100px; margin: 0 auto; padding: 40px; }
    .cart-header { margin-bottom: 32px; }
    .cart-header h1 { font-size: 28px; font-weight: 800; margin: 0; }
    .item-count { color: var(--text-muted); margin: 4px 0 0; }

    .cart-empty { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 80px; margin-bottom: 20px; opacity: 0.3; }
    .cart-empty h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .cart-empty p { color: var(--text-muted); margin-bottom: 24px; }
    .browse-btn { display: inline-block; padding: 14px 32px; background: var(--accent); color: white; border-radius: 14px; text-decoration: none; font-weight: 700; transition: 0.2s; }
    .browse-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(241,100,30,0.3); }

    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 32px; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 12px; }
    .cart-item { display: flex; align-items: center; gap: 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; transition: 0.2s; }
    .cart-item:hover { border-color: var(--accent); }
    .item-emoji { font-size: 36px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: var(--bg-elevated); border-radius: 12px; }
    .item-info { flex: 1; }
    .item-info h3 { margin: 0; font-size: 15px; font-weight: 700; }
    .item-store { margin: 2px 0 0; font-size: 12px; color: var(--text-muted); }
    .item-qty { display: flex; align-items: center; gap: 0; background: var(--bg-elevated); border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
    .q-btn { width: 32px; height: 32px; border: none; background: transparent; color: var(--text-primary); cursor: pointer; font-size: 16px; }
    .q-btn:hover { background: var(--accent-glow); color: var(--accent); }
    .item-qty span { width: 28px; text-align: center; font-weight: 700; font-size: 14px; }
    .item-price { font-weight: 800; font-size: 16px; min-width: 80px; text-align: right; }
    .remove-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; padding: 8px; border-radius: 8px; transition: 0.2s; }
    .remove-btn:hover { background: rgba(248,113,113,0.1); color: #f87171; }

    .cart-summary { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; padding: 28px; position: sticky; top: 20px; }
    .cart-summary h3 { margin: 0 0 20px; font-size: 18px; font-weight: 700; }
    .summary-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; }
    .summary-row.total { font-size: 18px; font-weight: 800; margin-top: 12px; }
    .free { color: #4ade80; font-weight: 700; }
    .summary-divider { height: 1px; background: var(--border); margin: 8px 0; }
    .checkout-btn { width: 100%; padding: 16px; background: var(--accent); color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 15px; cursor: pointer; margin-top: 20px; transition: 0.3s; }
    .checkout-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(241,100,30,0.3); }
    .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .checkout-error { margin-top: 12px; padding: 10px; background: rgba(248,113,113,0.1); border-radius: 8px; color: #f87171; font-size: 12px; font-weight: 600; }
  `]
})
export class CartComponent implements OnInit {
    items: CartItem[] = [];
    isCheckingOut = false;
    checkoutError = '';

    constructor(public cartService: CartService, private http: HttpClient) { }

    ngOnInit() {
        this.cartService.cart$.subscribe(items => this.items = items);
    }

    updateQty(productId: number, qty: number) {
        if (qty < 1) return;
        this.cartService.updateQuantity(productId, qty);
    }

    remove(productId: number) {
        this.cartService.removeFromCart(productId);
    }

    checkout() {
        if (this.items.length === 0 || this.isCheckingOut) return;
        this.isCheckingOut = true;
        this.checkoutError = '';

        const baseUrl = window.location.origin;
        const body = {
            items: this.items.map(i => ({
                productId: i.productId,
                productName: i.productName,
                price: i.price,
                quantity: i.quantity
            })),
            successUrl: baseUrl + '/payment-success',
            cancelUrl: baseUrl + '/cart'
        };

        this.http.post<{ sessionId: string, url: string }>('/api/payments/create-checkout-session', body)
            .subscribe({
                next: (res) => {
                    // Store cart in session for confirmation after payment
                    sessionStorage.setItem('pendingCartItems', JSON.stringify(this.items));
                    window.location.href = res.url;
                },
                error: (err) => {
                    this.isCheckingOut = false;
                    this.checkoutError = err.error?.error || 'Checkout failed. Please try again.';
                }
            });
    }

    getEmoji(cat?: string): string {
        if (!cat) return '📦';
        const map: any = { 'Smartphones': '📱', 'Laptops': '💻', 'Accessories': '⌚', 'Clothing': '👕', 'Shoes': '👟', 'Bags': '👜' };
        return map[cat] || '📦';
    }
}
