import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take, Observable } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const authService = inject(AuthService);
    let authReq = req;
    const token = authService.token;

    if (token) {
        authReq = addTokenHeader(req, token);
    }

    return next(authReq).pipe(
        catchError((error: any) => {
            if (error instanceof HttpErrorResponse && !authReq.url.includes('auth/login') && error.status === 401) {
                return handle401Error(authReq, next, authService);
            }
            return throwError(() => error);
        })
    );
};

function addTokenHeader(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });
}

function handle401Error(request: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService): Observable<HttpEvent<unknown>> {
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
                catchError((err: any) => {
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
