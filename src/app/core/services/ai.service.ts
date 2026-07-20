import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api-config';

@Injectable({
  providedIn: 'root',
})
export class AIService {
  private http = inject(HttpClient);
  private aiUrl = `${API_CONFIG.baseUrl}/AI`;

  askTutor(
    courseId: string,
    question: string,
    chatHistory: Array<{ role: string; content: string }>,
  ): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/tutor/${courseId}`, {
      question,
      chatHistory: chatHistory.map((h) => ({
        role: h.role, // "user" or "assistant"
        content: h.content,
      })),
    });
  }

  generateQuiz(
    topic: string,
    difficulty: string = 'Intermediate',
    questionCount: number = 5,
  ): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/generate-quiz`, {
      topic,
      difficulty,
      questionCount,
    });
  }

  getRecommendations(): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/recommendations`);
  }

  mockInterviewStep(
    courseTopic: string,
    studentAnswer: string | null,
    chatHistory: any[],
  ): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/mock-interview`, {
      courseTopic,
      studentAnswer,
      chatHistory: chatHistory.map((h) => ({
        role: h.role,
        content: h.content,
      })),
    });
  }

  analyzeResume(resumeText: string): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/resume-analysis`, {
      resumeText,
    });
  }

  // --- Advanced Mock Interview API Methods ---
  startMockInterview(payload: {
    courseTopic: string;
    difficulty: string;
    questionCount: number;
    language: string;
    resumeText?: string;
    jobDescriptionText?: string;
    mode: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/mock-interview/start`, payload);
  }

  submitMockInterviewStep(payload: {
    sessionId: string;
    studentAnswer: string | null;
    eyeContactRate: number;
    slouchCount: number;
    volumeVariance: number;
    wordCount: number;
    fillerWords: string[];
    detectedEmotions: string[];
    tabSwitched: boolean;
    forceFinish?: boolean;
  }): Observable<any> {
    return this.http.post<any>(`${this.aiUrl}/mock-interview/step`, payload);
  }

  getMockInterviewHistory(): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/mock-interview/history`);
  }

  getMockInterviewScorecard(id: string): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/mock-interview/${id}/scorecard`);
  }

  uploadMockInterviewVideo(id: string, videoBlob: Blob): Observable<any> {
    const formData = new FormData();
    formData.append('file', videoBlob, 'replay.mp4');
    return this.http.post<any>(`${this.aiUrl}/mock-interview/${id}/video`, formData);
  }

  getGlobalMockInterviews(): Observable<any> {
    return this.http.get<any>(`${this.aiUrl}/admin/mock-interviews`);
  }

  // --- Local Storage History Management ---
  private readonly SESSIONS_KEY = 'ai_chat_sessions';
  private readonly MINI_CHAT_KEY = 'ai_mini_chat_history';

  getChatSessions(): any[] {
    const data = localStorage.getItem(this.SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveChatSession(id: string, title: string, messages: any[]) {
    let sessions = this.getChatSessions();
    const existingIndex = sessions.findIndex((s) => s.id === id);

    const session = {
      id,
      title: title || 'New Chat',
      date: new Date().toISOString(),
      messages,
    };

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.unshift(session); // Add to top
    }

    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  getChatSessionMessages(id: string): any[] {
    const sessions = this.getChatSessions();
    const session = sessions.find((s) => s.id === id);
    return session ? session.messages : [];
  }

  deleteChatSession(id: string) {
    let sessions = this.getChatSessions();
    sessions = sessions.filter((s) => s.id !== id);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  getMiniChatHistory(): any[] {
    const data = localStorage.getItem(this.MINI_CHAT_KEY);
    return data ? JSON.parse(data) : [];
  }

  saveMiniChatHistory(messages: any[]) {
    localStorage.setItem(this.MINI_CHAT_KEY, JSON.stringify(messages));
  }
}
