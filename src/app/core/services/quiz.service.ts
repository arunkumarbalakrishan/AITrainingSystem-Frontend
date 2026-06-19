import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class QuizService {
  private http = inject(HttpClient);
  private quizUrl = `${API_CONFIG.baseUrl}/Quiz`;

  createQuiz(quiz: any): Observable<any> {
    return this.http.post<any>(this.quizUrl, quiz);
  }

  getQuiz(quizId: string): Observable<any> {
    return this.http.get<any>(`${this.quizUrl}/${quizId}`);
  }

  getQuizzesByCourse(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.quizUrl}/course/${courseId}`);
  }

  submitQuiz(
    quizId: string,
    answers: Array<{ questionId: string; selectedOptionId: string }>,
  ): Observable<any> {
    return this.http.post<any>(`${this.quizUrl}/submit`, {
      quizId,
      answers,
    });
  }

  getUserResults(): Observable<any> {
    return this.http.get<any>(`${this.quizUrl}/results`);
  }
}
