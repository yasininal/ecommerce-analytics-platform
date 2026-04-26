import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../core/services/cart.service';

@Component({
    selector: 'app-payment-success',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="success-page">
      <div class="success-card" *ngIf="!error">
        <div class="check-circle">✓</div>
        <h1>Payment Successful!</h1>
        <p>Your order has been placed and is being processed.</p>
        <div class="order-info" *ngIf="orderDetails.length > 0">
          <div class="order-row" *ngFor="let o of orderDetails">
            <span>Order #{{ o.orderId }}</span>
            <span class="status-badge">{{ o.status }}</span>
            <span class="order-total">\${{ o.total }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <a routerLink="/my-orders" class="btn-primary">View My Orders</a>
          <a routerLink="/catalog" class="btn-secondary">Continue Shopping</a>
        </div>
      </div>
      <div class="success-card error-card" *ngIf="error">
        <div class="error-circle">!</div>
        <h1>Something went wrong</h1>
        <p>{{ error }}</p>
        <a routerLink="/cart" class="btn-primary">Back to Cart</a>
      </div>
    </div>
  `,
    styles: [`
    .success-page { display: flex; align-items: center; justify-content: center; min-height: calc(100vh - 80px); padding: 40px; }
    .success-card { text-align: center; max-width: 500px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 28px; padding: 60px 40px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
    .check-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #4ade80, #22c55e); display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; font-weight: 800; margin: 0 auto 24px; box-shadow: 0 12px 30px rgba(74,222,128,0.3); }
    .error-circle { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f87171, #ef4444); display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; font-weight: 800; margin: 0 auto 24px; }
    h1 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    p { color: var(--text-muted); margin-bottom: 24px; }
    .order-info { background: var(--bg-elevated); border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .order-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; }
    .status-badge { background: rgba(241,100,30,0.1); color: var(--accent); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; }
    .order-total { font-weight: 800; }
    .action-buttons { display: flex; gap: 12px; justify-content: center; }
    .btn-primary { padding: 14px 28px; background: var(--accent); color: white; border-radius: 14px; text-decoration: none; font-weight: 700; transition: 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); }
    .btn-secondary { padding: 14px 28px; background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-primary); border-radius: 14px; text-decoration: none; font-weight: 600; transition: 0.2s; }
    .btn-secondary:hover { background: var(--bg-hover); }
  `]
})
export class PaymentSuccessComponent implements OnInit {
    orderDetails: any[] = [];
    error = '';

    constructor(
        private http: HttpClient,
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() {
        const pendingItems = sessionStorage.getItem('pendingCartItems');
        if (!pendingItems) {
            this.error = 'No pending order found.';
            return;
        }

        const items = JSON.parse(pendingItems);
        const address = sessionStorage.getItem('pendingAddress') || 'No address provided';
        const coupon = sessionStorage.getItem('pendingCoupon') || null;
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');

        this.http.post<any>('/api/payments/confirm', {
            sessionId: sessionId,
            items: items.map((i: any) => ({
                productId: i.productId,
                productName: i.productName,
                price: i.price,
                quantity: i.quantity
            })),
            shippingAddress: address,
            couponCode: coupon
        }).subscribe({
            next: (res) => {
                this.orderDetails = res.orders || [];
                this.cartService.clearCart();
                sessionStorage.removeItem('pendingCartItems');
            },
            error: (err) => {
                this.error = err.error?.error || 'Failed to confirm order. Contact support.';
            }
        });
    }
}
