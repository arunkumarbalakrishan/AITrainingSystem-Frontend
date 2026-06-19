import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class DiagnosticsService {
  private http = inject(HttpClient);
  private diagUrl = `${API_CONFIG.baseUrl}/Diagnostics`;

  runAll(): Observable<any> {
    return this.http.get<any>(`${this.diagUrl}/run-all`);
  }
}
