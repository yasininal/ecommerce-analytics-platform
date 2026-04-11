import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminSummary {
    totalUsers: number;
    totalStores: number;
    totalOrders: number;
    totalRevenue: number;
}

export interface CorporateSummary {
    storeId: number;
    storeName: string;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
}

export interface IndividualSummary {
    name: string;
    totalOrders: number;
    totalSpent: number;
}

export interface OrderData {
    id: number;
    customerEmail: string;
    storeName: string;
    status: string;
    grandTotal: number;
}

export interface ProductData {
    id: number;
    name: string;
    sku: string;
    unitPrice: number;
    categoryName: string;
    storeName: string;
}

export interface CustomerData {
    id: number;
    email: string;
    gender: string;
    age?: number;
    city?: string;
    membershipType: string;
}

export interface ShipmentData {
    id: number;
    orderId: number;
    customerEmail: string;
    warehouse: string;
    mode: string;
    status: string;
}

export interface ReviewData {
    id: number;
    userEmail: string;
    productName: string;
    starRating: number;
    sentiment: string;
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = '/api/dashboard';
    private baseApiUrl = '/api';

    constructor(private http: HttpClient) { }

    getAdminSummary(): Observable<AdminSummary> {
        return this.http.get<AdminSummary>(`${this.apiUrl}/admin/summary`);
    }

    getCorporateSummary(): Observable<CorporateSummary> {
        return this.http.get<CorporateSummary>(`${this.apiUrl}/corporate/summary`);
    }

    getIndividualSummary(): Observable<IndividualSummary> {
        return this.http.get<IndividualSummary>(`${this.apiUrl}/individual/summary`);
    }

    // Orders
    getOrders(): Observable<OrderData[]> { return this.http.get<OrderData[]>(`${this.baseApiUrl}/orders`); }
    getOrdersByStore(storeId: number): Observable<OrderData[]> { return this.http.get<OrderData[]>(`${this.baseApiUrl}/orders/store/${storeId}`); }
    getOrdersByUser(userId: number): Observable<OrderData[]> { return this.http.get<OrderData[]>(`${this.baseApiUrl}/orders/user/${userId}`); }

    // Products
    getProducts(): Observable<ProductData[]> { return this.http.get<ProductData[]>(`${this.baseApiUrl}/products`); }
    getProductsByStore(storeId: number): Observable<ProductData[]> { return this.http.get<ProductData[]>(`${this.baseApiUrl}/products/store/${storeId}`); }
    createProduct(product: Partial<ProductData>): Observable<ProductData> { return this.http.post<ProductData>(`${this.baseApiUrl}/products`, product); }
    updateProduct(id: number, product: Partial<ProductData>): Observable<ProductData> { return this.http.put<ProductData>(`${this.baseApiUrl}/products/${id}`, product); }
    deleteProduct(id: number): Observable<void> { return this.http.delete<void>(`${this.baseApiUrl}/products/${id}`); }

    // Customers
    getCustomers(): Observable<CustomerData[]> { return this.http.get<CustomerData[]>(`${this.baseApiUrl}/customers`); }

    // Shipments
    getShipments(): Observable<ShipmentData[]> { return this.http.get<ShipmentData[]>(`${this.baseApiUrl}/shipments`); }
    getShipmentsByStore(storeId: number): Observable<ShipmentData[]> { return this.http.get<ShipmentData[]>(`${this.baseApiUrl}/shipments/store/${storeId}`); }
    getShipmentsByUser(userId: number): Observable<ShipmentData[]> { return this.http.get<ShipmentData[]>(`${this.baseApiUrl}/shipments/user/${userId}`); }

    // Reviews
    getReviews(): Observable<ReviewData[]> { return this.http.get<ReviewData[]>(`${this.baseApiUrl}/reviews`); }
    getReviewsByStore(storeId: number): Observable<ReviewData[]> { return this.http.get<ReviewData[]>(`${this.baseApiUrl}/reviews/store/${storeId}`); }
}
