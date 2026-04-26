import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WishlistService, WishlistDto } from '../../core/services/wishlist.service';

@Component({
    selector: 'app-favorites',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="favorites-page">
      <div class="favorites-header">
        <h1>❤️ My Favorites</h1>
        <p>Your curated list of loved products</p>
      </div>

      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
      </div>

      <div class="empty-state" *ngIf="!loading && favorites.length === 0">
        <div class="empty-icon">💔</div>
        <h2>No favorites yet</h2>
        <p>Explore the catalog and add products to your wishlist!</p>
        <a routerLink="/catalog" class="browse-btn">Browse Catalog</a>
      </div>

      <div class="favorites-grid" *ngIf="!loading && favorites.length > 0">
        <div class="fav-card" *ngFor="let fav of favorites">
          <div class="card-visual" routerLink="/catalog/{{fav.productId}}">
            <div class="emoji-visual">📦</div>
            <button class="remove-btn" (click)="removeFavorite($event, fav.productId)" title="Remove from favorites">✕</button>
          </div>
          <div class="card-body">
            <h3 class="p-title" routerLink="/catalog/{{fav.productId}}">{{ fav.productName }}</h3>
            <div class="p-meta">🏪 {{ fav.storeName }}</div>
            <div class="price-box">
              <span class="curr">$</span>
              <span class="val">{{ fav.productPrice }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
    styles: [`
    .favorites-page { max-width: 1000px; margin: 0 auto; padding: 40px; }
    .favorites-header h1 { font-size: 28px; font-weight: 800; margin: 0; }
    .favorites-header p { color: var(--text-muted); margin: 4px 0 32px; }

    .loading-state { text-align: center; padding: 60px; }
    .spinner { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state { text-align: center; padding: 80px 0; }
    .empty-icon { font-size: 80px; margin-bottom: 20px; opacity: 0.5; }
    .empty-state h2 { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); margin-bottom: 24px; }
    .browse-btn { display: inline-block; padding: 14px 32px; background: var(--accent); color: white; border-radius: 14px; text-decoration: none; font-weight: 700; }

    .favorites-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
    .fav-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: 0.3s; }
    .fav-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    
    .card-visual { height: 180px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
    .emoji-visual { font-size: 64px; }
    .remove-btn { position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.5); color: white; border: none; width: 28px; height: 28px; border-radius: 50%; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; backdrop-filter: blur(4px); }
    .remove-btn:hover { background: #ef4444; transform: scale(1.1); }
    
    .card-body { padding: 20px; }
    .p-title { font-size: 16px; font-weight: 700; margin: 0 0 8px 0; cursor: pointer; transition: 0.2s; }
    .p-title:hover { color: var(--accent); }
    .p-meta { font-size: 12px; color: var(--text-secondary); margin-bottom: 12px; }
    .price-box { display: flex; align-items: flex-start; gap: 2px; }
    .curr { font-size: 12px; font-weight: 600; color: var(--accent-light); margin-top: 2px; }
    .val { font-size: 18px; font-weight: 800; color: var(--text-primary); }
    `]
})
export class FavoritesComponent implements OnInit {
    favorites: WishlistDto[] = [];
    loading = true;

    constructor(private wishlistService: WishlistService) {}

    ngOnInit() {
        this.loadFavorites();
    }

    loadFavorites() {
        this.wishlistService.getUserWishlist().subscribe({
            next: (data) => {
                this.favorites = data;
                this.loading = false;
            },
            error: () => {
                this.loading = false;
            }
        });
    }

    removeFavorite(event: Event, productId: number) {
        event.stopPropagation();
        this.wishlistService.toggleWishlist(productId).subscribe(() => {
            this.favorites = this.favorites.filter(f => f.productId !== productId);
        });
    }
}
