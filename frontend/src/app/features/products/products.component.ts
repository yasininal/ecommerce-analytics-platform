import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardService, ProductData } from '../dashboard.service';
import { AuthService } from '../../core/auth/auth.service';
import { StoreService } from '../../core/services/store.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-content">
      <div class="section-header">
        <div>
          <h1>Products Catalog</h1>
          <p>Manage your inventory and product listings</p>
        </div>
        <button class="btn btn-accent" *ngIf="userRole !== 'ROLE_INDIVIDUAL'" (click)="openAddModal()">+ Add Product</button>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <select class="dp-input filter-select" [(ngModel)]="categoryFilter" (change)="onSearch()">
          <option value="ALL">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Smartphones">Smartphones</option>
          <option value="Laptops">Laptops</option>
          <option value="Fashion">Fashion</option>
          <option value="Accessories">Accessories</option>
          <option value="Clothing">Clothing</option>
          <option value="Shoes">Shoes</option>
          <option value="Bags">Bags</option>
        </select>
        <input class="dp-input search-input" [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search products by name or SKU..." />
      </div>

      <!-- Grid -->
      <div *ngIf="loading" class="dp-loading">
        <div class="spinner"></div>
        Loading products...
      </div>
      
      <div class="products-grid" *ngIf="!loading && filteredProducts.length > 0">
        <div class="product-card" *ngFor="let product of filteredProducts">
          <div class="product-img-wrapper">
             <img class="product-img" [src]="getSmartImage(product)" [alt]="product.name" loading="lazy"
                  (error)="onImgError($event)" />
             <span class="category-tag">{{ product.categoryName }}</span>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-price">\${{ product.unitPrice | number:'1.2-2' }}</p>
            <div class="product-meta">
               SKU: {{ product.sku }} <span *ngIf="userRole === 'ROLE_ADMIN'">· {{ product.storeName }}</span>
            </div>
            <div class="product-stock" [class.low-stock]="product.stockQuantity < 10">
               📦 Stock: {{ product.stockQuantity }} units
            </div>
            <div class="product-actions" *ngIf="userRole !== 'ROLE_INDIVIDUAL'">
              <button class="action-btn edit" (click)="openEditModal(product)">Edit</button>
              <button class="action-btn delete" (click)="deleteProduct(product)">Delete</button>
            </div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading && filteredProducts.length === 0" class="empty-state">
        <div class="empty-icon">📦</div>
        <p>No products found.</p>
      </div>
    </div>

    <!-- Product Add/Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <div class="modal-header">
           <h3>{{ editingProduct?.id ? 'Edit' : 'Add New' }} Product</h3>
           <button class="close-btn" (click)="closeModal()">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label>Product Name</label>
            <input type="text" class="dp-input" [(ngModel)]="formProduct.name" placeholder="e.g. Wireless Headphones" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>SKU</label>
              <input type="text" class="dp-input" [(ngModel)]="formProduct.sku" placeholder="e.g. WH-001" />
            </div>
            <div class="form-group">
              <label>Price (\$)</label>
              <input type="number" class="dp-input" [(ngModel)]="formProduct.unitPrice" placeholder="0.00" />
            </div>
          </div>
          <div class="form-group">
            <label>Category</label>
            <select class="dp-input" [(ngModel)]="formProduct.categoryName">
              <option value="Electronics">Electronics</option>
              <option value="Smartphones">Smartphones</option>
              <option value="Laptops">Laptops</option>
              <option value="Fashion">Fashion</option>
              <option value="Accessories">Accessories</option>
              <option value="Clothing">Clothing</option>
              <option value="Shoes">Shoes</option>
              <option value="Bags">Bags</option>
            </select>
          </div>
          <div class="form-group" *ngIf="userRole === 'ROLE_ADMIN'">
            <label>Store</label>
            <select class="dp-input" [(ngModel)]="formProduct.storeName">
              <option value="" disabled>Select a store...</option>
              <option *ngFor="let s of allStores" [value]="s.name">{{ s.name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Image URL (Optional)</label>
            <input type="text" class="dp-input" [(ngModel)]="formProduct.imageUrl" placeholder="https://images.unsplash.com/..." />
          </div>
          <div class="form-group">
            <label>Stock Quantity</label>
            <input type="number" class="dp-input" [(ngModel)]="formProduct.stockQuantity" placeholder="0" />
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea class="dp-input" [(ngModel)]="formProduct.description" placeholder="Product details..." rows="3" style="resize:none; padding:12px; font-family:inherit;"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-accent" [disabled]="!isFormValid()" (click)="saveProduct()">
            {{ saving ? 'Saving...' : (editingProduct?.id ? 'Update Product' : 'Add Product') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteConfirm" (click)="cancelDelete()">
      <div class="modal-card delete-confirm-card" (click)="$event.stopPropagation()">
        <div class="delete-icon-wrapper">
          <div class="delete-icon">🗑</div>
        </div>
        <h3>Delete Product?</h3>
        <p>Are you sure you want to delete <strong>"{{ productToDelete?.name }}"</strong>? This action cannot be undone.</p>
        <div class="modal-actions full-width">
          <button class="btn btn-ghost" (click)="cancelDelete()">No, Keep it</button>
          <button class="btn btn-danger-filled" (click)="confirmDelete()">
            {{ deleting ? 'Deleting...' : 'Yes, Delete Product' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-content { padding: 32px 40px; max-width: 1400px; margin: 0 auto; }
    .filters-bar { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 8px; margin-bottom: 32px; }
    .filter-select { min-width: 180px; }
    .search-input { flex: 1; min-width: 250px; max-width: 400px; border-radius: 99px; padding-left: 20px; }
    
    .products-grid { 
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
        gap: 24px; 
    }
    
    .product-card { 
        background: var(--bg-card); 
        border: 1px solid var(--border); 
        border-radius: var(--radius-lg); 
        overflow: hidden; 
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
    }
    .product-card:hover { 
        border-color: var(--border-strong); 
        transform: translateY(-6px); 
        box-shadow: 0 12px 40px rgba(0,0,0,0.1); 
    }
    
    .product-img-wrapper {
        width: 100%;
        height: 220px;
        overflow: hidden;
        background: var(--bg-elevated);
        position: relative;
    }
    .product-img { 
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .product-card:hover .product-img {
        transform: scale(1.08);
    }
    .category-tag {
        position: absolute;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: 99px;
        backdrop-filter: blur(4px);
    }
    
    .product-info { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .product-name { font-size: 15px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; line-height: 1.4; }
    .product-price { font-size: 20px; font-weight: 700; color: var(--accent); margin-bottom: 12px; }
    
    .product-meta { font-size: 12px; color: var(--text-muted); margin-top: auto; }
    .product-stock { font-size: 12px; font-weight: 600; color: #4ade80; margin-top: 4px; }
    .product-stock.low-stock { color: #f87171; }
    
    .product-actions { 
      display: flex; gap: 8px; margin-top: 12px; 
      padding-top: 12px; border-top: 1px solid var(--border); 
    }
    .action-btn { 
        flex: 1; padding: 8px; font-size: 13px; font-weight: 600;
        border: 1px solid var(--border); border-radius: var(--radius-sm); 
        background: transparent; cursor: pointer; transition: all var(--transition);
        color: var(--text-secondary); font-family: inherit;
    }
    .action-btn:hover { background: var(--bg-hover); color: var(--text-primary); }
    .action-btn.delete:hover { background: rgba(193, 58, 58, 0.08); color: var(--danger); border-color: var(--danger); }
    
    .empty-state { 
      padding: 80px 40px; text-align: center; color: var(--text-muted); 
      background: var(--bg-card); border-radius: var(--radius-lg); 
      border: 1px dashed var(--border-strong); 
    }
    .empty-icon { font-size: 48px; margin-bottom: 16px; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
    .modal-card { 
      width: 520px; padding: 32px; animation: modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1); 
      background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); 
      box-shadow: 0 24px 80px rgba(0,0,0,0.2);
    }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; }
    .modal-header h3 { font-size: 22px; font-weight: 600; color: var(--text-primary); }
    .close-btn { background: var(--bg-elevated); border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all var(--transition); }
    .close-btn:hover { color: var(--text-primary); background: var(--bg-hover); }
    
    @keyframes modal-in { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
    .form-grid { display: flex; flex-direction: column; gap: 20px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; }
    .modal-actions .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .modal-actions.full-width { display: grid; grid-template-columns: 1fr 1fr; width: 100%; }

    .delete-confirm-card { text-align: center; width: 420px; padding: 40px; }
    .delete-icon-wrapper { 
      width: 64px; height: 64px; background: rgba(193, 58, 58, 0.1); 
      border-radius: 50%; display: flex; align-items: center; justify-content: center; 
      margin: 0 auto 20px; 
    }
    .delete-icon { font-size: 32px; }
    .delete-confirm-card h3 { font-size: 20px; margin-bottom: 12px; color: var(--text-primary); }
    .delete-confirm-card p { color: var(--text-secondary); line-height: 1.6; margin-bottom: 24px; }
    .btn-danger-filled { background: var(--danger); color: white; border: none; }
    .btn-danger-filled:hover { background: #a52d2d; transform: scale(1.02); }
  `]
})
export class ProductsComponent implements OnInit {
  products: ProductData[] = [];
  filteredProducts: ProductData[] = [];
  loading = true;
  userRole = '';
  searchTerm = '';
  categoryFilter = 'ALL';
  
  showModal = false;
  saving = false;
  deleting = false;
  showDeleteConfirm = false;
  productToDelete: ProductData | null = null;
  editingProduct: ProductData | null = null;
  formProduct: Partial<ProductData> = {};
  
  corporateStoreName = '';
  allStores: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private storeService: StoreService,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.hasRole('ROLE_ADMIN') ? 'ROLE_ADMIN' : 
                   this.authService.hasRole('ROLE_CORPORATE') ? 'ROLE_CORPORATE' : 'ROLE_INDIVIDUAL';
    
    if (this.userRole === 'ROLE_ADMIN') {
        this.storeService.getAllStores().subscribe(stores => this.allStores = stores);
    }
    
    this.refresh();
  }

  refresh() {
    this.loading = true;
    if (this.userRole === 'ROLE_ADMIN') {
      this.dashboardService.getProducts().subscribe({
        next: (data) => { this.products = data; this.onSearch(); this.loading = false; },
        error: () => this.loading = false
      });
    } else if (this.userRole === 'ROLE_CORPORATE') {
      this.dashboardService.getCorporateSummary().subscribe({
        next: (summary) => {
          this.corporateStoreName = summary.storeName;
          if (summary.storeId) {
            this.dashboardService.getProductsByStore(summary.storeId).subscribe({
              next: (data) => { this.products = data; this.onSearch(); this.loading = false; },
              error: () => this.loading = false
            });
          } else { this.loading = false; }
        },
        error: () => this.loading = false
      });
    } else {
      this.loading = false;
    }
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p => {
      const matchSearch = !term || p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
      const matchCat = this.categoryFilter === 'ALL' || p.categoryName === this.categoryFilter;
      return matchSearch && matchCat;
    });
  }

  isFormValid(): boolean {
      const hasName = !!this.formProduct.name?.trim();
      const hasSku = !!this.formProduct.sku?.trim();
      const hasPrice = this.formProduct.unitPrice !== undefined && this.formProduct.unitPrice >= 0;
      const hasStock = this.formProduct.stockQuantity !== undefined && this.formProduct.stockQuantity >= 0;
      const hasStore = this.userRole === 'ROLE_CORPORATE' || !!this.formProduct.storeName;
      return hasName && hasSku && hasPrice && hasStock && hasStore;
  }

  openAddModal() {
    this.editingProduct = null;
    const defaultStore = this.userRole === 'ROLE_ADMIN' && this.allStores.length > 0 
        ? this.allStores[0].name 
        : this.corporateStoreName;
    this.formProduct = { 
        name: '', 
        sku: '', 
        unitPrice: 0, 
        categoryName: 'Electronics', 
        storeName: defaultStore,
        imageUrl: '',
        stockQuantity: 0,
        description: ''
    };
    this.showModal = true;
  }

  openEditModal(product: ProductData) {
    this.editingProduct = product;
    this.formProduct = { ...product };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.saving = false;
  }

  saveProduct() {
      if (!this.isFormValid()) return;
      this.saving = true;

      if (this.editingProduct?.id) {
          this.dashboardService.updateProduct(this.editingProduct.id, this.formProduct).subscribe({
              next: () => {
                  this.notificationService.success(`"${this.formProduct.name}" updated successfully.`);
                  this.refresh();
                  this.closeModal();
              },
              error: () => {
                  this.notificationService.error('Failed to update product.');
                  this.saving = false;
              }
          });
      } else {
          this.dashboardService.createProduct(this.formProduct).subscribe({
              next: () => {
                  this.notificationService.success(`"${this.formProduct.name}" added successfully.`);
                  this.refresh();
                  this.closeModal();
              },
              error: () => {
                  this.notificationService.error('Failed to add product.');
                  this.saving = false;
              }
          });
      }
  }

  deleteProduct(product: ProductData) {
      this.productToDelete = product;
      this.showDeleteConfirm = true;
  }

  confirmDelete() {
      if (!this.productToDelete) return;
      this.deleting = true;
      this.dashboardService.deleteProduct(this.productToDelete.id).subscribe({
          next: () => {
              this.notificationService.success(`"${this.productToDelete?.name}" has been deleted successfully.`);
              this.refresh();
              this.cancelDelete();
          },
          error: () => {
              this.notificationService.error('Failed to delete product. Please try again.');
              this.deleting = false;
          }
      });
  }

  cancelDelete() {
      this.showDeleteConfirm = false;
      this.productToDelete = null;
      this.deleting = false;
  }

  onImgError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
  }

  /** Smart image: tries to match product name keywords first, then falls back to category */
  getSmartImage(product: ProductData): string {
    if (product.imageUrl && product.imageUrl.trim() !== '') {
        return product.imageUrl;
    }
    const name = product.name.toLowerCase();
    
    // Name-based matching for more accurate images
    if (name.includes('laptop') || name.includes('notebook') || name.includes('macbook'))
      return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80';
    if (name.includes('phone') || name.includes('iphone') || name.includes('samsung') || name.includes('smartphone'))
      return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
    if (name.includes('tablet') || name.includes('ipad'))
      return 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80';
    if (name.includes('headphone') || name.includes('earphone') || name.includes('airpod') || name.includes('earbud'))
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
    if (name.includes('watch') || name.includes('smartwatch'))
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
    if (name.includes('camera'))
      return 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80';
    if (name.includes('speaker'))
      return 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80';
    if (name.includes('keyboard') || name.includes('mouse'))
      return 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80';
    if (name.includes('monitor') || name.includes('screen') || name.includes('display') || name.includes('tv') || name.includes('television'))
      return 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=600&q=80';
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot') || name.includes('sandal'))
      return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
    if (name.includes('pant') || name.includes('trouser') || name.includes('jean') || name.includes('short'))
      return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80';
    if (name.includes('shirt') || name.includes('tshirt') || name.includes('t-shirt') || name.includes('blouse') || name.includes('top'))
      return 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80';
    if (name.includes('jacket') || name.includes('coat') || name.includes('hoodie') || name.includes('sweater'))
      return 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80';
    if (name.includes('dress') || name.includes('skirt'))
      return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80';
    if (name.includes('bag') || name.includes('backpack') || name.includes('purse') || name.includes('handbag') || name.includes('tote'))
      return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
    if (name.includes('wallet'))
      return 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&q=80';
    if (name.includes('sunglass') || name.includes('glass') || name.includes('eyewear'))
      return 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80';
    if (name.includes('hat') || name.includes('cap') || name.includes('beanie'))
      return 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80';
    if (name.includes('belt'))
      return 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=600&q=80';
    if (name.includes('ring') || name.includes('necklace') || name.includes('bracelet') || name.includes('jewel'))
      return 'https://images.unsplash.com/photo-1515562141589-67f0d7e60b71?w=600&q=80';
    if (name.includes('perfume') || name.includes('cologne') || name.includes('fragrance'))
      return 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80';

    // Fall back to category-based images
    return this.getImageForCategory(product.categoryName);
  }

  getImageForCategory(category: string): string {
    switch (category) {
      case 'Smartphones': return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80';
      case 'Laptops': return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80';
      case 'Accessories': return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
      case 'Clothing': return 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80';
      case 'Shoes': return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80';
      case 'Bags': return 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80';
      case 'Electronics': return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80';
      case 'Fashion': return 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80';
      default: return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80';
    }
  }
}
