import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<string>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  private initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Default to light theme for the new Etsy-like aesthetic
      this.setTheme('light');
    }
  }

  public setTheme(theme: string) {
    this.themeSubject.next(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  public toggleTheme() {
    const current = this.themeSubject.value;
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }

  public get currentTheme(): string {
    return this.themeSubject.value;
  }
}
