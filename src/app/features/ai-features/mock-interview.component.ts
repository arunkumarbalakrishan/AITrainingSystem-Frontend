import { Component, inject, ViewChild, ElementRef, AfterViewChecked, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AIService } from '../../core/services/ai.service';
import { ToastrService } from 'ngx-toastr';
import confetti from 'canvas-confetti';

@Component({
  selector: 'app-mock-interview',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="container-fluid py-4 h-100 d-flex flex-column" style="max-height: 90vh;">
      <div class="row mb-3">
        <div class="col">
          <h2 class="fw-bold mb-1">AI Mock Interview</h2>
          <p class="text-muted">Practice your technical interview skills with our AI instructor.</p>
        </div>
      </div>

      <!-- Setup Phase -->
      <div
        class="row justify-content-center flex-grow-1 align-items-center"
        *ngIf="!interviewStarted"
      >
        <div class="col-md-6 col-lg-5">
          <div class="card premium-card shadow border-0">
            <div class="card-body p-3 p-sm-4 p-md-5 text-center">
              <div class="mb-4">
                <div
                  class="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle empty-icon"
                  style="width: 80px; height: 80px;"
                >
                  <i class="bi bi-mic-fill fs-1"></i>
                </div>
              </div>
              <h4 class="fw-bold mb-3">Start an Interview</h4>
              <p class="text-muted mb-4">What topic would you like to be interviewed on today?</p>

              <div class="mb-4">
                <input
                  type="text"
                  class="form-control form-control-lg text-center topic-input shadow-sm py-3"
                  [(ngModel)]="courseTopic"
                  placeholder="e.g. React.js, C# Backend, Python..."
                  (keyup.enter)="startInterview()"
                />
              </div>

              <button
                class="btn btn-primary w-100 fw-bold shadow-sm hover-lift py-3"
                style="border-radius: 12px; font-size: 1.1rem;"
                (click)="startInterview()"
                [disabled]="!courseTopic.trim() || isLoading"
              >
                <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2"></span>
                Start Interview
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Interview Chat Phase -->
      <div
        class="row flex-grow-1 d-flex flex-column"
        *ngIf="interviewStarted && !interviewFinished"
      >
        <div class="col-md-8 mx-auto d-flex flex-column">
          <div class="card premium-card shadow-sm border-0 d-flex flex-column" style="height: 75vh;">
            <div
              class="card-header py-3 border-bottom d-flex justify-content-between align-items-center"
              style="background: transparent;"
            >
              <div>
                <h5 class="mb-0 fw-bold">
                  Interviewing: <span class="text-primary">{{ courseTopic }}</span>
                </h5>
              </div>
              <button class="btn btn-outline-danger btn-sm" (click)="endInterviewEarly()">
                End Early
              </button>
            </div>

            <div class="card-body chat-messages overflow-auto p-4" #chatScroll>
              <div
                *ngFor="let msg of chatHistory"
                class="message-wrapper d-flex mb-4"
                [ngClass]="{ 'justify-content-end': msg.role === 'user' }"
              >
                <div class="avatar me-3" *ngIf="msg.role === 'assistant'">
                  <div
                    class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style="width: 40px; height: 40px;"
                  >
                    <i class="bi bi-robot"></i>
                  </div>
                </div>

                <div
                  class="message-bubble p-3 shadow-sm"
                  [ngClass]="
                    msg.role === 'user'
                      ? 'bg-primary text-white text-end rounded-4 rounded-bottom-0'
                      : 'assistant-bubble rounded-4 rounded-top-0 shadow-sm'
                  "
                >
                  <markdown
                    [data]="msg.content"
                    class="markdown-body mb-0"
                    *ngIf="msg.role === 'assistant'"
                  ></markdown>
                  <div
                    *ngIf="msg.role === 'assistant'"
                    class="d-flex gap-3 mt-2 pt-1 border-top border-secondary-subtle"
                    style="opacity: 0.8;"
                  >
                    <button
                      class="btn btn-sm btn-link text-primary p-0 d-flex align-items-center gap-1"
                      style="text-decoration: none;"
                      (click)="speak(msg.content)"
                      title="Read aloud"
                    >
                      <i class="bi bi-volume-up-fill" style="font-size: 0.85rem;"></i>
                      <span style="font-size: 0.72rem; font-weight: 500;">Listen</span>
                    </button>
                    <button
                      class="btn btn-sm btn-link text-primary p-0 d-flex align-items-center gap-1"
                      style="text-decoration: none;"
                      (click)="copyToClipboard(msg)"
                      title="Copy to clipboard"
                    >
                      <i
                        class="bi"
                        [ngClass]="msg.isCopied ? 'bi-check2-all text-success' : 'bi-clipboard'"
                        style="font-size: 0.85rem;"
                      ></i>
                      <span
                        [ngClass]="msg.isCopied ? 'text-success' : ''"
                        style="font-size: 0.72rem; font-weight: 500;"
                        >{{ msg.isCopied ? 'Copied!' : 'Copy' }}</span
                      >
                    </button>
                  </div>
                  <p class="mb-0" style="white-space: pre-wrap;" *ngIf="msg.role === 'user'">
                    {{ msg.content }}
                  </p>
                </div>

                <div class="avatar ms-3" *ngIf="msg.role === 'user'">
                  <div
                    class="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style="width: 40px; height: 40px;"
                  >
                    U
                  </div>
                </div>
              </div>

              <!-- Loading Indicator -->
              <div *ngIf="isLoading" class="message-wrapper d-flex mb-4">
                <div class="avatar me-3">
                  <div
                    class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style="width: 40px; height: 40px;"
                  >
                    <i class="bi bi-robot"></i>
                  </div>
                </div>
                <div
                  class="message-bubble p-3 assistant-bubble rounded-4 rounded-top-0 shadow-sm d-flex align-items-center"
                >
                  <div class="typing-indicator p-0 m-0 text-primary">
                    <div class="typing-dot" style="background: currentColor;"></div>
                    <div class="typing-dot" style="background: currentColor;"></div>
                    <div class="typing-dot" style="background: currentColor;"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card-footer p-3 border-top" style="background: transparent;">
              <div class="d-flex align-items-center gap-2">
                <!-- Microphone Button -->
                <button
                  class="btn d-flex align-items-center justify-content-center flex-shrink-0"
                  [ngClass]="isListening ? 'btn-danger pulse-animation' : 'btn-light border'"
                  (click)="toggleListening()"
                  [disabled]="isLoading"
                  [title]="isListening ? 'Stop listening' : 'Start speaking'"
                  style="width: 48px; height: 48px; border-radius: 24px; transition: all 0.2s;"
                >
                  <i
                    class="bi"
                    [ngClass]="isListening ? 'bi-mic-fill text-white' : 'bi-mic text-primary'"
                    style="font-size: 1.25rem;"
                  ></i>
                </button>

                <!-- Modern Input Box Wrapper -->
                <div class="input-box-wrapper d-flex align-items-center flex-grow-1 shadow-sm px-2 py-1">
                  <textarea
                    class="form-control chat-textarea border-0 shadow-none bg-transparent"
                    [(ngModel)]="chatInput"
                    (keyup.enter)="sendAnswer($event)"
                    placeholder="Type your answer here..."
                    rows="1"
                    [disabled]="isLoading"
                    style="resize: none; padding: 10px 12px; font-size: 0.95rem; color: var(--text-dark); min-height: 40px; max-height: 120px; line-height: 1.4; outline: none; flex: 1; width: 100%;"
                  ></textarea>
                  
                  <!-- Modern Send Button -->
                  <button
                    class="btn btn-send-modern d-flex align-items-center justify-content-center flex-shrink-0 ms-1"
                    (click)="sendAnswer()"
                    [disabled]="!chatInput.trim() || isLoading"
                    style="width: 36px; height: 36px; border-radius: 18px; background: var(--primary-color); border: none; color: white;"
                  >
                    <i class="bi bi-arrow-up-short" style="font-size: 1.6rem; line-height: 1;"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Phase -->
      <div class="row justify-content-center mt-3 mt-sm-5" *ngIf="interviewFinished">
        <div class="col-md-8 col-lg-6">
          <div class="card premium-card shadow border-0 overflow-hidden">
            <div class="bg-primary text-white text-center py-4 py-sm-5">
              <i class="bi bi-award display-1 mb-2 mb-sm-3"></i>
              <h2 class="fw-bold">Interview Completed</h2>
              <p class="mb-0 fs-5 opacity-75">Topic: {{ courseTopic }}</p>
            </div>

            <div class="card-body p-3 p-sm-4 p-md-5">
              <div class="text-center mb-5">
                <h5 class="text-uppercase text-muted fw-bold mb-3">Your Final Score</h5>
                <div
                  class="display-3 fw-bold"
                  [ngClass]="finalResult?.score >= 70 ? 'text-success' : 'text-warning'"
                >
                  {{ finalResult?.score || 0 }}<span class="fs-4 text-muted">/100</span>
                </div>
              </div>

              <h5 class="fw-bold mb-3">
                <i class="bi bi-chat-quote text-primary me-2"></i>Detailed Feedback
              </h5>
              <div class="p-4 assistant-bubble rounded-3 fs-6" style="line-height: 1.7;">
                <markdown [data]="finalResult?.feedback" class="markdown-body"></markdown>
              </div>

              <div class="mt-5 text-center d-flex gap-3 justify-content-center flex-wrap">
                <button
                  class="btn btn-primary px-4 py-2 fw-semibold shadow-sm hover-lift"
                  (click)="downloadTranscript()"
                >
                  <i class="bi bi-download me-2"></i>Download Transcript
                </button>
                <button
                  class="btn btn-outline-primary px-4 py-2 fw-semibold hover-lift"
                  (click)="resetInterview()"
                >
                  Start Another Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .message-bubble {
        max-width: 75%;
        font-size: 1.05rem;
        line-height: 1.5;
      }
      .assistant-bubble {
        background: var(--card-bg-hover);
        color: var(--text-dark);
        border: 1px solid var(--border-color);
      }
      .assistant-bubble .markdown-body,
      .assistant-bubble p,
      .assistant-bubble span {
        color: var(--text-dark) !important;
      }
      .topic-input {
        border: 2px solid rgba(0, 0, 0, 0.08);
        border-radius: 16px;
        transition: all 0.3s;
      }
      .topic-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.15);
        outline: none;
      }
      .input-box-wrapper {
        background: var(--card-bg-hover);
        border: 2px solid var(--border-color);
        border-radius: 24px;
        transition: all 0.3s ease;
      }
      .input-box-wrapper:focus-within {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.15) !important;
        background: var(--card-bg);
      }
      .btn-send-modern {
        transition: all 0.2s ease;
      }
      .btn-send-modern:hover:not([disabled]) {
        transform: scale(1.08);
      }
      .btn-send-modern:disabled {
        opacity: 0.4;
        background: #64748b !important;
      }
      .hover-lift {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .hover-lift:hover:not([disabled]) {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(132, 204, 22, 0.25) !important;
      }
      .empty-icon {
        animation: float 6s ease-in-out infinite;
      }
      @keyframes float {
        0% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-10px);
        }
        100% {
          transform: translateY(0px);
        }
      }
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.2);
        border-radius: 10px;
      }
      .chat-messages:hover::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.4);
      }
      /* Fix text alignment in markdown bubbles */
      .markdown-body p:last-child {
        margin-bottom: 0 !important;
      }
      .pulse-animation {
        animation: pulse 1.5s infinite;
      }
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
        }
      }
      @media (max-width: 576px) {
        .message-bubble {
          max-width: 85% !important;
          font-size: 0.95rem !important;
        }
        .card-body.chat-messages {
          padding: 1rem !important;
        }
        .card-footer.p-3 {
          padding: 0.75rem !important;
        }
        .chat-textarea {
          font-size: 0.88rem !important;
          padding: 8px 6px !important;
        }
        .btn-send-modern {
          width: 32px !important;
          height: 32px !important;
        }
        .container-fluid.py-4 {
          padding-top: 0.5rem !important;
          padding-bottom: 0.5rem !important;
        }
      }
    `,
  ],
})
export class MockInterviewComponent implements AfterViewChecked, OnInit {
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  courseTopic = '';
  interviewStarted = false;
  interviewFinished = false;
  isLoading = false;

  chatHistory: { role: string; content: string; isCopied?: boolean }[] = [];
  chatInput = '';

  finalResult: any = null;

  isListening = false;
  private recognition: any;

  ngOnInit() {
    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = false; // Set to false to only append final transcribed sentences
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          this.chatInput += (this.chatInput ? ' ' : '') + finalTranscript.trim();
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        this.isListening = false;
        if (event.error !== 'no-speech') {
          this.toastr.error('Microphone error: ' + event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  toggleListening() {
    if (!this.recognition) {
      this.toastr.warning('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    } else {
      this.recognition.start();
      this.isListening = true;
      this.toastr.info('Listening... speak your answer clearly.');
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop =
          this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {}
  }

  startInterview() {
    if (!this.courseTopic.trim()) return;

    this.interviewStarted = true;
    this.chatHistory = [];
    this.cdr.detectChanges();
    this.processTurn(null); // Send initial prompt to backend to get the first question
  }

  speak(text: string) {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel(); // Stop any currently playing speech

    // Strip markdown formatting (bold, italic, code, headers)
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  copyToClipboard(msg: any) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(msg.content).then(() => {
      msg.isCopied = true;
      setTimeout(() => (msg.isCopied = false), 2000);
    });
  }

  sendAnswer(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.chatInput.trim() || this.isLoading) return;

    const answer = this.chatInput.trim();
    this.chatHistory.push({ role: 'user', content: answer });
    this.chatInput = '';
    this.cdr.detectChanges();

    this.processTurn(answer);
  }

  private processTurn(studentAnswer: string | null) {
    this.isLoading = true;
    this.cdr.detectChanges();

    // We send the current history *before* the AI responds
    this.aiService.mockInterviewStep(this.courseTopic, studentAnswer, this.chatHistory).subscribe({
      next: (res: any) => {
        const result = res?.data;
        this.isLoading = false;

        if (!result) {
          this.toastr.error('Received empty response from server.');
          this.cdr.detectChanges();
          return;
        }

        if (result.isFinished) {
          this.interviewFinished = true;
          this.finalResult = result;
          this.toastr.success('Mock Interview Completed!');

          // Trigger confetti if score is >= 80
          if (this.finalResult.score >= 80) {
            this.fireConfetti();
          }
        } else {
          this.chatHistory.push({ role: 'assistant', content: result.nextQuestionOrFeedback });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Mock interview API error:', err);
        this.isLoading = false;
        this.toastr.error('Failed to communicate with AI. Please try again.');
        // Allow user to retry
        if (studentAnswer) {
          this.chatHistory.pop();
          this.chatInput = studentAnswer;
        }
        this.cdr.detectChanges();
      },
    });
  }

  private fireConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#84cc16', '#06b6d4', '#f472b6'],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#84cc16', '#06b6d4', '#f472b6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }

  endInterviewEarly() {
    this.processTurn('I want to end the interview early.');
  }

  resetInterview() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
    this.interviewStarted = false;
    this.interviewFinished = false;
    this.courseTopic = '';
    this.chatHistory = [];
    this.finalResult = null;
    this.cdr.detectChanges();
  }

  downloadTranscript() {
    if (!this.chatHistory || this.chatHistory.length === 0) return;

    let transcript = `Mock Interview Transcript: ${this.courseTopic}\n`;
    transcript += `Date: ${new Date().toLocaleDateString()}\n`;
    transcript += `Score: ${this.finalResult?.score || 'N/A'}/100\n`;
    transcript += `-------------------------------------------------\n\n`;

    for (const msg of this.chatHistory) {
      const role = msg.role === 'assistant' ? 'AI Instructor' : 'You';
      transcript += `[${role}]:\n${msg.content}\n\n`;
    }

    if (this.finalResult?.feedback) {
      transcript += `-------------------------------------------------\n`;
      transcript += `[Final Feedback]:\n${this.finalResult.feedback}\n`;
    }

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mock_Interview_${this.courseTopic.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }
}
