import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
    <div class="login-container">
      <h2>Giriş Yap</h2>
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="email">E-posta</label>
          <input id="email" type="email" formControlName="email" class="form-control" />
        </div>
        <div class="form-group">
          <label for="password">Şifre</label>
          <input id="password" type="password" formControlName="password" class="form-control" />
        </div>
        <button type="submit" [disabled]="loginForm.invalid" class="btn btn-primary">Giriş</button>
        <div *ngIf="error" class="error-message">{{ error }}</div>
      </form>
    </div>
  `,
    styles: [`
    .login-container { max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
    .form-group { margin-bottom: 15px; }
    .form-control { width: 100%; padding: 8px; box-sizing: border-box; }
    .btn { width: 100%; padding: 10px; background-color: #007bff; color: white; border: none; cursor: pointer; }
    .btn:disabled { background-color: #cccccc; cursor: not-allowed; }
    .error-message { color: red; margin-top: 10px; }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    error = '';

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.authService.login(this.loginForm.value).subscribe({
                next: (res) => {
                    localStorage.setItem('roles', JSON.stringify(res.roles));
                    if (res.roles.includes('ROLE_ADMIN')) {
                        this.router.navigate(['/admin']);
                    } else if (res.roles.includes('ROLE_CORPORATE')) {
                        this.router.navigate(['/corporate']);
                    } else {
                        this.router.navigate(['/individual']);
                    }
                },
                error: (err) => {
                    this.error = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
                }
            });
        }
    }
}
