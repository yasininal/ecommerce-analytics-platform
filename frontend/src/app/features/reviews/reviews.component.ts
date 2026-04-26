import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, ReviewData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>{{ userRole === 'ROLE_INDIVIDUAL' ? 'My Reviews 📝' : 'Reviews ⭐' }}</h1>
          <p>{{ userRole === 'ROLE_INDIVIDUAL' ? 'Manage your product feedback' : 'Customer ratings and feedback' }}</p>
        </div>
      </div>

      <div *ngIf="loading" style="padding:40px; text-align:center; color:var(--text-secondary)">Loading reviews...</div>

      <ng-container *ngIf="!loading">
        <!-- Rating overview -->
        <div class="rating-overview" *ngIf="userRole !== 'ROLE_INDIVIDUAL' && reviews.length > 0">
          <div class="rating-big card">
            <div class="big-score">{{ averageRating }}</div>
            <div class="stars">{{ getStars(averageRating) }}</div>
            <p style="color:var(--text-muted);font-size:12px;margin-top:4px">{{ reviews.length }} total reviews</p>
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
        <div class="reviews-list" *ngIf="!loading && reviews.length > 0">
          <div class="review-card card" *ngFor="let review of reviews">
            <div class="review-header">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="avatar-rev" [style.background]="getGradient(review.id)">{{ review.userEmail.charAt(0).toUpperCase() }}</div>
                <div>
                  <p style="font-weight:600;color:var(--text-primary);font-size:13px">{{ review.userEmail }}</p>
                  <p style="color:var(--text-muted);font-size:11px">{{ getRelativeTime() }}</p>
                </div>
              </div>
              <div class="stars-sm">{{ '★'.repeat(review.starRating) }}{{ '☆'.repeat(5 - review.starRating) }}</div>
            </div>
            <p class="review-text" style="color:var(--text-primary); font-weight:500">"{{ review.comment }}"</p>
            <div style="margin-bottom:12px">
                <span class="badge" [ngClass]="{
                    'badge-success': review.sentiment === 'POSITIVE',
                    'badge-warning': review.sentiment === 'NEUTRAL',
                    'badge-danger': review.sentiment === 'NEGATIVE'
                }">{{ review.sentiment }}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center">
                <div class="review-product">
                <span>📦</span>
                <span>{{ review.productName }}</span>
                </div>
                <button *ngIf="userRole === 'ROLE_ADMIN'" class="btn btn-ghost" style="color:var(--danger); font-size:11px" (click)="deleteRev(review.id)">Delete</button>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && reviews.length === 0" style="padding:40px; text-align:center; color:var(--text-secondary)">
           No reviews found.
        </div>
      </ng-container>
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
export class ReviewsComponent implements OnInit {
  reviews: ReviewData[] = [];
  ratings: any[] = [];
  averageRating: string = '0.0';
  loading = true;
  userRole = '';

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    if (this.authService.hasRole('ROLE_ADMIN')) {
      this.userRole = 'ROLE_ADMIN';
      this.dashboardService.getReviews().subscribe({
        next: (data) => { this.processReviews(data); this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.authService.hasRole('ROLE_CORPORATE')) {
      this.userRole = 'ROLE_CORPORATE';
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          if (summary.storeId) {
            this.dashboardService.getReviewsByStore(summary.storeId).subscribe({
              next: (data) => { this.processReviews(data); this.loading = false; },
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
      this.dashboardService.getMyReviews().subscribe({
        next: (data) => { this.processReviews(data); this.loading = false; },
        error: () => this.loading = false
      });
    }
  }

  deleteRev(id: number) {
    if (confirm('Are you sure you want to delete this review?')) {
      this.dashboardService.deleteReview(id).subscribe({
        next: () => {
          this.reviews = this.reviews.filter(r => r.id !== id);
          this.processReviews(this.reviews);
        },
        error: () => alert('Failed to delete review.')
      });
    }
  }

  processReviews(data: ReviewData[]) {
    this.reviews = data;
    if (data.length === 0) return;

    let totalStars = 0;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    data.forEach(r => {
      totalStars += r.starRating;
      (counts as any)[r.starRating] = ((counts as any)[r.starRating] || 0) + 1;
    });

    this.averageRating = (totalStars / data.length).toFixed(1);

    this.ratings = [
      { star: 5, pct: Math.round((counts[5] / data.length) * 100), color: '#00c896' },
      { star: 4, pct: Math.round((counts[4] / data.length) * 100), color: '#7c5cfc' },
      { star: 3, pct: Math.round((counts[3] / data.length) * 100), color: '#ffb547' },
      { star: 2, pct: Math.round((counts[2] / data.length) * 100), color: '#ff8c00' },
      { star: 1, pct: Math.round((counts[1] / data.length) * 100), color: '#ff5c7a' },
    ];
  }

  getStars(rating: string): string {
    const fullStars = Math.round(parseFloat(rating));
    return '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);
  }

  getRelativeTime(): string {
    return 'Recently'; // Simulating relative time for mocked lack-of-date in DB
  }

  getGradient(id: number): string {
    const colors = [
      'linear-gradient(135deg,#7c5cfc,#9d80ff)',
      'linear-gradient(135deg,#38bdf8,#7c5cfc)',
      'linear-gradient(135deg,#ffb547,#ff5c7a)',
      'linear-gradient(135deg,#00c896,#38bdf8)'
    ];
    return colors[id % colors.length];
  }
}
