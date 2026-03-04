import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  token: string;
  id: number;
  email: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.loadUserFromToken();
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  public loadUserFromToken(): void {
    const token = this.token;
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        this.currentUserSubject.next(decodedToken);
      } catch (error) {
        this.logout();
      }
    }
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    // Roles out of our UserDetailsImpl look like ROLE_ADMIN etc.
    // Or we can get from token. Let's return decoded logic depending on how spring puts it.
    // Assuming spring jwt token has sub with email. Roles are not manually pushed in subject unless configured.
    // We can also just read the roles from local storage if the auth response provides it, but doing basic check:
    return localStorage.getItem('roles')?.includes(role) ?? false;
  }
}
