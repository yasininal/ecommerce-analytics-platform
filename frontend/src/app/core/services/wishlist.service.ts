import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface WishlistDto {
    id: number;
    productId: number;
    productName: string;
    productPrice: number;
    productImageUrl: string;
    storeName: string;
}

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private apiUrl = '/api/wishlists';

    constructor(private http: HttpClient, private authService: AuthService) { }

    getUserWishlist(): Observable<WishlistDto[]> {
        const userId = this.authService.getUserId();
        return this.http.get<WishlistDto[]>(`${this.apiUrl}/user/${userId}`);
    }

    toggleWishlist(productId: number): Observable<void> {
        const userId = this.authService.getUserId();
        return this.http.post<void>(`${this.apiUrl}/user/${userId}/product/${productId}`, {});
    }

    checkWishlist(productId: number): Observable<boolean> {
        const userId = this.authService.getUserId();
        return this.http.get<boolean>(`${this.apiUrl}/user/${userId}/product/${productId}/check`);
    }
}
