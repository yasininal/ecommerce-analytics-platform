import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StoreData {
    id: number;
    name: string;
    status: string;
    ownerEmail: string;
}

@Injectable({
    providedIn: 'root'
})
export class StoreService {
    private apiUrl = '/api/stores';

    constructor(private http: HttpClient) { }

    getMyStores(): Observable<StoreData[]> {
        return this.http.get<StoreData[]>(`${this.apiUrl}/my-store`);
    }

    getAllStores(): Observable<StoreData[]> {
        return this.http.get<StoreData[]>(this.apiUrl);
    }

    updateStore(id: number, data: Partial<StoreData>): Observable<StoreData> {
        return this.http.put<StoreData>(`${this.apiUrl}/${id}`, data);
    }

    createStore(data: Partial<StoreData>): Observable<StoreData> {
        return this.http.post<StoreData>(this.apiUrl, data);
    }
}
