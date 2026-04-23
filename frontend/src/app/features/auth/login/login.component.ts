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
      <div class="login-left">
        <div class="brand-content">
          <div class="brand-logo">
            <span class="brand-icon">🛍️</span>
            <span class="brand-name">DataPulse</span>
          </div>
          <h2 class="brand-headline">Analytics that power smarter decisions</h2>
          <p class="brand-sub">Track orders, products, and customer insights — all in one place.</p>
          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-icon">📊</span>
              <span>Real-time analytics dashboard</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">🤖</span>
              <span>AI-powered business assistant</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">📦</span>
              <span>Product & inventory management</span>
            </div>
          </div>
        </div>
      </div>
      <div class="login-right">
        <div class="login-card">
          <h1 class="login-title">Welcome back</h1>
          <p class="login-subtitle">Sign in to your account to continue</p>

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
              class="btn btn-accent login-btn"
              [disabled]="loginForm.invalid || loading"
            >
              <span *ngIf="!loading">Sign In →</span>
              <span *ngIf="loading" class="spinner" style="width:16px;height:16px;margin:0"></span>
            </button>
          </form>

          <div class="login-hint">
            <p>Demo credentials:</p>
            <div class="hint-credentials">
              <code>admin&#64;platform.com</code> / <code>password123</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      background: var(--bg-base);
    }

    /* Left side - branding */
    .login-left {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--accent);
      padding: 60px;
      position: relative;
      overflow: hidden;
    }
    .login-left::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0,0,0,0.1) 0%, transparent 50%);
    }

    .brand-content {
      position: relative;
      z-index: 1;
      max-width: 440px;
      color: #fff;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 48px;
    }
    .brand-icon {
      font-size: 32px;
      width: 48px; height: 48px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-headline {
      font-size: 36px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 16px;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 16px;
      opacity: 0.85;
      line-height: 1.5;
      margin-bottom: 40px;
    }
    .brand-features { display: flex; flex-direction: column; gap: 16px; }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 14px;
      font-size: 15px;
      font-weight: 500;
      opacity: 0.9;
    }
    .feature-icon {
      font-size: 20px;
      width: 40px; height: 40px;
      background: rgba(255,255,255,0.15);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Right side - form */
    .login-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;
    }
    .login-card {
      width: 100%;
      max-width: 400px;
    }
    .login-title {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }
    .login-subtitle {
      font-size: 15px;
      color: var(--text-secondary);
      margin-bottom: 36px;
    }
    .login-form { display: flex; flex-direction: column; gap: 20px; }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .field-input { width: 100%; padding: 14px 16px; font-size: 15px; }
    .login-error {
      background: rgba(193,58,58,0.08);
      border: 1px solid rgba(193,58,58,0.2);
      border-radius: var(--radius-md);
      padding: 12px 16px;
      color: var(--danger);
      font-size: 14px;
    }
    .login-btn { 
      width: 100%; justify-content: center; padding: 14px; 
      font-size: 16px; margin-top: 8px; border-radius: 12px; 
    }
    .login-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
    .login-hint {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      text-align: center;
      font-size: 13px;
      color: var(--text-muted);
    }
    .hint-credentials {
      margin-top: 8px;
    }
    .login-hint code {
      background: var(--bg-elevated);
      padding: 3px 8px;
      border-radius: 6px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 600;
    }

    @media (max-width: 900px) {
      .login-left { display: none; }
      .login-right { padding: 32px; }
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
