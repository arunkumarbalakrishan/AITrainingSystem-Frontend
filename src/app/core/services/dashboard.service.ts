import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private dashUrl = `${API_CONFIG.baseUrl}/Dashboard`;

  getAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.dashUrl}/analytics`);
  }

  getRecentlyCompleted(): Observable<any> {
    return this.http.get<any>(`${this.dashUrl}/recently-completed`);
  }

  getAdminReports(): Observable<any> {
    return this.http.get<any>(`${this.dashUrl}/admin/reports`);
  }
}
