import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.token) {
        const expectedRole = route.data['role'];
        if (expectedRole) {
            const roles = localStorage.getItem('roles');
            if (roles && roles.includes(expectedRole)) {
                return true;
            } else {
                router.navigate(['/']); // Redirect to home or unauthorized
                return false;
            }
        }
        return true;
    }

    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
};
