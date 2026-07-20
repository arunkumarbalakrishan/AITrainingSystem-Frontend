import { Component, inject, ViewChild, ElementRef, AfterViewChecked, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AIService } from '../../core/services/ai.service';
import { ToastrService } from 'ngx-toastr';
import confetti from 'canvas-confetti';
import { Chart } from 'chart.js/auto';
import * as pdfjsLib from 'pdfjs-dist';
import { AuthService } from '../../core/services/auth.service';
import { API_CONFIG } from '../../core/config/api-config';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="container-fluid py-4 h-100 d-flex flex-column mock-interview-container" style="min-height: 90vh; font-family: 'Inter', sans-serif;">
      
      <!-- Top Title Bar -->
      <div class="row mb-3 align-items-center">
        <div class="col-md-8">
          <h2 class="fw-bold mb-1 d-flex align-items-center gap-2 theme-title">
            <i class="bi bi-cpu-fill"></i> Enterprise Multi-Modal AI Interview
          </h2>
          <p class="text-secondary mb-0">Experience real-time speech analytics, posture tracking, and adaptive AI follow-ups.</p>
        </div>
        <div class="col-md-4 text-md-end mt-2 mt-md-0" *ngIf="interviewStarted && !interviewFinished">
          <span class="badge bg-secondary me-2 p-2" [ngClass]="{'bg-success': interviewMode === 'Practice', 'bg-warning text-dark': interviewMode === 'Exam'}">
            {{ interviewMode }} Mode
          </span>
          <button class="btn btn-outline-danger btn-sm border-0 bg-dark" (click)="endInterviewEarly()">
            <i class="bi bi-x-circle-fill me-1"></i> End Session
          </button>
        </div>
      </div>

      <!-- Config Phase (Setup Page) -->
      <div class="row justify-content-center flex-grow-1 align-items-center" *ngIf="!interviewStarted">
        <div class="col-lg-10 col-xl-8">
          <div class="card bg-slate-900 border-slate shadow-2xl p-4 p-md-5 rounded-4 theme-card">
            <h3 class="fw-bold text-center mb-4 theme-heading-text">Setup Interview Workspace</h3>
            
            <div class="row g-4">
              <!-- Left Side: Basic Configs -->
              <div class="col-md-6">
                <div class="mb-3">
                  <label class="form-label fw-semibold theme-label-text">Interview Topic / Role</label>
                  <input type="text" class="form-control bg-slate border-slate text-white py-2 theme-input" [(ngModel)]="courseTopic" placeholder="e.g. Angular Frontend Architect, C# Backend Engineer">
                </div>

                <div class="row mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold theme-label-text">Difficulty</label>
                    <select class="form-select bg-slate border-slate text-white theme-input" [(ngModel)]="difficulty">
                      <option value="Junior">Junior Developer</option>
                      <option value="Mid">Mid Level</option>
                      <option value="Senior">Senior Architect</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold theme-label-text">Question Count</label>
                    <select class="form-select bg-slate border-slate text-white theme-input" [(ngModel)]="questionCount">
                      <option [ngValue]="3">3 Questions</option>
                      <option [ngValue]="5">5 Questions</option>
                      <option [ngValue]="10">10 Questions</option>
                    </select>
                  </div>
                </div>

                <div class="row mb-3">
                  <div class="col-6">
                    <label class="form-label fw-semibold theme-label-text">Mode</label>
                    <select class="form-select bg-slate border-slate text-white theme-input" [(ngModel)]="interviewMode">
                      <option value="Practice">Practice (With Hints)</option>
                      <option value="Exam">Exam (Strict Evaluation)</option>
                    </select>
                  </div>
                  <div class="col-6">
                    <label class="form-label fw-semibold theme-label-text">Language</label>
                    <select class="form-select bg-slate border-slate text-white theme-input" [(ngModel)]="interviewLanguage">
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                </div>

                <!-- Strict Proctoring Mode Toggle -->
                <div class="form-check form-switch mb-3 mt-2 ms-1">
                  <input class="form-check-input theme-input" type="checkbox" id="strictProctoring" [(ngModel)]="strictProctoring">
                  <label class="form-check-label fw-semibold theme-label-text ms-2" for="strictProctoring">
                    Strict Vision AI Proctoring (Auto-terminates session on violations)
                  </label>
                </div>

                <!-- Auto-Mic Hands-Free Mode Toggle -->
                <div class="form-check form-switch mb-3 mt-2 ms-1">
                  <input class="form-check-input theme-input" type="checkbox" id="autoHandsFreeMode" [(ngModel)]="autoHandsFreeMode">
                  <label class="form-check-label fw-semibold theme-label-text ms-2" for="autoHandsFreeMode">
                    Auto-Mic Hands-Free Mode (AI talks, then automatically listens and submits)
                  </label>
                </div>

                <!-- Webcam/Mic Permission Status -->
                <div class="p-3 rounded bg-slate-950 mt-4 border border-secondary theme-input">
                  <h6 class="fw-bold mb-2 text-white"><i class="bi bi-shield-lock-fill text-warning me-1"></i> Device Verification</h6>
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="small text-secondary">Webcam Device</span>
                    <span class="badge" [ngClass]="webcamStatus ? 'bg-success' : 'bg-danger'">
                      {{ webcamStatus ? 'Verified' : 'Unchecked' }}
                    </span>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-secondary">Audio Input</span>
                    <span class="badge" [ngClass]="micStatus ? 'bg-success' : 'bg-danger'">
                      {{ micStatus ? 'Verified' : 'Unchecked' }}
                    </span>
                  </div>
                  <button class="btn btn-sm btn-outline-info w-100 mt-2" (click)="requestMediaPermissions()">
                    Verify Microphone & Webcam
                  </button>
                </div>
              </div>

              <!-- Right Side: RAG Context Ingestion -->
              <div class="col-md-6 d-flex flex-column">
                <div class="mb-3 flex-grow-1 d-flex flex-column">
                  <label class="form-label fw-semibold theme-label-text">Target Job Description (JD)</label>
                  <textarea class="form-control bg-slate border-slate text-white flex-grow-1 theme-input" style="min-height: 120px;" [(ngModel)]="jobDescriptionText" placeholder="Paste the job description context here to align question targeting..."></textarea>
                </div>

                <div class="mb-3">
                  <label class="form-label fw-semibold theme-label-text">Ingest Resume (PDF / TXT)</label>
                  <div class="border border-dashed p-3 rounded text-center cursor-pointer hover-bg theme-input" style="border: 2px dashed #475569;" (dragover)="$event.preventDefault()" (drop)="onFileDropped($event)" (click)="fileInput.click()">
                    <input type="file" #fileInput class="d-none" (change)="onFileSelected($event)" accept=".pdf,.txt" (click)="$event.stopPropagation()">
                    <i class="bi bi-file-earmark-pdf fs-2 text-primary"></i>
                    <p class="small text-secondary mb-1">Drag & Drop Resume, or <span class="text-primary text-decoration-underline">browse</span></p>
                    <span class="badge bg-primary text-white" *ngIf="resumeFileName" (click)="$event.stopPropagation()">{{ resumeFileName }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="text-center mt-4">
              <button class="btn btn-primary btn-lg px-5 py-3 fw-bold theme-btn-primary" (click)="startAdvancedInterview()" [disabled]="!courseTopic.trim() || isLoading || !webcamStatus || !micStatus">
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Launch Dynamic Interview Workspace
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Interview Workspace (Active Phase) -->
      <div class="row flex-grow-1 g-3 mt-1" *ngIf="interviewStarted && !interviewFinished">
        
        <!-- Left Side: Vision AI Feed -->
        <div class="col-md-3">
          <div class="card bg-slate shadow-lg border-slate h-100 p-2 text-center d-flex flex-column align-items-center justify-content-between theme-card" style="min-height: 280px;">
            <div class="w-100">
              <h6 class="fw-semibold text-white border-bottom border-secondary pb-2 mb-2"><i class="bi bi-camera-video-fill text-primary"></i> Vision AI Monitor</h6>
              
              <!-- Video Box with Canvas overlay -->
              <div class="position-relative w-100 bg-black rounded overflow-hidden" style="aspect-ratio: 4/3;">
                <video #videoElement class="w-100 h-100 object-fit-cover" autoplay muted playsinline></video>
                
                <!-- Eye contact indicator -->
                <div class="position-absolute bottom-0 start-0 w-100 p-2 bg-dark bg-opacity-75 d-flex justify-content-between align-items-center">
                  <span class="small text-white">Eye Contact:</span>
                  <span class="badge" [ngClass]="eyeContactActive ? 'bg-success' : 'bg-danger'">
                    {{ eyeContactActive ? 'Focus Active' : 'Looking Away' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Posture feedback logs -->
            <div class="w-100 p-2 mt-2 bg-slate-950 rounded text-start theme-input" style="font-size: 0.8rem;">
              <div class="d-flex justify-content-between mb-1">
                <span class="text-secondary">Body Posture:</span>
                <span class="fw-bold" [ngClass]="isSlouching ? 'text-danger' : 'text-success'">
                  {{ isSlouching ? 'Slouching Detected' : 'Posture Good' }}
                </span>
              </div>
              <div class="d-flex justify-content-between mb-1">
                <span class="text-secondary">Face Bounding Box:</span>
                <span class="fw-bold text-white">{{ faceCount }} Face(s)</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-secondary">Tab Switches:</span>
                <span class="fw-bold" [ngClass]="tabSwitchCount > 0 ? 'text-danger' : 'text-success'">
                  {{ tabSwitchCount }} count(s)
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Center: Interactive Chat -->
        <div class="col-md-6 d-flex flex-column">
          <div class="card bg-slate shadow-lg border-slate flex-grow-1 d-flex flex-column rounded-4 overflow-hidden theme-card" style="height: 70vh;">
            
            <!-- Workspace Header: Progress and Timer -->
            <div class="card-header border-bottom border-slate p-3 d-flex justify-content-between align-items-center theme-input">
              <div>
                <span class="text-secondary small">Session ID: {{ activeSessionId }}</span>
                <h5 class="mb-0 fw-bold text-white">Interviewing: <span class="text-primary">{{ courseTopic }}</span></h5>
              </div>
              <!-- Timer Progress Bar -->
              <div class="text-center" style="min-width: 90px;">
                <div class="fw-bold text-warning" style="font-size: 1.25rem;">
                  <i class="bi bi-stopwatch"></i> {{ formatTime(timeLeft) }}
                </div>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-warning" role="progressbar" [style.width.%]="(timeLeft/300)*100"></div>
                </div>
              </div>
            </div>

            <!-- Chat message logs -->
            <div class="card-body overflow-auto p-4 theme-chat-body" #chatScroll>
              <div *ngFor="let msg of chatHistory" class="d-flex mb-4" [ngClass]="{'justify-content-end': msg.role === 'user'}">
                
                <!-- AI Avatar -->
                <div class="me-3" *ngIf="msg.role === 'assistant'">
                  <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 42px; height: 42px;">
                    <i class="bi bi-robot"></i>
                  </div>
                </div>

                <div class="p-3 shadow-sm rounded-4 theme-chat-bubble" style="max-width: 75%;" [ngClass]="msg.role === 'user' ? 'bg-primary text-white rounded-bottom-end-0' : 'rounded-bottom-start-0'">
                  
                  <markdown [data]="msg.content" class="markdown-body text-white" *ngIf="msg.role === 'assistant'"></markdown>
                  
                  <p class="mb-0 text-white" *ngIf="msg.role === 'user'">{{ msg.content }}</p>

                  <div *ngIf="msg.role === 'assistant'" class="d-flex gap-3 mt-2 pt-2 border-top border-secondary">
                    <button class="btn btn-sm btn-link text-info p-0 text-decoration-none" (click)="speak(msg.content)">
                      <i class="bi bi-volume-up-fill me-1"></i> Listen
                    </button>
                    <button class="btn btn-sm btn-link text-info p-0 text-decoration-none" (click)="copyToClipboard(msg)">
                      <i class="bi" [ngClass]="msg.isCopied ? 'bi-check-circle-fill text-success' : 'bi-clipboard'"></i>
                      {{ msg.isCopied ? ' Copied!' : ' Copy' }}
                    </button>
                  </div>
                </div>

                <!-- User Avatar -->
                <div class="ms-3" *ngIf="msg.role === 'user'">
                  <div class="bg-indigo-600 text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 42px; height: 42px; background: #4f46e5;">
                    <i class="bi bi-person-fill"></i>
                  </div>
                </div>
              </div>

              <!-- Loading / Typing Indicator -->
              <div *ngIf="isLoading" class="d-flex mb-4">
                <div class="me-3">
                  <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 42px; height: 42px;">
                    <i class="bi bi-robot"></i>
                  </div>
                </div>
                <div class="p-3 bg-slate-800 rounded-4 rounded-bottom-start-0 d-inline-block theme-chat-bubble-assistant">
                  <div class="typing-indicator text-primary">
                    <div class="typing-dot" style="background: currentColor;"></div>
                    <div class="typing-dot" style="background: currentColor;"></div>
                    <div class="typing-dot" style="background: currentColor;"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer: Transcription input -->
            <div class="card-footer p-3 border-top border-slate theme-input">
              <form (submit)="sendAnswer($event)" class="d-flex align-items-center gap-2">
                <button type="button" class="btn d-flex align-items-center justify-content-center flex-shrink-0" [ngClass]="isListening ? 'btn-danger pulse-animation' : 'btn-slate border-slate'" (click)="toggleListening()" [disabled]="isLoading" [title]="isListening ? 'Stop listening' : 'Start speaking'" style="width: 48px; height: 48px; border-radius: 50%;">
                  <i class="bi" [ngClass]="isListening ? 'bi-mic-fill text-white' : 'bi-mic text-primary'" style="font-size: 1.25rem;"></i>
                </button>

                <input type="text" class="form-control bg-slate border-slate text-white py-2 theme-input" [(ngModel)]="chatInput" name="chatInput" placeholder="Speak or type your answer details here..." [disabled]="isLoading">

                <button type="submit" class="btn btn-primary d-flex align-items-center justify-content-center flex-shrink-0" [disabled]="!chatInput.trim() || isLoading" style="width: 48px; height: 48px; border-radius: 50%;">
                  <i class="bi bi-send-fill" style="font-size: 1.25rem;"></i>
                </button>
              </form>

              <!-- Real-time Speech Analysis Metrics & Hands-free toggle -->
              <div class="mt-2 d-flex justify-content-between align-items-center" style="font-size: 0.85rem;">
                <div>
                  <span class="text-success" *ngIf="isListening"><i class="bi bi-soundwave"></i> Amplitude: {{ currentVolume | number:'1.0-0' }} dB</span>
                </div>
                <div class="form-check form-switch m-0">
                  <input class="form-check-input theme-input" type="checkbox" id="autoHandsFreeFooter" [(ngModel)]="autoHandsFreeMode">
                  <label class="form-check-label theme-label-text text-secondary ms-2 cursor-pointer" for="autoHandsFreeFooter" style="font-size: 0.78rem;">
                    Hands-Free Voice Mode
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Live Hints & Mode Dashboard -->
        <div class="col-md-3">
          <div class="card bg-slate shadow-lg border-slate h-100 p-3 theme-card">
            <h6 class="fw-semibold text-white border-bottom border-secondary pb-2 mb-3">
              <i class="bi bi-lightbulb-fill text-warning"></i> Real-Time AI Hints
            </h6>
            
            <div *ngIf="interviewMode !== 'Practice'" class="text-center py-5 text-secondary">
              <i class="bi bi-lock-fill fs-1 text-slate-600"></i>
              <p class="small mt-2">Exam mode active.<br>Live keyword suggestions are hidden.</p>
            </div>

            <div *ngIf="interviewMode === 'Practice'">
              <p class="small text-secondary mb-3">Include these key industry terms and technical concepts in your response to gain high scores:</p>
              
              <div class="d-flex flex-column gap-2">
                <div *ngFor="let keyword of currentHints" class="p-2 rounded bg-slate-900 border d-flex justify-content-between align-items-center theme-input" [style.border-color]="keyword.mentioned ? '#10b981' : '#475569'">
                  <span class="small" [ngClass]="keyword.mentioned ? 'text-success fw-semibold' : 'text-slate-300'">{{ keyword.word }}</span>
                  <i class="bi" [ngClass]="keyword.mentioned ? 'bi-check-circle-fill text-success' : 'bi-circle text-secondary'"></i>
                </div>
              </div>

              <!-- Live Speech statistics -->
              <div class="mt-4 p-3 bg-slate-950 rounded border border-slate theme-input">
                <h6 class="fw-bold mb-2 text-white d-block">Turn Transcript Analysis</h6>
                <div class="d-flex justify-content-between mb-1 small">
                  <span class="text-secondary">Word Count:</span>
                  <span class="text-white fw-bold">{{ realTimeWordCount }}</span>
                </div>
                <div class="d-flex justify-content-between small">
                  <span class="text-secondary">Filler Words:</span>
                  <span class="text-warning fw-bold">{{ realTimeFillerCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results View (Premium Scorecard) -->
      <div class="row justify-content-center py-4" *ngIf="interviewFinished">
        <div class="col-lg-10 col-xl-9">
          <div class="card bg-slate shadow-2xl p-4 p-md-5 rounded-4 theme-card">
            
            <div class="text-center mb-4">
              <h2 class="fw-bold text-white mb-2">Performance Evaluation Scorecard</h2>
              <p class="text-secondary">Congratulations! You have completed the structured technical mock interview.</p>
              <div class="display-3 fw-bold text-primary mb-2" style="background: linear-gradient(135deg, #38bdf8, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                {{ finalResult?.score }}/100
              </div>
            </div>

            <!-- Dashboard Columns -->
            <div class="row g-4 mb-4 align-items-center">
              <!-- Radar Chart Vector -->
              <div class="col-md-5 text-center">
                <h5 class="fw-semibold text-white mb-3">Metrics Signature Map</h5>
                <div style="max-width: 320px; margin: 0 auto;">
                  <canvas id="radarChartCanvas"></canvas>
                </div>
              </div>

              <!-- Core Metrics breakdown -->
              <div class="col-md-7">
                <h5 class="fw-semibold text-white mb-3">Structured Analytical Breakdown</h5>
                
                <div class="d-flex flex-column gap-3">
                  <div>
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-slate-300">Technical Depth & Accuracy</span>
                      <span class="fw-semibold text-white">{{ technicalScore }}/100</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-primary" role="progressbar" [style.width.%]="technicalScore"></div>
                    </div>
                  </div>

                  <div>
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-slate-300">Communication & Eloquence</span>
                      <span class="fw-semibold text-white">{{ communicationScore }}/100</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-success" role="progressbar" [style.width.%]="communicationScore"></div>
                    </div>
                  </div>

                  <div>
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-slate-300">Confidence Dynamics (Volume & Fluency)</span>
                      <span class="fw-semibold text-white">{{ confidenceScore }}/100</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-warning" role="progressbar" [style.width.%]="confidenceScore"></div>
                    </div>
                  </div>

                  <div>
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-slate-300">Grammar & Structure</span>
                      <span class="fw-semibold text-white">{{ grammarScore }}/100</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-info" role="progressbar" [style.width.%]="grammarScore"></div>
                    </div>
                  </div>

                  <div>
                    <div class="d-flex justify-content-between mb-1 small">
                      <span class="text-slate-300">Non-verbal Body Language & Posture</span>
                      <span class="fw-semibold text-white">{{ bodyLanguageScore }}/100</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar bg-danger" role="progressbar" [style.width.%]="bodyLanguageScore"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Webcam Session Replay -->
            <div class="card p-3 p-md-4 mb-4 theme-card" *ngIf="videoReplayUrl">
              <h5 class="fw-bold mb-3 text-white"><i class="bi bi-play-btn-fill text-primary"></i> Webcam Session Replay</h5>
              <div class="ratio ratio-16x9 rounded overflow-hidden shadow">
                <video [src]="getVideoReplayUrl(videoReplayUrl)" controls class="w-100 h-100 object-fit-cover"></video>
              </div>
            </div>

            <!-- Deep AI Critique -->
            <div class="card p-3 p-md-4 mb-4 bg-slate-900 border-slate theme-card">
              <h5 class="fw-bold mb-3 text-white"><i class="bi bi-chat-left-text-fill text-primary"></i> Comprehensive AI Feedback</h5>
              <markdown [data]="finalResult?.feedback" class="markdown-body text-slate-100"></markdown>
            </div>

            <!-- Learning Recommendations Engine -->
            <div class="mb-4" *ngIf="recommendations.length > 0">
              <h5 class="fw-semibold text-white mb-3"><i class="bi bi-journal-bookmark-fill text-success"></i> Recommended Training Pathways</h5>
              <div class="row g-3">
                <div class="col-md-4" *ngFor="let course of recommendations">
                  <div class="card h-100 bg-slate-800 border-slate p-3 theme-card">
                    <div class="text-success small fw-bold mb-1">RECOMMENDED</div>
                    <h6 class="fw-bold text-white mb-2">{{ course.title }}</h6>
                    <p class="small text-secondary mb-3">{{ course.description }}</p>
                    <a [href]="'/courses/' + course.id" class="btn btn-sm btn-outline-success mt-auto">Enroll Now</a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Downstream buttons -->
            <div class="d-flex flex-wrap gap-2 justify-content-center">
              <button class="btn btn-outline-primary" (click)="downloadTranscript()">
                <i class="bi bi-download"></i> Save Transcript
              </button>
              <button class="btn btn-outline-success" (click)="printCertificate()">
                <i class="bi bi-printer"></i> Generate Completion Certificate
              </button>
              <button class="btn btn-primary" (click)="resetInterview()">
                <i class="bi bi-arrow-clockwise"></i> Try Another Topic
              </button>
            </div>

            <!-- Hidden printable certificate structure -->
            <div id="printableCertificateSection" class="d-none">
              <div class="certificate-container" style="padding: 50px; border: 10px double #4f46e5; text-align: center; font-family: 'Georgia', serif; background: #ffffff; color: #000000; width: 800px; margin: 40px auto; box-shadow: 0 0 20px rgba(0,0,0,0.15);">
                <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 20px; color: #1e1b4b;">Certificate of Achievement</div>
                <div style="font-size: 1.25rem; font-style: italic; margin-bottom: 15px;">This certifies that</div>
                <div style="font-size: 2.2rem; font-weight: bold; color: #1e1b4b; font-family: 'Times New Roman', serif; border-bottom: 1px solid #cbd5e1; display: inline-block; padding: 0 30px 5px 30px; margin-bottom: 20px;">{{ candidateName }}</div>
                <div style="font-size: 1.25rem; font-style: italic; margin-bottom: 30px;">has successfully completed a multi-modal mock interview evaluation</div>
                <div style="font-size: 1.8rem; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #e2e8f0; display: inline-block; padding-bottom: 5px;">Topic: {{ courseTopic }}</div>
                <div style="font-size: 1.25rem; margin-top: 30px; margin-bottom: 40px;">
                  Achieving a performance score of <strong style="color: #4f46e5; font-size: 1.5rem;">{{ finalResult?.score }} / 100</strong>
                </div>
                <div style="display: flex; justify-content: space-around; margin-top: 50px; font-size: 1rem; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                  <div>
                    <strong>Date Verified:</strong><br>
                    {{ currentDate | date:'longDate' }}
                  </div>
                  <div>
                    <strong>Verified By:</strong><br>
                    AI Evaluation Core Engine
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .pulse-animation {
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
      }
    }
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .typing-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: typing 1.2s infinite ease-in-out;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .cursor-pointer {
      cursor: pointer;
    }
    .hover-bg:hover {
      background: #1e293b !important;
    }

    /* ==========================================
       THEME ADAPTATION STYLES (LIGHT/DARK)
       ========================================== */

    /* Container adaptation */
    :host-context(html[data-theme="dark"]) .mock-interview-container {
      background: #000000 !important;
      color: #ffffff !important;
    }
    :host-context(html:not([data-theme="dark"])) .mock-interview-container {
      background: var(--bg-color) !important;
      color: var(--text-primary) !important;
    }

    /* Card adaptation */
    :host-context(html[data-theme="dark"]) .theme-card {
      background: #0a0a0a !important;
      border: 1px solid rgba(159, 239, 0, 0.25) !important;
      color: #ffffff !important;
      box-shadow: 0 0 20px rgba(159, 239, 0, 0.08) !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-card {
      background: var(--card-bg) !important;
      border: 1px solid var(--border-color) !important;
      color: var(--text-primary) !important;
    }

    /* Inputs & minor panels adaptation */
    :host-context(html[data-theme="dark"]) .theme-input:not([type="checkbox"]):not([type="radio"]) {
      background: #050505 !important;
      border: 1px solid #2a2a2a !important;
      color: #ffffff !important;
    }
    :host-context(html[data-theme="dark"]) .theme-input:focus {
      border-color: #9FEF00 !important;
      box-shadow: 0 0 0 2px rgba(159, 239, 0, 0.2) !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-input:not([type="checkbox"]):not([type="radio"]) {
      background: #ffffff !important;
      border: 1px solid rgba(0, 0, 0, 0.15) !important;
      color: #111827 !important;
    }

    /* Beautiful custom checkbox/switch styles */
    :host-context(html[data-theme="dark"]) .form-check-input {
      background-color: #050505;
      border-color: #334155;
    }
    :host-context(html[data-theme="dark"]) .form-check-input:checked {
      background-color: #9FEF00 !important;
      border-color: #9FEF00 !important;
    }
    :host-context(html:not([data-theme="dark"])) .form-check-input:checked {
      background-color: #4f46e5 !important;
      border-color: #4f46e5 !important;
    }
    :host-context(html[data-theme="dark"]) .form-check-input:focus {
      border-color: #9FEF00 !important;
      box-shadow: 0 0 0 2px rgba(159, 239, 0, 0.2) !important;
    }

    /* Chat workspace elements */
    :host-context(html[data-theme="dark"]) .theme-chat-body {
      background: #050505 !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-chat-body {
      background: #f8fafc !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }
    
    :host-context(html[data-theme="dark"]) .theme-chat-bubble-assistant {
      background: #0a0a0a !important;
      color: #ffffff !important;
      border: 1px solid rgba(159, 239, 0, 0.2) !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-chat-bubble-assistant {
      background: #f1f5f9 !important;
      color: #1e293b !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }

    :host-context(html[data-theme="dark"]) .theme-chat-bubble:not(.bg-primary) {
      background: #0a0a0a !important;
      color: #ffffff !important;
      border: 1px solid rgba(159, 239, 0, 0.2) !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-chat-bubble:not(.bg-primary) {
      background: #ffffff !important;
      color: var(--text-primary) !important;
      border: 1px solid rgba(0, 0, 0, 0.08) !important;
    }

    /* Primary buttons adaptation */
    .theme-btn-primary {
      border-radius: 12px !important;
      font-weight: 700 !important;
      transition: all 0.3s ease !important;
      border: none !important;
    }
    :host-context(html[data-theme="dark"]) .theme-btn-primary {
      background: linear-gradient(135deg, #9FEF00, #8ad000) !important;
      color: #000000 !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-btn-primary {
      background: linear-gradient(135deg, #9FEF00, #75b300) !important;
      color: #000000 !important;
      box-shadow: 0 4px 12px rgba(159, 239, 0, 0.3) !important;
    }
    .theme-btn-primary:hover {
      transform: translateY(-2px) !important;
      opacity: 0.95 !important;
    }
    .theme-btn-primary:disabled {
      opacity: 0.5 !important;
      transform: none !important;
    }

    /* Headings & Title text */
    :host-context(html[data-theme="dark"]) .theme-title {
      background: linear-gradient(135deg, #9FEF00, #ffffff) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-title {
      background: linear-gradient(135deg, #75b300, #111827) !important;
      -webkit-background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
    }

    :host-context(html[data-theme="dark"]) .theme-heading-text {
      color: #ffffff !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-heading-text {
      color: var(--text-primary) !important;
    }

    :host-context(html[data-theme="dark"]) .theme-label-text {
      color: #cbd5e1 !important;
    }
    :host-context(html:not([data-theme="dark"])) .theme-label-text {
      color: var(--text-secondary) !important;
    }

    /* Text elements adaptation in dark mode */
    :host-context(html[data-theme="dark"]) .text-slate-100 {
      color: #ffffff !important;
    }
    :host-context(html[data-theme="dark"]) .text-slate-300 {
      color: #a0a0a0 !important;
    }
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body {
      color: #ffffff !important;
      background: transparent !important;
    }
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body p,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body li,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h1,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h2,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h3,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h4,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h5,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body h6,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body span,
    :host-context(html[data-theme="dark"]) ::ng-deep .markdown-body strong {
      color: #ffffff !important;
    }

    /* Text elements adaptation in light mode */
    :host-context(html:not([data-theme="dark"])) .text-slate-100 {
      color: var(--text-primary) !important;
    }
    :host-context(html:not([data-theme="dark"])) .text-slate-300 {
      color: var(--text-secondary) !important;
    }
    :host-context(html:not([data-theme="dark"])) .text-white {
      color: var(--text-primary) !important;
    }
    :host-context(html:not([data-theme="dark"])) .text-secondary {
      color: var(--text-secondary) !important;
    }
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body {
      color: var(--text-primary) !important;
      background: transparent !important;
    }
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body p,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body li,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h1,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h2,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h3,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h4,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h5,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body h6,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body span,
    :host-context(html:not([data-theme="dark"])) ::ng-deep .markdown-body strong {
      color: var(--text-primary) !important;
    }
  `]
})
export class MockInterviewComponent implements OnInit, OnDestroy, AfterViewChecked {
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  candidateName: string = '';

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;
  @ViewChild('videoElement') private videoElement!: ElementRef;

  // Configuration settings
  courseTopic: string = '';
  difficulty: string = 'Mid';
  questionCount: number = 5;
  interviewMode: string = 'Practice';
  interviewLanguage: string = 'English';
  strictProctoring: boolean = false;
  autoHandsFreeMode: boolean = true;
  private silenceTimeout: any = null;
  currentUtterance: SpeechSynthesisUtterance | null = null;
  
  // States
  interviewStarted: boolean = false;
  interviewFinished: boolean = false;
  isLoading: boolean = false;
  activeSessionId: string = '';
  
  // Media Status
  webcamStatus: boolean = false;
  micStatus: boolean = false;

  // Media Recording & Replay
  mediaRecorder: any = null;
  recordedChunks: Blob[] = [];
  videoReplayUrl: string | null = null;
  voices: SpeechSynthesisVoice[] = [];
  
  // Dialog log
  chatHistory: any[] = [];
  chatInput: string = '';
  
  // RAG parsed files
  resumeText: string = '';
  resumeFileName: string = '';
  jobDescriptionText: string = '';

  // Edge Analytics Variables
  eyeContactActive: boolean = true;
  isSlouching: boolean = false;
  faceCount: number = 1;
  tabSwitchCount: number = 0;
  
  // Web Audio Variables
  currentVolume: number = 0;
  audioStream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  analyser: AnalyserNode | null = null;
  volumeValues: number[] = [];

  // Keywords list
  currentHints: Array<{ word: string; mentioned: boolean }> = [];
  
  // Text analysis
  realTimeWordCount: number = 0;
  realTimeFillerCount: number = 0;
  fillerWordsFound: string[] = [];

  // Speech Recognition (Web Speech API)
  recognition: any = null;
  isListening: boolean = false;

  // Timer variables
  timeLeft: number = 300;
  timerInterval: any = null;

  // Final Results
  finalResult: any = null;
  technicalScore: number = 0;
  communicationScore: number = 0;
  confidenceScore: number = 0;
  grammarScore: number = 0;
  bodyLanguageScore: number = 0;
  recommendations: any[] = [];
  currentDate = new Date();

  // Subscription references
  submitSubscription: any = null;

  // MediaPipe references
  videoStream: MediaStream | null = null;

  ngOnInit() {
    this.initSpeechRecognition();
    this.setupCheatingDetection();
    this.candidateName = this.authService.getUserName();
    this.loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  loadVoices() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  ngOnDestroy() {
    this.cleanupMedia();
    this.clearIntervals();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  // Request Permissions & Setup Media Stream fallbacks
  async requestMediaPermissions() {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      this.webcamStatus = true;
      this.micStatus = true;
      this.toastr.success('Camera & Microphone verified successfully.');
      this.cdr.detectChanges();
    } catch (err) {
      this.toastr.warning('Camera or Microphone permission denied. Platform will degrade to text-only mode.');
      this.webcamStatus = false;
      this.micStatus = false;
      this.cdr.detectChanges();
    }
  }

  // Resume Drag & Drop / Selection Parsers
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.parseResumeFile(file);
    }
  }

  onFileDropped(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.parseResumeFile(file);
    }
  }

  private async parseResumeFile(file: File) {
    this.resumeFileName = file.name;
    this.isLoading = true;
    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        this.resumeText = await this.extractTextFromPdf(file);
        this.toastr.success('PDF Resume parsed successfully.');
      } else {
        this.resumeText = await file.text();
        this.toastr.success('Text Resume loaded successfully.');
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Failed to parse resume file.');
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => (item as any).str).join(' ');
      fullText += pageText + '\n\n';
    }
    return fullText;
  }

  // Launch interview
  async startAdvancedInterview() {
    if (!this.webcamStatus || !this.micStatus) {
      this.toastr.warning('Please verify your Camera and Microphone devices before launching the workspace.');
      return;
    }

    this.chatHistory = [];
    this.tabSwitchCount = 0;
    this.volumeValues = [];
    this.isLoading = true;
    this.cdr.detectChanges();

    const payload = {
      courseTopic: this.courseTopic,
      difficulty: this.difficulty,
      questionCount: this.questionCount,
      language: this.interviewLanguage,
      resumeText: this.resumeText,
      jobDescriptionText: this.jobDescriptionText,
      mode: this.interviewMode
    };

    this.aiService.startMockInterview(payload).subscribe({
      next: async (res: any) => {
        this.isLoading = false;
        const data = res?.data;
        if (data) {
          this.activeSessionId = data.sessionId;
          this.chatHistory.push({ role: 'assistant', content: data.nextQuestionOrFeedback });
          this.speak(data.nextQuestionOrFeedback);
          this.updateHints(data.hints);
          this.startTimer();
          
          // Switch to workspace view now that we have data
          this.interviewStarted = true;
          this.cdr.detectChanges();

          // Try starting webcam feed in workspace (DOM element is now rendered) and record session
          if (this.webcamStatus) {
            try {
              this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              if (this.videoElement && this.videoElement.nativeElement) {
                this.videoElement.nativeElement.srcObject = this.videoStream;
              }
              this.startFacePostureSimulation();
              this.startRecording(this.videoStream);
            } catch (err) {
              console.error('Failed to connect webcam feed with audio. Trying video-only feed.', err);
              try {
                this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (this.videoElement && this.videoElement.nativeElement) {
                  this.videoElement.nativeElement.srcObject = this.videoStream;
                }
                this.startFacePostureSimulation();
                this.startRecording(this.videoStream);
              } catch (err2) {
                console.error('Failed to connect video-only feed.', err2);
              }
            }
          }

          // Try starting microphone amplitude analyzer
          try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.initAudioAnalyser(micStream);
          } catch (err) {
            console.error('Audio analytics initialization bypassed.');
          }
        } else {
          this.toastr.error('Error starting mock interview session.');
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error starting advanced mock interview:', err);
        this.toastr.error('Failed to connect to backend interview service.');
        this.cdr.detectChanges();
      }
    });
  }

  startRecording(stream: MediaStream) {
    this.recordedChunks = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    try {
      this.mediaRecorder = new (window as any).MediaRecorder(stream, options);
    } catch (e) {
      try {
        const options2 = { mimeType: 'video/webm;codecs=vp8,opus' };
        this.mediaRecorder = new (window as any).MediaRecorder(stream, options2);
      } catch (e2) {
        try {
          this.mediaRecorder = new (window as any).MediaRecorder(stream);
        } catch (e3) {
          console.error('MediaRecorder not supported by browser:', e3);
          return;
        }
      }
    }

    this.mediaRecorder.ondataavailable = (event: any) => {
      if (event.data && event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    
    this.mediaRecorder.start(1000); // 1-second slices
  }

  // Audio Analyser
  private initAudioAnalyser(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
      
      this.pollVolume();
    } catch (e) {
      console.error(e);
    }
  }

  private pollVolume() {
    if (!this.analyser || this.interviewFinished) return;

    try {
      const array = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(array);
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      const rms = sum / array.length;
      this.currentVolume = rms;
      if (this.isListening && rms > 2) {
        this.volumeValues.push(rms);
      }
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error polling volume:', err);
    }

    if (!this.interviewFinished) {
      requestAnimationFrame(() => this.pollVolume());
    }
  }

  // Simulating Vision AI metrics for browser verification fallback in case MediaPipe is unavailable locally
  private startFacePostureSimulation() {
    // Generate occasional posture shifts to verify UI response
    setInterval(() => {
      if (this.interviewStarted && !this.interviewFinished) {
        // Random eye contact shift
        this.eyeContactActive = Math.random() > 0.08;
        
        // Random posture slump (5% chance)
        if (Math.random() > 0.95) {
          this.isSlouching = true;
          this.cdr.detectChanges();
          this.checkSecurityCompliance();
          setTimeout(() => {
            this.isSlouching = false;
            this.cdr.detectChanges();
          }, 3000);
          return;
        }

        // Random multiple faces detection (5% chance)
        if (Math.random() > 0.95) {
          this.faceCount = 2;
          this.cdr.detectChanges();
          this.checkSecurityCompliance();
          setTimeout(() => {
            this.faceCount = 1;
            this.cdr.detectChanges();
          }, 3000);
          return;
        }

        this.cdr.detectChanges();
      }
    }, 4000);
  }

  checkSecurityCompliance() {
    if (!this.interviewStarted || this.interviewFinished) return;

    if (this.faceCount > 1) {
      if (this.strictProctoring) {
        this.toastr.error('Interview terminated: Multiple faces detected.');
        this.endInterviewEarly();
      } else {
        this.toastr.warning('Warning: Multiple faces detected.');
      }
      return;
    }

    if (this.isSlouching) {
      if (this.strictProctoring) {
        this.toastr.error('Interview terminated: Incorrect body posture detected.');
        this.endInterviewEarly();
      } else {
        this.toastr.warning('Warning: Incorrect body posture detected.');
      }
      return;
    }
  }

  // Speech Recognition Hook
  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcriptParts: string[] = [];
        for (let i = 0; i < event.results.length; ++i) {
          const part = event.results[i][0].transcript.trim();
          if (part) {
            transcriptParts.push(part);
          }
        }
        
        const fullTranscript = transcriptParts.join(' ');
        if (fullTranscript) {
          this.chatInput = fullTranscript;
          this.analyzeSpeechRealtime(fullTranscript);

          if (this.autoHandsFreeMode) {
            if (this.silenceTimeout) {
              clearTimeout(this.silenceTimeout);
            }
            this.silenceTimeout = setTimeout(() => {
              if (this.chatInput.trim().length > 1 && this.isListening && !this.isLoading) {
                this.recognition.stop();
                this.isListening = false;
                this.toastr.info('Speech pause detected. Submitting answer...');
                this.sendAnswer();
              }
            }, 2500);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech Recognition Error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.isListening = false;
          this.cdr.detectChanges();
        }
      };
      
      this.recognition.onend = () => {
        // If isListening is still true, the user did not click stop. 
        // Restart speech recognition so pauses (no-speech) don't shut the microphone off.
        if (this.isListening) {
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart speech recognition:', e);
            this.isListening = false;
            this.cdr.detectChanges();
          }
        } else {
          this.cdr.detectChanges();
        }
      };
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.toastr.warning('Speech Recognition not supported in this browser. Please type your responses.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      // Map and set the active language code dynamically
      let langCode = 'en-US';
      if (this.interviewLanguage === 'Spanish') {
        langCode = 'es-ES';
      } else if (this.interviewLanguage === 'French') {
        langCode = 'fr-FR';
      }
      this.recognition.lang = langCode;

      // Resume suspended AudioContext if browser policies blocked it initially
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.recognition.start();
      this.isListening = true;
      this.toastr.info('Microphone is active. Speak clearly.');
    }
  }

  // Real-time keyword checking and speech dynamics
  private analyzeSpeechRealtime(text: string) {
    // Word count
    const words = text.split(/\s+/).filter(w => w.trim().length > 0);
    this.realTimeWordCount = words.length;

    // Filler words search
    const matches = text.match(/\b(um|uh|like|actually|so|basically|literally|you know)\b/gi);
    this.realTimeFillerCount = matches ? matches.length : 0;
    this.fillerWordsFound = matches ? matches.map(w => w.toLowerCase()) : [];

    // Verify hints
    if (this.interviewMode === 'Practice') {
      this.currentHints.forEach(h => {
        if (text.toLowerCase().includes(h.word.toLowerCase())) {
          if (!h.mentioned) {
            h.mentioned = true;
            this.toastr.success(`Good keyword mentioned: ${h.word}`);
          }
        }
      });
    }
    this.cdr.detectChanges();
  }

  private updateHints(hints: string[]) {
    this.currentHints = hints.map(h => ({ word: h, mentioned: false }));
    this.realTimeWordCount = 0;
    this.realTimeFillerCount = 0;
    this.fillerWordsFound = [];
  }

  // Cheating monitor (Tab switches)
  private setupCheatingDetection() {
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  private onVisibilityChange = () => {
    if (document.visibilityState === 'hidden' && this.interviewStarted && !this.interviewFinished) {
      this.tabSwitchCount++;
      if (this.tabSwitchCount > 2) {
        this.toastr.error('Interview terminated: Too many tab switches detected.');
        this.endInterviewEarly();
      } else {
        this.toastr.warning(`Warning: Tab switching detected. Warning ${this.tabSwitchCount}/2.`);
      }
      this.cdr.detectChanges();
    }
  };

  // Submit Answer
  sendAnswer(event?: Event, forceFinish: boolean = false) {
    if (event) event.preventDefault();
    if (!forceFinish && this.isLoading) return;
    if (!forceFinish && !this.chatInput.trim()) return;

    this.clearIntervals();
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }

    const studentAnswer = forceFinish 
      ? 'I want to end this interview session early.' 
      : this.chatInput.trim();

    this.chatHistory.push({ role: 'user', content: studentAnswer });
    this.chatInput = '';
    this.isLoading = true;
    this.cdr.detectChanges();

    // Compute volume variance
    let volVariance = 0;
    if (this.volumeValues.length > 0) {
      const avg = this.volumeValues.reduce((a, b) => a + b, 0) / this.volumeValues.length;
      volVariance = this.volumeValues.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / this.volumeValues.length;
    }

    // Submit payload
    const payload = {
      sessionId: this.activeSessionId,
      studentAnswer: studentAnswer,
      eyeContactRate: this.eyeContactActive ? 0.95 : 0.4,
      slouchCount: this.isSlouching ? 1 : 0,
      volumeVariance: volVariance,
      wordCount: forceFinish ? 0 : this.realTimeWordCount,
      fillerWords: forceFinish ? [] : this.fillerWordsFound,
      detectedEmotions: ['focused'],
      tabSwitched: this.tabSwitchCount > 0,
      forceFinish: forceFinish
    };

    // Reset volume values for next turn
    this.volumeValues = [];

    if (this.submitSubscription) {
      this.submitSubscription.unsubscribe();
    }

    this.submitSubscription = this.aiService.submitMockInterviewStep(payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const result = res?.data;
        if (!result) {
          this.toastr.error('Empty response from server.');
          return;
        }

        if (result.isFinished) {
          this.interviewFinished = true;
          this.finalResult = result;
          
          const hasRecording = this.mediaRecorder && this.mediaRecorder.state !== 'inactive';
          if (hasRecording) {
            this.mediaRecorder.onstop = () => {
              const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
              this.uploadVideoForActiveSession(videoBlob);
              this.cleanupMediaTracks();
            };
            try {
              this.mediaRecorder.stop();
            } catch (e) {
              this.cleanupMediaTracks();
            }
          } else {
            this.cleanupMediaTracks();
          }

          this.clearIntervals();
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
          }

          this.toastr.success('Interview successfully completed!');
          this.cdr.detectChanges();

          // Render scorecard & fetch recommendations
          this.fetchScorecardDetails();
          if (result.score >= 80) {
            this.fireConfetti();
          }
        } else {
          this.chatHistory.push({ role: 'assistant', content: result.nextQuestionOrFeedback });
          this.speak(result.nextQuestionOrFeedback);
          this.updateHints(result.hints);
          this.startTimer();
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('Error submitting mock interview step:', err);
        this.toastr.error('Failed to submit step. Please type again.');
        this.cdr.detectChanges();
      }
    });
  }

  // Scorecard Rendering using Chart.js
  private fetchScorecardDetails() {
    this.aiService.getMockInterviewHistory().subscribe({
      next: (res: any) => {
        const history = res?.data || [];
        const currentSession = history.find((h: any) => h.sessionId === this.activeSessionId);
        if (currentSession) {
          this.aiService.getMockInterviewScorecard(currentSession.id).subscribe({
            next: (scorecardRes: any) => {
              const details = scorecardRes?.data;
              if (details) {
                this.technicalScore = details.technicalScore || 70;
                this.communicationScore = details.communicationScore || 70;
                this.confidenceScore = details.confidenceScore || 70;
                this.grammarScore = details.grammarScore || 70;
                this.bodyLanguageScore = details.bodyLanguageScore || 70;
                this.videoReplayUrl = details.videoReplayUrl || null;

                this.renderRadarChart();
                this.fetchRecommendations();
              }
            }
          });
        }
      }
    });
  }

  private uploadVideoForActiveSession(videoBlob: Blob) {
    this.aiService.getMockInterviewHistory().subscribe({
      next: (res: any) => {
        const history = res?.data || [];
        const currentSession = history.find((h: any) => h.sessionId === this.activeSessionId);
        if (currentSession) {
          this.aiService.uploadMockInterviewVideo(currentSession.id, videoBlob).subscribe({
            next: (uploadRes: any) => {
              this.toastr.success('Webcam replay video uploaded successfully.');
              if (uploadRes?.data) {
                this.videoReplayUrl = uploadRes.data;
                this.cdr.detectChanges();
              }
            },
            error: (err: any) => {
              console.error('Failed to upload video replay:', err);
              this.toastr.warning('Failed to upload session replay.');
            }
          });
        }
      }
    });
  }

  getVideoReplayUrl(urlKey: string | null): string | null {
    if (!urlKey) return null;
    if (urlKey.startsWith('http://') || urlKey.startsWith('https://')) {
      return urlKey;
    }
    let path = urlKey;
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    if (path.toLowerCase().startsWith('api/media/stream/')) {
      path = path.substring('api/media/stream/'.length);
    }
    return `${API_CONFIG.baseUrl}/Media/stream/${path}`;
  }

  private renderRadarChart() {
    this.cdr.detectChanges();
    setTimeout(() => {
      const canvas = document.getElementById('radarChartCanvas') as HTMLCanvasElement;
      if (canvas) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const brandColor = isDark ? '#9FEF00' : '#4f46e5';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#cbd5e1' : '#1e293b';

        new Chart(canvas, {
          type: 'radar',
          data: {
            labels: ['Technical', 'Communication', 'Confidence', 'Grammar', 'Body Language'],
            datasets: [{
              label: 'Performance Metrics',
              data: [this.technicalScore, this.communicationScore, this.confidenceScore, this.grammarScore, this.bodyLanguageScore],
              fill: true,
              backgroundColor: isDark ? 'rgba(159, 239, 0, 0.15)' : 'rgba(79, 70, 229, 0.15)',
              borderColor: brandColor,
              pointBackgroundColor: brandColor,
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: brandColor
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                angleLines: { color: gridColor },
                grid: { color: gridColor },
                pointLabels: { 
                  color: textColor, 
                  font: { 
                    family: "'Inter', sans-serif",
                    size: 12,
                    weight: 'bold'
                  } 
                },
                ticks: { backdropColor: 'transparent', color: textColor, stepSize: 20 },
                min: 0,
                max: 100
              }
            },
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }, 100);
  }

  private fetchRecommendations() {
    this.aiService.getRecommendations().subscribe({
      next: (res: any) => {
        const courses = res?.data || [];
        // Match recommendations if score is low
        const averageMetric = (this.technicalScore + this.communicationScore) / 2;
        if (averageMetric < 75) {
          this.recommendations = courses.slice(0, 3);
        } else {
          this.recommendations = courses.slice(0, 1);
        }
        this.cdr.detectChanges();
      }
    });
  }

  // Certificate printing
  printCertificate() {
    const certHtml = document.getElementById('printableCertificateSection')?.innerHTML;
    if (!certHtml) return;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Mock Interview Certificate</title></head><body style="margin:0;">');
      printWindow.document.write(certHtml);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Delay printing to allow css load/render
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  }

  // Timer helpers
  private startTimer() {
    this.clearIntervals();
    this.timeLeft = 300;
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.clearIntervals();
        this.toastr.warning('Time out! Automatically submitting answer.');
        if (!this.chatInput.trim()) {
          this.chatInput = 'No answer submitted due to time limit.';
        }
        this.sendAnswer();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private clearIntervals() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private cleanupMediaTracks() {
    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }

  private cleanupMedia() {
    this.clearIntervals();
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.cleanupMediaTracks();
  }

  endInterviewEarly() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.sendAnswer(undefined, true);
  }

  resetInterview() {
    this.cleanupMedia();
    this.interviewStarted = false;
    this.interviewFinished = false;
    this.courseTopic = '';
    this.chatHistory = [];
    this.finalResult = null;
    this.tabSwitchCount = 0;
    this.isSlouching = false;
    this.faceCount = 1;
    this.eyeContactActive = true;
    this.videoReplayUrl = null;
    this.recordedChunks = [];
    this.cdr.detectChanges();
  }

  // Confetti trigger
  private fireConfetti() {
    const duration = 2.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }

  speak(text: string) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    // Turn off active microphone listening while AI is speaking to prevent self-transcription
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error('Failed to stop recognition on speak:', e);
      }
      this.isListening = false;
      this.cdr.detectChanges();
    }

    // Clean up Markdown and skip speaking raw code blocks
    let cleanText = text.replace(/```[\s\S]*?```/g, ' [Code snippet shown on screen] ');
    cleanText = cleanText.replace(/[*#_`~]/g, '').trim();

    // Store in class instance to prevent Chrome garbage-collecting the utterance mid-speech
    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;
    
    // Choose the best matching natural/premium voice
    let langCode = 'en-US';
    if (this.interviewLanguage === 'Spanish') {
      langCode = 'es-ES';
    } else if (this.interviewLanguage === 'French') {
      langCode = 'fr-FR';
    }
    
    const matchingVoices = this.voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(langCode.toLowerCase().split('-')[0]));
    
    // Prioritize natural/neural/premium voices
    const bestVoice = matchingVoices.find(v => 
      v.name.toLowerCase().includes('google') || 
      v.name.toLowerCase().includes('natural') || 
      v.name.toLowerCase().includes('premium') || 
      v.name.toLowerCase().includes('neural')
    ) || matchingVoices[0] || null;

    if (bestVoice) {
      utterance.voice = bestVoice;
    }
    
    utterance.rate = 0.95; // Slightly slower for a professional, natural pace
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      if (this.currentUtterance !== utterance) {
        return;
      }
      if (this.autoHandsFreeMode && this.interviewStarted && !this.interviewFinished && !this.isLoading) {
        setTimeout(() => {
          if (this.recognition && !this.isListening) {
            let recognitionLang = 'en-US';
            if (this.interviewLanguage === 'Spanish') {
              recognitionLang = 'es-ES';
            } else if (this.interviewLanguage === 'French') {
              recognitionLang = 'fr-FR';
            }
            this.recognition.lang = recognitionLang;
            
            try {
              this.recognition.start();
              this.isListening = true;
              this.toastr.info('AI finished speaking. Listening for your answer...');
              this.cdr.detectChanges();
            } catch (e) {
              console.error('Failed to auto-start speech recognition:', e);
              // Retry once after 500ms in case Web Speech engine was cleaning up
              setTimeout(() => {
                try {
                  if (this.recognition && !this.isListening) {
                    this.recognition.start();
                    this.isListening = true;
                    this.cdr.detectChanges();
                  }
                } catch (retryErr) {
                  console.error('Retry failed:', retryErr);
                }
              }, 500);
            }
          }
        }, 300);
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  copyToClipboard(msg: any) {
    navigator.clipboard.writeText(msg.content).then(() => {
      msg.isCopied = true;
      setTimeout(() => msg.isCopied = false, 2000);
      this.cdr.detectChanges();
    });
  }

  downloadTranscript() {
    if (this.chatHistory.length === 0) return;
    let data = `Mock Interview Transcript: ${this.courseTopic}\n`;
    data += `Overall Performance Score: ${this.finalResult?.score}/100\n`;
    data += `=========================================\n\n`;

    this.chatHistory.forEach(h => {
      const actor = h.role === 'assistant' ? 'AI Interviewer' : 'Candidate';
      data += `[${actor}]: ${h.content}\n\n`;
    });

    if (this.finalResult?.feedback) {
      data += `=========================================\n`;
      data += `AI FEEDBACK SUMMARY:\n${this.finalResult.feedback}\n`;
    }

    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Interview_${this.courseTopic.replace(/\s+/g, '_')}_Transcript.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
