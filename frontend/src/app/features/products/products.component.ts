import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Products Catalog 📦</h1>
          <p>Manage your inventory</p>
        </div>
        <button class="btn btn-primary">+ Add Product</button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select class="dp-input">
          <option>All Categories</option>
          <option>Electronics</option>
          <option>Fashion</option>
          <option>Home</option>
          <option>Beauty</option>
        </select>
        <input class="dp-input" placeholder="🔍  Search products..." style="flex:1; min-width:200px" />
      </div>

      <!-- Grid -->
      <div class="products-grid">
        <div class="product-card" *ngFor="let product of products">
          <div class="product-img">{{ product.emoji }}</div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">{{ product.price }}</p>
            <div class="product-footer">
              <span class="stock-badge" [class.low]="product.stock < 20">{{ product.stock }} in stock</span>
              <button class="btn btn-ghost" style="padding:4px 10px;font-size:12px">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .page-content { padding: 28px 32px; }
    .filters-bar { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 8px; margin-bottom: 24px; }
    .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
    .product-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: all var(--transition); }
    .product-card:hover { border-color: var(--border-strong); transform: translateY(-3px); box-shadow: var(--shadow-glow); }
    .product-img { height: 120px; background: var(--bg-elevated); display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .product-info { padding: 16px; }
    .product-name { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
    .product-price { font-size: 18px; font-weight: 700; color: var(--accent-light); margin-bottom: 12px; }
    .product-footer { display: flex; align-items: center; justify-content: space-between; }
    .stock-badge { font-size: 11px; color: var(--success); background: rgba(0,200,150,0.15); padding: 2px 8px; border-radius: 99px; }
    .stock-badge.low { color: var(--warning); background: rgba(255,181,71,0.15); }
  `]
})
export class ProductsComponent {
    products = [
        { emoji: '👕', name: 'Classic Cotton T-Shirt', price: '$29.99', stock: 126 },
        { emoji: '👟', name: 'Running Sneakers Pro', price: '$89.99', stock: 58 },
        { emoji: '🎧', name: 'Wireless Headphones', price: '$149.99', stock: 32 },
        { emoji: '⌚', name: 'Smart Watch Series X', price: '$299.99', stock: 18 },
        { emoji: '👜', name: 'Leather Handbag', price: '$199.99', stock: 45 },
        { emoji: '🕶️', name: 'Designer Sunglasses', price: '$129.99', stock: 67 },
        { emoji: '💄', name: 'Premium Lipstick Set', price: '$49.99', stock: 89 },
        { emoji: '🪔', name: 'Decorative Lamp', price: '$79.99', stock: 5 },
    ];
}
