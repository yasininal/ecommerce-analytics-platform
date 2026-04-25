import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
    productId: number;
    productName: string;
    price: number;
    quantity: number;
    storeName: string;
    imageUrl?: string;
    categoryName?: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private items: CartItem[] = [];
    private cartSubject = new BehaviorSubject<CartItem[]>([]);
    cart$ = this.cartSubject.asObservable();

    constructor() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.items = JSON.parse(saved);
            this.cartSubject.next(this.items);
        }
    }

    private save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.cartSubject.next([...this.items]);
    }

    addToCart(item: CartItem) {
        const existing = this.items.find(i => i.productId === item.productId);
        if (existing) {
            existing.quantity += item.quantity;
        } else {
            this.items.push({ ...item });
        }
        this.save();
    }

    removeFromCart(productId: number) {
        this.items = this.items.filter(i => i.productId !== productId);
        this.save();
    }

    updateQuantity(productId: number, quantity: number) {
        const item = this.items.find(i => i.productId === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.save();
        }
    }

    clearCart() {
        this.items = [];
        this.save();
    }

    getItemCount(): number {
        return this.items.reduce((sum, i) => sum + i.quantity, 0);
    }

    getTotal(): number {
        return this.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    }

    getItems(): CartItem[] {
        return [...this.items];
    }
}
