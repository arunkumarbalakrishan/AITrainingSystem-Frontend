import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private http = inject(HttpClient);
  private progressUrl = `${API_CONFIG.baseUrl}/Progress`;

  completeLesson(lessonId: string): Observable<any> {
    return this.http.post<any>(`${this.progressUrl}/complete`, { lessonId });
  }

  getCourseProgress(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.progressUrl}/course/${courseId}`);
  }

  getCompletedLessons(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.progressUrl}/course/${courseId}/completed-lessons`);
  }

  getLessonProgress(lessonId: string): Observable<any> {
    return this.http.get<any>(`${this.progressUrl}/${lessonId}`);
  }

  updateVideoProgress(
    lessonId: string,
    lastWatchedPositionSeconds: number,
    isCompleted: boolean = false,
  ): Observable<any> {
    return this.http.post<any>(`${this.progressUrl}/video`, {
      lessonId,
      lastWatchedPositionSeconds,
      isCompleted,
    });
  }

  getContinueWatching(): Observable<any> {
    return this.http.get<any>(`${this.progressUrl}/continue-watching`);
  }
}
