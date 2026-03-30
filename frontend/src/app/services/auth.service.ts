import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.loggedIn.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  hasToken(): boolean { return !!localStorage.getItem('token'); }
  getToken(): string | null { return localStorage.getItem('token'); }
  getUsername(): string | null { return localStorage.getItem('username'); }
  getRole(): string | null { return localStorage.getItem('role'); }
  isAdmin(): boolean { return this.getRole() === 'admin'; }

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password })
      .pipe(tap(res => {
        this.handleAuthResponse(res);
      }));
  }

  register(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/register`, { username, password })
      .pipe(tap(res => {
        this.handleAuthResponse(res);
      }));
  }

  private handleAuthResponse(res: any) {
    localStorage.setItem('token', res.token);
    localStorage.setItem('username', res.username);
    localStorage.setItem('hasVoted', res.hasVoted.toString());
    localStorage.setItem('role', res.role || 'user');
    this.loggedIn.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('hasVoted');
    localStorage.removeItem('role');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }
}
