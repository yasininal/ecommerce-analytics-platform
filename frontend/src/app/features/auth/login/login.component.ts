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
    <div class="login-page">
      <div class="login-bg"></div>
      <div class="login-card">
        <!-- Logo -->
        <div class="login-logo">
          <div class="logo-icon">📊</div>
          <span class="logo-text">DataPulse</span>
        </div>

        <h1 class="login-title">Welcome back</h1>
        <p class="login-subtitle">Sign in to your analytics dashboard</p>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="field-group">
            <label class="field-label">Email address</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="dp-input field-input"
              placeholder="admin@platform.com"
            />
          </div>

          <div class="field-group">
            <label class="field-label">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="dp-input field-input"
              placeholder="••••••••"
            />
          </div>

          <div *ngIf="error" class="login-error">
            <span>⚠️ {{ error }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary login-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="!loading">Sign In →</span>
            <span *ngIf="loading" class="spinner" style="width:16px;height:16px;margin:0"></span>
          </button>
        </form>

        <div class="login-hint">
          <p>Demo: <code>admin@platform.com</code> / <code>password123</code></p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-base);
      position: relative;
      overflow: hidden;
    }
    .login-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,92,252,0.15) 0%, transparent 70%),
        radial-gradient(ellipse 40% 40% at 80% 80%, rgba(56,189,248,0.08) 0%, transparent 60%);
      pointer-events: none;
    }
    .login-card {
      width: 400px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      padding: 40px;
      position: relative;
      z-index: 1;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5), var(--shadow-glow);
    }
    .login-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .logo-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .logo-text {
      font-size: 20px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .login-title {
      font-size: 26px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
    }
    .login-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 32px;
    }
    .login-form { display: flex; flex-direction: column; gap: 18px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
    .field-input { width: 100%; }
    .login-error {
      background: rgba(255,92,122,0.1);
      border: 1px solid rgba(255,92,122,0.25);
      border-radius: var(--radius-sm);
      padding: 10px 14px;
      color: var(--danger);
      font-size: 13px;
    }
    .login-btn { width: 100%; justify-content: center; padding: 12px; font-size: 14px; margin-top: 4px; }
    .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
    .login-hint {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 12px;
      color: var(--text-muted);
    }
    .login-hint code {
      background: var(--bg-elevated);
      padding: 2px 6px;
      border-radius: 4px;
      color: var(--accent-light);
      font-size: 11px;
    }
  `]
})
export class LoginComponent {
    loginForm: FormGroup;
    error = '';
    loading = false;

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
            this.loading = true;
            this.error = '';
            this.authService.login(this.loginForm.value).subscribe({
                next: (res) => {
                    this.loading = false;
                    localStorage.setItem('roles', JSON.stringify(res.roles));
                    if (res.roles.includes('ROLE_ADMIN')) {
                        this.router.navigate(['/admin/dashboard']);
                    } else if (res.roles.includes('ROLE_CORPORATE')) {
                        this.router.navigate(['/corporate/dashboard']);
                    } else {
                        this.router.navigate(['/individual/dashboard']);
                    }
                },
                error: () => {
                    this.loading = false;
                    this.error = 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.';
                }
            });
        }
    }
}
