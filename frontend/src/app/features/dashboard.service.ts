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

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = '/api/dashboard';

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
}
