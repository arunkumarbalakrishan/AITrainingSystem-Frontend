import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, from, switchMap } from 'rxjs';
import { API_CONFIG } from '../config/api-config';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCdDRPjnPcAMHTGS8lRL9em_Ynty_qUCJI',
  authDomain: 'ai-online-training-system.firebaseapp.com',
  projectId: 'ai-online-training-system',
  storageBucket: 'ai-online-training-system.firebasestorage.app',
  messagingSenderId: '737375098251',
  appId: '1:737375098251:web:c66501d83764adbba04b8e',
  measurementId: 'G-D3NRNKMYCF',
};

const app = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${API_CONFIG.baseUrl}/Auth`;

  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('access_token');
    if (token) {
      this.currentUserSubject.next(this.decodeToken(token));
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(resetData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, resetData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap((res) => {
        const data = res?.data || res;
        if (data && (data.token || data.accessToken)) {
          const token = data.token || data.accessToken;
          localStorage.setItem('access_token', token);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          this.currentUserSubject.next(this.decodeToken(token));
        }
      }),
    );
  }

  loginWithGoogle(): Observable<any> {
    return from(signInWithPopup(firebaseAuth, googleProvider)).pipe(
      switchMap(async (result) => {
        const idToken = await result.user.getIdToken();
        return { idToken };
      }),
      switchMap((payload) => {
        return this.http.post<any>(`${this.baseUrl}/google-login`, payload);
      }),
      tap((res) => {
        const data = res?.data || res;
        if (data && (data.token || data.accessToken)) {
          const token = data.token || data.accessToken;
          localStorage.setItem('access_token', token);
          if (data.refreshToken) {
            localStorage.setItem('refresh_token', data.refreshToken);
          }
          this.currentUserSubject.next(this.decodeToken(token));
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    // Quick expiration check
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return false;

    const expiry = payload.exp * 1000;
    return expiry > Date.now();
  }

  getUserRole(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return 'Student';
    const payload = this.decodeToken(token);
    // Standard role claim name is http://schemas.microsoft.com/ws/2008/06/identity/claims/role or 'role'
    return (
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      payload?.role ||
      'Student'
    );
  }

  getUserName(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return 'Guest';
    const payload = this.decodeToken(token);
    return (
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      payload?.unique_name ||
      payload?.email ||
      'User'
    );
  }

  getUserEmail(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = this.decodeToken(token);
    return (
      payload?.email ||
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      payload?.sub ||
      ''
    );
  }

  getCurrentUserId(): string {
    const token = localStorage.getItem('access_token');
    if (!token) return '';
    const payload = this.decodeToken(token);
    return (
      payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
      payload?.nameid ||
      payload?.sub ||
      ''
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const pad = payload.length % 4;
      if (pad === 2) {
        payload += '==';
      } else if (pad === 3) {
        payload += '=';
      }
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }
}
