import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  private http = inject(HttpClient);
  private courseUrl = `${API_CONFIG.baseUrl}/Course`;
  private lessonUrl = `${API_CONFIG.baseUrl}/Lesson`;
  private noteUrl = `${API_CONFIG.baseUrl}/LessonNote`;

  // Course endpoints
  getCourses(): Observable<any> {
    return this.http.get<any>(this.courseUrl);
  }

  getEnrolledCourses(): Observable<any> {
    return this.http.get<any>(`${this.courseUrl}/enrolled`);
  }

  searchCourses(q: string): Observable<any> {
    return this.http.get<any>(`${this.courseUrl}/search`, { params: { q } });
  }

  getCourseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.courseUrl}/${id}`);
  }

  getCourseFull(id: string): Observable<any> {
    return this.http.get<any>(`${this.courseUrl}/${id}/full`);
  }

  createCourse(course: any): Observable<any> {
    return this.http.post<any>(this.courseUrl, course);
  }

  updateCourse(id: string, course: any): Observable<any> {
    return this.http.put<any>(`${this.courseUrl}/${id}`, course);
  }

  deleteCourse(id: string): Observable<any> {
    return this.http.delete<any>(`${this.courseUrl}/${id}`);
  }

  // Lesson endpoints
  getLessons(courseId: string): Observable<any> {
    return this.http.get<any>(`${this.lessonUrl}/course/${courseId}`);
  }

  getLessonById(id: string): Observable<any> {
    return this.http.get<any>(`${this.lessonUrl}/${id}`);
  }

  createLesson(lesson: any): Observable<any> {
    return this.http.post<any>(this.lessonUrl, lesson);
  }

  updateLesson(id: string, lesson: any): Observable<any> {
    return this.http.put<any>(`${this.lessonUrl}/${id}`, lesson);
  }

  deleteLesson(id: string): Observable<any> {
    return this.http.delete<any>(`${this.lessonUrl}/${id}`);
  }

  // Lesson Notes endpoints
  getNotesByLesson(lessonId: string): Observable<any> {
    return this.http.get<any>(`${this.noteUrl}/lesson/${lessonId}`);
  }

  createNote(note: any): Observable<any> {
    return this.http.post<any>(this.noteUrl, note);
  }

  updateNote(noteId: string, note: any): Observable<any> {
    return this.http.put<any>(`${this.noteUrl}/${noteId}`, note);
  }

  deleteNote(noteId: string): Observable<any> {
    return this.http.delete<any>(`${this.noteUrl}/${noteId}`);
  }
}
