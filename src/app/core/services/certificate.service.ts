import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private http = inject(HttpClient);
  private certUrl = `${API_CONFIG.baseUrl}/Certificate`;

  getMyCertificates(): Observable<any> {
    return this.http.get<any>(`${this.certUrl}/my-certificates`);
  }

  getCertificate(id: string): Observable<any> {
    return this.http.get<any>(`${this.certUrl}/${id}`);
  }

  downloadCertificate(id: string): Observable<Blob> {
    return this.http.get(`${this.certUrl}/${id}/download`, {
      responseType: 'blob',
    });
  }

  verifyCertificate(certificateNumber: string): Observable<any> {
    return this.http.get<any>(`${this.certUrl}/verify/${certificateNumber}`);
  }
}
