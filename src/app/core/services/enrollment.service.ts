import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class EnrollmentService {
  private http = inject(HttpClient);
  private enrollUrl = `${API_CONFIG.baseUrl}/Enrollment`;
  private paymentUrl = `${API_CONFIG.baseUrl}/Payment`;

  enroll(courseId: string): Observable<any> {
    return this.http.post<any>(this.enrollUrl, { courseId });
  }

  checkoutStripe(courseId: string, successUrl: string, cancelUrl: string): Observable<any> {
    return this.http.post<any>(`${this.paymentUrl}/checkout`, { courseId, successUrl, cancelUrl });
  }

  confirmMockPayment(courseId: string): Observable<any> {
    return this.http.post<any>(`${this.paymentUrl}/confirm?courseId=${courseId}`, {});
  }
}
