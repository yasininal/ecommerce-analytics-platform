import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-reviews',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Reviews ⭐</h1>
          <p>Customer ratings and feedback</p>
        </div>
      </div>

      <!-- Rating overview -->
      <div class="rating-overview">
        <div class="rating-big card">
          <div class="big-score">4.8</div>
          <div class="stars">★★★★★</div>
          <p style="color:var(--text-muted);font-size:12px;margin-top:4px">3,421 total reviews</p>
        </div>
        <div class="card rating-bars" style="flex:1">
          <div class="rating-bar-row" *ngFor="let r of ratings">
            <span class="star-label">{{ r.star }}★</span>
            <div class="bar-track">
              <div class="bar-fill" [style.width.%]="r.pct" [style.background]="r.color"></div>
            </div>
            <span class="pct-label">{{ r.pct }}%</span>
          </div>
        </div>
      </div>

      <!-- Reviews list -->
      <div class="reviews-list">
        <div class="review-card card" *ngFor="let review of reviews">
          <div class="review-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="avatar-rev" [style.background]="review.color">{{ review.name.charAt(0) }}</div>
              <div>
                <p style="font-weight:600;color:var(--text-primary);font-size:13px">{{ review.name }}</p>
                <p style="color:var(--text-muted);font-size:11px">{{ review.date }}</p>
              </div>
            </div>
            <div class="stars-sm">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</div>
          </div>
          <p class="review-text">{{ review.text }}</p>
          <div class="review-product">
            <span>📦</span>
            <span>{{ review.product }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-content { padding: 28px 32px; }
    .rating-overview { display: flex; gap: 20px; margin-bottom: 24px; }
    .rating-big { padding: 28px; text-align: center; min-width: 180px; }
    .big-score { font-size: 56px; font-weight: 800; color: var(--text-primary); line-height: 1; }
    .stars { color: #ffb547; font-size: 22px; margin-top: 8px; }
    .rating-bars { padding: 24px; display: flex; flex-direction: column; justify-content: center; gap: 12px; }
    .rating-bar-row { display: flex; align-items: center; gap: 12px; }
    .star-label { font-size: 12px; color: var(--text-secondary); width: 20px; text-align: right; }
    .bar-track { flex: 1; height: 8px; background: var(--bg-elevated); border-radius: 99px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
    .pct-label { font-size: 12px; color: var(--text-muted); width: 32px; }
    .reviews-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }
    .review-card { padding: 20px; }
    .review-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
    .avatar-rev { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0; }
    .stars-sm { color: #ffb547; font-size: 14px; }
    .review-text { font-size: 13px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 12px; }
    .review-product { font-size: 11px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; background: var(--bg-elevated); padding: 4px 10px; border-radius: 99px; width: fit-content; }
  `]
})
export class ReviewsComponent {
    ratings = [
        { star: 5, pct: 68, color: '#00c896' },
        { star: 4, pct: 22, color: '#7c5cfc' },
        { star: 3, pct: 6, color: '#ffb547' },
        { star: 2, pct: 3, color: '#ff8c00' },
        { star: 1, pct: 1, color: '#ff5c7a' },
    ];
    reviews = [
        { name: 'Sarah Miller', date: 'Dec 2, 2024', rating: 5, text: 'Absolutely love this product! The quality exceeded my expectations. Fast shipping and great packaging.', product: 'Wireless Headphones', color: 'linear-gradient(135deg,#7c5cfc,#9d80ff)' },
        { name: 'James Wilson', date: 'Dec 1, 2024', rating: 4, text: 'Very good quality for the price. Would definitely recommend to friends and family.', product: 'Running Sneakers Pro', color: 'linear-gradient(135deg,#38bdf8,#7c5cfc)' },
        { name: 'Emily Johnson', date: 'Nov 30, 2024', rating: 5, text: 'Perfect! Exactly what I was looking for. Will shop here again.', product: 'Smart Watch Series X', color: 'linear-gradient(135deg,#ffb547,#ff5c7a)' },
        { name: 'Mike Brown', date: 'Nov 29, 2024', rating: 3, text: 'Decent product but shipping took a bit longer than expected. Overall satisfied.', product: 'Leather Handbag', color: 'linear-gradient(135deg,#00c896,#38bdf8)' },
    ];
}
