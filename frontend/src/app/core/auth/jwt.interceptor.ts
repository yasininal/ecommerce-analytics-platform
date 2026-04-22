import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    let authReq = req;
    const token = authService.token;

    if (token) {
        authReq = addTokenHeader(req, token);
    }

    return next(authReq).pipe(
        catchError((error) => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/login') && error.status === 401) {
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addTokenHeader(request: any, token: string) {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(request: any, next: any, authService: AuthService) {
    if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        const token = authService.getRefreshToken();
        if (token) {
            return authService.refreshTokenApi().pipe(
                switchMap((res: any) => {
                    isRefreshing = false;
                    refreshTokenSubject.next(res.accessToken);
                    return next(addTokenHeader(request, res.accessToken));
                }),
                catchError((err) => {
                    isRefreshing = false;
                    authService.logout();
                    return throwError(() => err);
                })
            );
        }
    }

    return refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((token) => next(addTokenHeader(request, token)))
    );
}
