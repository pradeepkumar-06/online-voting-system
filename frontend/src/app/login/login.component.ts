import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="glass-panel w-full max-w-sm p-8 mt-20 animate-fade-in-up">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-2 text-white">Sign In</h2>
        <p class="text-gray-400 text-sm">Log in to cast your vote</p>
      </div>
      
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Username</label>
          <input 
            type="text" 
            [(ngModel)]="username" 
            name="username" 
            required
            class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 outline-none transition-all"
            placeholder="Enter your username"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input 
            type="password" 
            [(ngModel)]="password" 
            name="password" 
            required
            class="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white placeholder-gray-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <div *ngIf="error" class="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
          {{ error }}
        </div>

        <button 
          type="submit" 
          [disabled]="isLoading || !loginForm.form.valid"
          class="btn-primary w-full flex justify-center items-center h-12">
          <span *ngIf="!isLoading">Access Portal</span>
          <span *ngIf="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        </button>
        
        <div class="mt-4 text-center">
          <a routerLink="/register" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">Don't have an account? Register here</a>
        </div>
      </form>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.hasToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    this.auth.login(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.isLoading = false;
        this.error = err.error?.error || err.error?.message || (typeof err.error === 'string' ? err.error : err.message) || 'Login failed. Please try again.';
      }
    });
  }
}
