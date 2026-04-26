import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

export interface AuthResponse {
  token: string;
  refreshToken: string;
  id: number;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth';

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggingOut = false;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          if (response.id) {
            localStorage.setItem('userId', response.id.toString());
          }
          this.loadUserFromToken();
        }
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  refreshTokenApi(): Observable<any> {
    return this.http.post(`${this.apiUrl}/refreshtoken`, {
      refreshToken: this.getRefreshToken()
    }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.accessToken);
        localStorage.setItem('refreshToken', res.refreshToken);
      })
    );
  }

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;

    const rToken = this.getRefreshToken();
    const userId = this.getUserId();
    
    // 1. Clear state IMMEDIATELY
    this.clearStorage();

    // 2. Fire and forget logout API (if we have tokens)
    if (rToken && userId) {
      this.http.post(`${this.apiUrl}/logout`, { userId }).subscribe({
          next: () => { 
            this.isLoggingOut = false;
            console.log('Backend logout success');
          },
          error: () => {
            this.isLoggingOut = false;
            console.error('Backend logout failed');
          }
      });
    } else {
      this.isLoggingOut = false;
    }

    // 3. Navigate to catalog using Router (No hard refresh)
    this.router.navigate(['/catalog']);
  }

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('roles');
    localStorage.removeItem('userId');
    localStorage.removeItem('cart');
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getUserId(): number | null {
    const id = localStorage.getItem('userId');
    return id ? parseInt(id, 10) : null;
  }

  getUserRole(): string {
    const rolesStr = localStorage.getItem('roles');
    if (!rolesStr) return 'GUEST';
    try {
      const roles = JSON.parse(rolesStr);
      return roles.length > 0 ? roles[0] : 'GUEST';
    } catch {
      return 'GUEST';
    }
  }

  public loadUserFromToken(): void {
    const token = this.token;
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.currentUserSubject.next(decodedToken);
      } catch (error) {
        this.clearStorage();
      }
    }
  }

  hasRole(role: string): boolean {
    return localStorage.getItem('roles')?.includes(role) ?? false;
  }
}
