import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <nav class="p-4 bg-darkCard/80 backdrop-blur border-b border-white/10 flex justify-between items-center z-50 sticky top-0 shadow-lg">
      <h1 class="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform cursor-pointer">VoteNow</h1>
      <div *ngIf="auth.isLoggedIn$ | async" class="flex items-center gap-6">
        <span class="text-sm text-blue-200">Welcome back</span>
        <button (click)="logout()" class="text-sm px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/30 text-red-400 hover:text-red-200 transition-all font-medium">Logout</button>
      </div>
    </nav>
    <main class="w-full relative min-h-[calc(100vh-80px)] overflow-hidden">

      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="relative z-10 container mx-auto p-4 flex flex-col items-center min-h-[calc(100vh-80px)]">
        <router-outlet></router-outlet>
      </div>
    </main>
  `
})
export class AppComponent {
  constructor(public auth: AuthService) {}
  logout() { this.auth.logout(); }
}
