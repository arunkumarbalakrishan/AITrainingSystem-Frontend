import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  private http = inject(HttpClient);
  private mediaUrl = `${API_CONFIG.baseUrl}/Media`;

  uploadMedia(lessonId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('LessonId', lessonId);
    formData.append('File', file, file.name);

    // Note: We don't set Content-Type header manually here;
    // HttpClient does it automatically for FormData with the correct boundary.
    return this.http.post<any>(`${this.mediaUrl}/upload`, formData);
  }
}
