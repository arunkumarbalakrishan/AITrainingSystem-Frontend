import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class LiveClassService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/LiveClass`;

  getUpcomingLiveClasses(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/upcoming`);
  }

  getUpcomingLiveClassesByCourse(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/course/${courseId}`);
  }

  createLiveClass(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, data);
  }

  deleteLiveClass(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
