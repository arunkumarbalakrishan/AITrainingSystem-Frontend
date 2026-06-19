import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private usersUrl = `${API_CONFIG.baseUrl}/Users`;

  getCurrentUser(): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/me`);
  }

  getAllUsers(params: any = {}): Observable<any> {
    return this.http.get<any>(this.usersUrl, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.usersUrl}/${id}`);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.http.put<any>(`${this.usersUrl}/${id}`, userData);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<any>(`${this.usersUrl}/profile`, profileData);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete<any>(`${this.usersUrl}/${id}`);
  }
}
