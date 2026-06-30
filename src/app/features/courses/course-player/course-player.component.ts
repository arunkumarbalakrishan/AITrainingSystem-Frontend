import { Component, OnInit, inject, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { ProgressService } from '../../../core/services/progress.service';
import { QuizService } from '../../../core/services/quiz.service';
import { ToastrService } from 'ngx-toastr';
import { API_CONFIG } from '../../../core/config/api-config';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-fade-in">
      <!-- Header & Controls -->
      <div class="d-flex justify-content-between align-items-center mb-3">
        <a
          routerLink="/my-courses"
          class="btn btn-sm btn-light d-inline-flex align-items-center gap-1"
          style="border-radius: var(--border-radius-sm);"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          My Courses
        </a>

        <div class="d-flex gap-2">
          <button
            class="btn btn-sm d-none d-md-inline-block"
            [class.btn-dark]="!isTheaterMode"
            [class.btn-light]="isTheaterMode"
            (click)="toggleTheaterMode()"
            style="border-radius: 20px;"
          >
            <i
              class="bi"
              [class.bi-display]="!isTheaterMode"
              [class.bi-display-fill]="isTheaterMode"
            ></i>
            {{ isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode' }}
          </button>
          <button
            class="btn btn-sm btn-outline-secondary"
            (click)="toggleSidebar()"
            style="border-radius: 20px;"
          >
            <i
              class="bi"
              [class.bi-layout-sidebar-inset]="!isSidebarCollapsed"
              [class.bi-layout-sidebar]="isSidebarCollapsed"
            ></i>
            {{ isSidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar' }}
          </button>
        </div>
      </div>

      <div class="row g-4">
        <!-- Video / Lesson Content Area -->
        <div [class]="isSidebarCollapsed ? 'col-12' : 'col-lg-8'">
          <div *ngIf="currentLesson">
            <div
              class="premium-card p-0 overflow-hidden mb-3"
              [style.background]="isTheaterMode ? '#000' : 'var(--card-bg)'"
            >
              <!-- Video Player -->
              <div
                *ngIf="currentLesson.videoUrl"
                style="position: relative; padding-top: 56.25%; background: #000;"
              >
                <video
                  #videoPlayer
                  controls
                  [src]="secureVideoUrl"
                  (timeupdate)="onTimeUpdate($event)"
                  (pause)="onVideoPaused($event)"
                  (ended)="onVideoEnded($event)"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
                ></video>
              </div>
              <!-- No video fallback -->
              <div
                *ngIf="!currentLesson.videoUrl"
                class="d-flex align-items-center justify-content-center"
                style="height: 360px; background: linear-gradient(135deg, #1e1b4b, #312e81);"
              >
                <div class="text-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                    class="mb-2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                    />
                  </svg>
                  <h5>{{ currentLesson.title || 'Select a lesson' }}</h5>
                  <small class="opacity-75">Reading material — no video available</small>
                </div>
              </div>
            </div>

            <!-- Lesson Info -->
            <div class="premium-card p-4 mb-3">
              <h4 class="fw-bold mb-2">{{ currentLesson.title }}</h4>
              <p class="text-muted" style="line-height: 1.7;">
                {{ currentLesson.content || currentLesson.description || 'No content available.' }}
              </p>

              <div class="d-flex gap-2 mt-3">
                <button
                  (click)="markComplete()"
                  class="btn btn-premium px-4"
                  [disabled]="currentLesson.isCompleted"
                >
                  {{ currentLesson.isCompleted ? '✓ Completed' : 'Mark as Complete' }}
                </button>
              </div>
            </div>

            <!-- Notes Section removed from bottom, moved to tabbed sidebar -->
          </div>

          <!-- Quiz View Area -->
          <div *ngIf="currentQuiz" class="animate-fade-in">
            <div
              class="premium-card p-5 mb-3 text-center"
              style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white;"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                class="mb-3 opacity-75"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 class="fw-bold mb-2">{{ currentQuiz.title }}</h2>
              <p class="mb-0 opacity-75">
                {{ currentQuiz.description || 'Test your knowledge on the concepts covered.' }}
              </p>
              <div
                class="mt-4 badge bg-white text-primary px-3 py-2"
                style="font-size: 0.9rem; border-radius: 20px;"
              >
                Passing Score: {{ currentQuiz.passingScore }}%
              </div>
            </div>

            <!-- Quiz Result Alert -->
            <div
              *ngIf="quizResult"
              class="premium-card p-4 mb-4 text-center border-0"
              [ngClass]="quizResult.isPassed ? 'quiz-result-pass' : 'quiz-result-fail'"
            >
              <h3 class="fw-bold mb-2 result-title">
                {{ quizResult.isPassed ? 'Congratulations! You Passed!' : 'You Did Not Pass' }}
              </h3>
              <p class="mb-0 result-score">
                Your AI Auto-Evaluated Score: <strong>{{ quizResult.score }}%</strong>
              </p>
              <button
                *ngIf="!quizResult.isPassed"
                class="btn btn-outline-danger mt-3 px-4"
                style="border-radius: 20px;"
                (click)="retakeQuiz()"
              >
                Retake Quiz
              </button>
            </div>

            <!-- Quiz Questions Form -->
            <div *ngIf="!quizResult" class="premium-card p-4">
              <div *ngFor="let question of currentQuiz.questions; let qIndex = index" class="mb-5">
                <h5 class="fw-bold mb-3 d-flex gap-2">
                  <span class="text-primary">{{ qIndex + 1 }}.</span> {{ question.text }}
                </h5>
                <div class="ps-4">
                  <div
                    *ngFor="let option of question.options; let oIndex = index"
                    class="form-check custom-radio mb-2 p-3 rounded"
                    style="border: 1px solid var(--border-color); cursor: pointer; transition: all 0.2s;"
                    [class.bg-light]="quizAnswers[question.id] === option.id"
                    (click)="quizAnswers[question.id] = option.id"
                  >
                    <input
                      class="form-check-input ms-0 mt-1"
                      type="radio"
                      [name]="'question_' + question.id"
                      [id]="'option_' + option.id"
                      [value]="option.id"
                      [(ngModel)]="quizAnswers[question.id]"
                    />
                    <label
                      class="form-check-label ms-2 d-block w-100"
                      [for]="'option_' + option.id"
                      style="cursor: pointer;"
                    >
                      {{ option.optionText }}
                    </label>
                  </div>
                </div>
              </div>

              <hr class="my-4" />
              <div class="d-flex justify-content-end">
                <button
                  class="btn btn-premium px-5 py-2"
                  [disabled]="!isQuizReadyToSubmit()"
                  (click)="submitQuiz()"
                >
                  Submit Answers
                </button>
              </div>
            </div>
          </div>
        </div>
        <!-- Sidebar: Curriculum & Notes Tabs -->
        <div class="col-lg-4" *ngIf="!isSidebarCollapsed">
          <div
            class="premium-card p-3 position-sticky curriculum-scroll"
            style="top: 20px; max-height: calc(100vh - 40px); overflow-y: auto;"
          >
            <!-- Sidebar Tabs -->
            <ul
              class="nav nav-pills mb-3"
              style="background: rgba(0,0,0,0.03); border-radius: 12px; padding: 4px; gap: 4px;"
            >
              <li class="nav-item flex-grow-1" style="list-style: none;">
                <button
                  class="nav-link w-100 fw-bold py-2 border-0 text-center"
                  [style.background]="
                    activeSidebarTab === 'curriculum' ? 'var(--primary-color)' : 'transparent'
                  "
                  [style.color]="activeSidebarTab === 'curriculum' ? '#fff' : '#64748b'"
                  style="border-radius: 8px; font-size: 0.85rem; transition: all 0.2s;"
                  (click)="activeSidebarTab = 'curriculum'"
                >
                  <i class="bi bi-journal-text me-1"></i> Curriculum
                </button>
              </li>
              <li class="nav-item flex-grow-1" style="list-style: none;">
                <button
                  class="nav-link w-100 fw-bold py-2 border-0 text-center"
                  [style.background]="
                    activeSidebarTab === 'notes' ? 'var(--primary-color)' : 'transparent'
                  "
                  [style.color]="activeSidebarTab === 'notes' ? '#fff' : '#64748b'"
                  style="border-radius: 8px; font-size: 0.85rem; transition: all 0.2s;"
                  (click)="activeSidebarTab = 'notes'"
                >
                  <i class="bi bi-pencil-square me-1"></i> My Notes
                </button>
              </li>
            </ul>

            <!-- Curriculum Tab Content -->
            <div *ngIf="activeSidebarTab === 'curriculum'">
              <h6 class="fw-bold mb-3 px-1">Curriculum</h6>
              <div
                *ngFor="let lesson of lessons; let i = index"
                (click)="selectLesson(lesson)"
                class="d-flex align-items-center gap-3 p-2 rounded mb-2 lesson-item"
                [class.active-lesson]="currentLesson?.id === lesson.id"
                style="cursor: pointer; transition: all 0.2s;"
              >
                <div
                  class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  [style.background]="
                    lesson.isCompleted
                      ? '#dcfce7'
                      : currentLesson?.id === lesson.id
                        ? 'var(--primary-color)'
                        : '#f1f5f9'
                  "
                  [style.color]="
                    lesson.isCompleted
                      ? '#166534'
                      : currentLesson?.id === lesson.id
                        ? '#fff'
                        : '#64748b'
                  "
                  style="width: 32px; height: 32px; font-size: 0.8rem; font-weight: 600;"
                >
                  {{ lesson.isCompleted ? '✓' : i + 1 }}
                </div>
                <div class="flex-grow-1 min-width-0">
                  <div class="fw-semibold text-truncate" style="font-size: 0.85rem;">
                    {{ lesson.title }}
                  </div>
                  <small class="text-muted" style="font-size: 0.75rem;"
                    >{{ lesson.durationMinutes || 0 }} min</small
                  >
                </div>
              </div>

              <div *ngIf="lessons.length === 0" class="text-center text-muted py-4">
                No lessons found
              </div>

              <div *ngIf="quizzes && quizzes.length > 0" class="mt-4">
                <h5 class="fw-bold mb-3 d-flex align-items-center gap-2">
                  <i class="bi bi-ui-checks"></i> Assessments
                </h5>
                <div
                  *ngFor="let quiz of quizzes"
                  (click)="selectQuiz(quiz)"
                  class="d-flex align-items-center gap-3 p-3 rounded mb-2 lesson-item"
                  [class.active-lesson]="currentQuiz?.id === quiz.id"
                  style="cursor: pointer; transition: all 0.2s;"
                >
                  <div
                    class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    [style.background]="
                      currentQuiz?.id === quiz.id ? 'var(--primary-color)' : '#f1f5f9'
                    "
                    [style.color]="currentQuiz?.id === quiz.id ? '#fff' : '#64748b'"
                    style="width: 32px; height: 32px;"
                  >
                    <i class="bi bi-file-text-fill"></i>
                  </div>
                  <div class="flex-grow-1 min-width-0">
                    <div class="fw-semibold text-truncate" style="font-size: 0.85rem;">
                      {{ quiz.title }}
                    </div>
                    <small class="text-muted" style="font-size: 0.75rem;">
                      <span class="badge bg-light text-dark border">{{
                        quiz.isFinal ? 'Final Exam' : 'Quiz'
                      }}</span>
                    </small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes Tab Content -->
            <div *ngIf="activeSidebarTab === 'notes'">
              <h6 class="fw-bold mb-3 px-1">Lesson Notes</h6>
              <div *ngIf="!currentLesson" class="text-center text-muted py-4">
                Select a lesson to start taking notes.
              </div>

              <div *ngIf="currentLesson">
                <div class="mb-3">
                  <textarea
                    [(ngModel)]="newNote"
                    rows="5"
                    class="form-control custom-textarea"
                    placeholder="Type your personal notes here..."
                    style="border-radius: 12px; border: 2px solid rgba(0,0,0,0.08); padding: 12px; transition: all 0.2s; resize: none; font-size: 0.85rem;"
                  ></textarea>
                </div>
                <button
                  (click)="saveNote()"
                  class="btn btn-sm btn-premium w-100 py-2 fw-semibold"
                  [disabled]="!newNote.trim()"
                >
                  Save Note
                </button>

                <div class="mt-4">
                  <h6 class="fw-bold mb-3 px-1">Saved Notes ({{ notes.length }})</h6>
                  <div
                    *ngIf="notes.length === 0"
                    class="text-center text-muted py-3"
                    style="font-size: 0.85rem;"
                  >
                    No notes saved for this lesson yet.
                  </div>

                  <div
                    class="notes-list-scroll pe-1"
                    style="max-height: calc(100vh - 360px); overflow-y: auto;"
                  >
                    <div
                      class="p-3 rounded mb-3 border shadow-sm"
                      *ngFor="let note of notes"
                      style="background: var(--card-bg);"
                    >
                      <p
                        class="mb-2"
                        style="font-size: 0.85rem; line-height: 1.5; white-space: pre-wrap; color: var(--text-color);"
                      >
                        {{ note.content }}
                      </p>
                      <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted" style="font-size: 0.7rem;">
                          <i class="bi bi-clock me-1"></i>{{ note.createdAt | date: 'short' }}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Theater Mode Full Screen Dark Overlay -->
    <div
      *ngIf="isTheaterMode"
      style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.85); z-index: -1; pointer-events: none;"
    ></div>
  `,
  styles: [
    `
      .lesson-item {
        border: 1px solid transparent;
      }
      .lesson-item:hover {
        background: rgba(132, 204, 22, 0.08);
        transform: translateX(4px);
      }
      .active-lesson {
        background: rgba(132, 204, 22, 0.12) !important;
        border-color: rgba(132, 204, 22, 0.25);
      }
      .custom-textarea:focus {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 0 3px rgba(132, 204, 22, 0.2) !important;
        outline: none;
      }
      /* Custom Scrollbar for Sidebar */
      .curriculum-scroll::-webkit-scrollbar {
        width: 6px;
      }
      .curriculum-scroll::-webkit-scrollbar-track {
        background: transparent;
      }
      .curriculum-scroll::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 10px;
      }
      .curriculum-scroll:hover::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
      }
      @media (max-width: 991px) {
        .curriculum-scroll {
          position: static !important;
          max-height: none !important;
          overflow-y: visible !important;
        }
      }
    `,
  ],
})
export class CoursePlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private progressService = inject(ProgressService);
  private quizService = inject(QuizService);
  private toastr = inject(ToastrService);
  private sanitizer = inject(DomSanitizer);

  courseId = '';
  lessons: any[] = [];
  quizzes: any[] = [];
  currentLesson: any = null;
  currentQuiz: any = null;
  secureVideoUrl: SafeResourceUrl | string = '';
  notes: any[] = [];
  newNote = '';
  quizAnswers: { [questionId: string]: string } = {};
  quizResult: any = null;

  isTheaterMode = false;
  isSidebarCollapsed = false;
  activeSidebarTab = 'curriculum';
  videoProgressPercentage = 0;
  hasAutoCompleted = false;

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id')!;
    this.loadLessons();
  }

  loadLessons() {
    this.courseService.getLessons(this.courseId).subscribe({
      next: (res: any) => {
        this.lessons = res.data || res || [];

        this.progressService.getCompletedLessons(this.courseId).subscribe({
          next: (completedRes: any) => {
            const completedIds = completedRes.data || completedRes || [];
            this.lessons.forEach((l) => {
              l.isCompleted = completedIds.includes(l.id);
            });

            // Also fetch quizzes for the course
            this.quizService.getQuizzesByCourse(this.courseId).subscribe({
              next: (quizRes: any) => {
                this.quizzes = quizRes.data || quizRes || [];

                // Auto-select first lesson if available
                if (this.lessons.length > 0) {
                  this.selectLesson(this.lessons[0]);
                } else if (this.quizzes.length > 0) {
                  this.selectQuiz(this.quizzes[0]);
                }
              },
            });
          },
          error: () => {
            // Fallback in case of progress API error
            this.quizService.getQuizzesByCourse(this.courseId).subscribe({
              next: (quizRes: any) => {
                this.quizzes = quizRes.data || quizRes || [];
                if (this.lessons.length > 0) {
                  this.selectLesson(this.lessons[0]);
                } else if (this.quizzes.length > 0) {
                  this.selectQuiz(this.quizzes[0]);
                }
              },
            });
          },
        });
      },
    });
  }

  selectLesson(lesson: any) {
    this.currentLesson = lesson;
    this.currentQuiz = null; // Hide quiz view
    this.hasAutoCompleted = false;

    // Pre-compute the secure video URL to avoid infinite change detection loops
    if (lesson?.id) {
      const token = localStorage.getItem('access_token');
      const url = `${API_CONFIG.baseUrl}/Media/video/${lesson.id}?access_token=${token}`;
      this.secureVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    } else {
      this.secureVideoUrl = '';
    }

    this.newNote = '';
    this.loadNotes(lesson.id);
  }

  selectQuiz(quiz: any) {
    this.currentQuiz = quiz;
    this.currentLesson = null; // Hide lesson view
    this.quizAnswers = {};
    this.quizResult = null;
    this.secureVideoUrl = '';

    // Load existing result if available
    this.quizService.getUserResults().subscribe({
      next: (res: any) => {
        const results = res.data || res || [];
        // Find the best or latest result for this quiz
        const existingResult = results.find((r: any) => r.quizId === quiz.id);
        if (existingResult) {
          this.quizResult = existingResult;
        }
      },
    });
  }

  loadNotes(lessonId: string) {
    this.courseService.getNotesByLesson(lessonId).subscribe({
      next: (res: any) => {
        this.notes = res.data || res || [];
      },
      error: () => {
        this.notes = [];
      },
    });
  }

  onTimeUpdate(event: any) {
    const video = event.target;
    if (!this.currentLesson) return;

    // Update sticky progress bar percentage
    if (video.duration) {
      const percentage = (video.currentTime / video.duration) * 100;
      this.videoProgressPercentage = percentage;

      // Auto-complete if watched at least 90%
      if (percentage >= 90 && !this.currentLesson.isCompleted) {
        this.autoMarkComplete();
      }
    }

    // Throttle: save every 15 seconds
    const pos = Math.floor(video.currentTime);
    if (pos > 0 && pos % 15 === 0) {
      this.progressService.updateVideoProgress(this.currentLesson.id, pos).subscribe();
    }
  }

  onVideoEnded(event: any) {
    if (this.currentLesson && !this.currentLesson.isCompleted) {
      this.autoMarkComplete();
    }
  }

  onVideoPaused(event: any) {
    const video = event.target;
    if (!this.currentLesson) return;
    const pos = Math.floor(video.currentTime);
    if (pos > 0) {
      this.progressService.updateVideoProgress(this.currentLesson.id, pos).subscribe();
    }
  }

  autoMarkComplete() {
    if (!this.currentLesson || this.currentLesson.isCompleted || this.hasAutoCompleted) return;
    this.hasAutoCompleted = true;
    this.progressService.completeLesson(this.currentLesson.id).subscribe({
      next: () => {
        this.currentLesson.isCompleted = true;
        this.toastr.success('Lesson automatically completed! 🎉');
        // Update the lesson in the sidebar list
        const idx = this.lessons.findIndex((l) => l.id === this.currentLesson.id);
        if (idx >= 0) {
          this.lessons[idx].isCompleted = true;
        }
      },
    });
  }

  markComplete() {
    if (!this.currentLesson) return;
    this.progressService.completeLesson(this.currentLesson.id).subscribe({
      next: () => {
        this.currentLesson.isCompleted = true;
        this.toastr.success('Lesson marked as completed!');
        // Update the lesson in the sidebar list
        const idx = this.lessons.findIndex((l) => l.id === this.currentLesson.id);
        if (idx >= 0) {
          this.lessons[idx].isCompleted = true;
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to mark lesson as complete');
      },
    });
  }

  saveNote() {
    if (!this.newNote.trim() || !this.currentLesson) return;
    this.courseService
      .createNote({
        lessonId: this.currentLesson.id,
        content: this.newNote.trim(),
      })
      .subscribe({
        next: (res: any) => {
          this.toastr.success('Note saved!');
          this.notes.unshift(res.data || { content: this.newNote, createdAt: new Date() });
          this.newNote = '';
        },
        error: () => {
          this.toastr.error('Failed to save note');
        },
      });
  }

  isQuizReadyToSubmit(): boolean {
    if (!this.currentQuiz || !this.currentQuiz.questions) return false;
    return Object.keys(this.quizAnswers).length === this.currentQuiz.questions.length;
  }

  submitQuiz() {
    if (!this.currentQuiz) return;

    const answersArray = Object.keys(this.quizAnswers).map((questionId) => ({
      questionId,
      selectedOptionId: this.quizAnswers[questionId],
    }));

    this.quizService.submitQuiz(this.currentQuiz.id, answersArray).subscribe({
      next: (res: any) => {
        this.quizResult = res.data || res;
        if (this.quizResult.isPassed) {
          this.toastr.success(`Passed with ${this.quizResult.score}%!`);
        } else {
          this.toastr.warning(`Scored ${this.quizResult.score}%. Keep trying!`);
        }
      },
      error: (err: any) => {
        this.toastr.error(err.error?.message || 'Failed to submit quiz.');
      },
    });
  }

  retakeQuiz() {
    this.quizResult = null;
    this.quizAnswers = {};
  }

  toggleTheaterMode() {
    this.isTheaterMode = !this.isTheaterMode;
    if (this.isTheaterMode) {
      this.isSidebarCollapsed = true; // Auto-hide curriculum in theater mode
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
