import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private notifyUrl = `${API_CONFIG.baseUrl}/Notification`;

  getNotifications(): Observable<any> {
    return this.http.get<any>(this.notifyUrl);
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put<any>(`${this.notifyUrl}/${notificationId}/read`, {});
  }
}
