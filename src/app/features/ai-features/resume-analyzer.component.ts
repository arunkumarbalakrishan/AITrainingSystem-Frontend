import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AIService } from '../../core/services/ai.service';
import { ToastrService } from 'ngx-toastr';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

@Component({
  selector: 'app-resume-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row mb-4 align-items-center">
        <div class="col">
          <h2 class="fw-bold mb-1">AI Resume Analyzer</h2>
          <p class="text-muted">
            Paste your resume text to get an AI-powered critique and course recommendations.
          </p>
        </div>
      </div>

      <div class="row">
        <!-- Input Area -->
        <div class="col-lg-6 mb-4">
          <div class="card premium-card shadow-sm border-0 h-100">
            <div
              class="card-header border-bottom-0 pt-4 pb-0 d-flex justify-content-between align-items-center"
              style="background: transparent;"
            >
              <h5 class="fw-bold mb-0">
                <i class="bi bi-file-text text-primary me-2"></i>Resume Content
              </h5>
            </div>
            <div class="card-body d-flex flex-column">
              <!-- Drag and Drop Zone -->
              <div
                class="dropzone-container mb-3 position-relative d-flex flex-column flex-grow-1"
                [class.drag-active]="isDragging"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
              >
                <input
                  type="file"
                  #fileInput
                  class="d-none"
                  accept=".pdf,.txt"
                  (change)="onFileSelected($event)"
                />

                <div
                  class="dropzone-overlay d-flex flex-column align-items-center justify-content-center"
                  *ngIf="!resumeText && !isLoading"
                >
                  <i
                    class="bi bi-cloud-arrow-up display-4 text-primary mb-2"
                    (click)="fileInput.click()"
                    style="cursor: pointer;"
                  ></i>
                  <h5 class="fw-bold mb-1 text-center">Drag & Drop Resume</h5>
                  <p class="text-muted small mb-3 text-center px-4">
                    Click the button to browse, or click anywhere to paste text.
                  </p>
                  <button
                    type="button"
                    class="btn btn-primary btn-sm px-4 rounded-pill shadow-sm"
                    (click)="fileInput.click()"
                  >
                    Browse Files
                  </button>
                </div>

                <textarea
                  [(ngModel)]="resumeText"
                  class="form-control resume-textarea flex-grow-1"
                  [class.has-content]="resumeText.length > 0"
                  placeholder="Paste your resume content here..."
                  [disabled]="isLoading"
                ></textarea>

                <button
                  *ngIf="resumeText"
                  type="button"
                  class="btn btn-sm btn-light upload-different-btn shadow-sm"
                  (click)="fileInput.click()"
                  [disabled]="isLoading"
                >
                  <i class="bi bi-upload me-1"></i> Upload Different File
                </button>
              </div>

              <button
                class="btn btn-primary w-100 py-3 fw-bold d-flex justify-content-center align-items-center shadow-sm hover-lift mt-auto"
                style="border-radius: 12px; font-size: 1.05rem;"
                (click)="analyzeResume()"
                [disabled]="!resumeText.trim() || isLoading"
              >
                <div *ngIf="isLoading" class="typing-indicator me-2 py-0">
                  <div class="typing-dot" style="background: currentColor;"></div>
                  <div class="typing-dot" style="background: currentColor;"></div>
                  <div class="typing-dot" style="background: currentColor;"></div>
                </div>
                {{ isLoading ? 'Analyzing Resume...' : 'Analyze Resume' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Results Area -->
        <div class="col-lg-6 mb-4">
          <div class="card premium-card shadow-sm border-0 h-100" *ngIf="!result && !isLoading">
            <div
              class="card-body d-flex flex-column align-items-center justify-content-center text-center p-3 p-sm-5 text-muted"
            >
              <i
                class="bi bi-file-earmark-person display-1 mb-4 opacity-75 empty-icon"
                style="color: var(--primary-color);"
              ></i>
              <h4>Ready to Analyze</h4>
              <p>
                Paste your resume on the left and click Analyze to see your personalized feedback.
              </p>
            </div>
          </div>

          <div class="card premium-card shadow-sm border-0 h-100" *ngIf="result">
            <div
              class="card-header pt-4 pb-0 border-bottom-0 d-flex justify-content-between align-items-center"
              style="background: transparent;"
            >
              <h5 class="fw-bold mb-0">Analysis Results</h5>
              <span class="badge" [ngClass]="getScoreClass(result.matchScore)"
                >Score: {{ result.matchScore }}/100</span
              >
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="fw-bold text-uppercase text-muted small mb-2">AI Critique</h6>
                <div class="p-3 rounded analysis-panel">
                  <markdown [data]="result.critique" class="markdown-body"></markdown>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <h6 class="fw-bold text-uppercase text-muted small mb-2">Strengths</h6>
                  <div class="p-3 rounded h-100 analysis-panel">
                    <ul class="list-group list-group-flush mb-0">
                      <li
                        class="list-group-item bg-transparent px-0 border-0 py-1"
                        *ngFor="let strength of result.skillsStrengths"
                      >
                        <i class="bi bi-check-circle-fill text-success me-2"></i>{{ strength }}
                      </li>
                    </ul>
                    <div *ngIf="!result.skillsStrengths?.length" class="text-muted small">
                      No specific strengths identified.
                    </div>
                  </div>
                </div>
                <div class="col-md-6 mb-3">
                  <h6 class="fw-bold text-uppercase text-muted small mb-2">Suggested Courses</h6>
                  <div class="p-3 rounded h-100 analysis-panel">
                    <ul class="list-group list-group-flush mb-0">
                      <li
                        class="list-group-item bg-transparent px-0 border-0 py-1"
                        *ngFor="let course of result.suggestedCourses"
                      >
                        <i class="bi bi-book text-primary me-2"></i>{{ course }}
                      </li>
                    </ul>
                    <div *ngIf="!result.suggestedCourses?.length" class="text-muted small">
                      No courses suggested.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .analysis-panel {
        background: var(--card-bg-hover);
        color: var(--text-dark);
        border: 1px solid var(--border-color);
      }
      .analysis-panel .markdown-body,
      .analysis-panel p,
      .analysis-panel li {
        color: var(--text-dark) !important;
      }
      .resume-textarea {
        min-height: 450px;
        height: 100%;
        resize: none;
        font-size: 0.95rem;
        line-height: 1.6;
        background-color: transparent;
        color: var(--text-dark);
        border: none;
        padding: 20px;
        transition: all 0.3s ease;
        position: relative;
        z-index: 2;
      }
      .resume-textarea:focus {
        background-color: transparent;
        color: var(--text-dark);
        box-shadow: none;
        outline: none;
      }
      .resume-textarea:not(.has-content) {
        color: transparent; /* Hide placeholder when overlay is visible */
      }
      .dropzone-container {
        min-height: 450px;
        border: 2px dashed rgba(0, 0, 0, 0.15);
        border-radius: 16px;
        background-color: var(--background-color);
        transition: all 0.3s ease;
        overflow: hidden;
      }
      .upload-different-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 10;
      }
      @media (max-width: 576px) {
        .resume-textarea {
          min-height: 250px !important;
          padding: 12px !important;
        }
        .dropzone-container {
          min-height: 250px !important;
        }
        .upload-different-btn {
          position: static !important;
          margin: 10px !important;
          align-self: flex-start;
          width: calc(100% - 20px) !important;
          text-align: center;
        }
        .card-header.pt-4 {
          padding-top: 1rem !important;
        }
        .card-body.p-5 {
          padding: 1.5rem !important;
        }
      }
      .dropzone-container:focus-within {
        border-color: var(--primary-color);
        border-style: solid;
        box-shadow: 0 0 0 4px rgba(132, 204, 22, 0.15);
      }
      .dropzone-container.drag-active {
        border-color: var(--primary-color);
        background-color: rgba(132, 204, 22, 0.05);
        transform: scale(1.02);
        box-shadow: 0 10px 25px rgba(132, 204, 22, 0.25);
      }
      .dropzone-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3;
        pointer-events: none;
      }
      .dropzone-overlay button,
      .dropzone-overlay i {
        pointer-events: auto;
      }
      .dropzone-container.drag-active .dropzone-overlay {
        pointer-events: none;
      }
      .has-content + .dropzone-overlay {
        display: none !important;
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
    `,
  ],
})
export class ResumeAnalyzerComponent {
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);

  resumeText = '';
  isLoading = false;
  isDragging = false;
  result: any = null;

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      await this.processFile(file);
    }
    event.target.value = '';
  }

  private async processFile(file: File) {
    this.isLoading = true;
    this.toastr.info('Reading file...', 'Please wait');

    try {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        this.resumeText = await this.extractTextFromPdf(file);
        this.toastr.success('PDF text extracted successfully!');
      } else {
        // Assume text file
        const text = await file.text();
        this.resumeText = text;
        this.toastr.success('Text file loaded successfully!');
      }
    } catch (error: any) {
      console.error('Error reading file:', error);
      this.resumeText =
        'ERROR DETAILS:\n' + (error.message || error.toString() || JSON.stringify(error));
      this.toastr.error('Failed to read the file. See text area for details.');
    } finally {
      this.isLoading = false;
    }
  }

  private async extractTextFromPdf(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    return fullText;
  }

  analyzeResume() {
    if (!this.resumeText.trim()) return;

    this.isLoading = true;
    this.result = null;

    this.aiService.analyzeResume(this.resumeText).subscribe({
      next: (res: any) => {
        this.result = res.data;
        this.isLoading = false;
        this.toastr.success('Resume analyzed successfully!');
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to analyze resume. Please try again.');
      },
    });
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-warning text-dark';
    return 'bg-danger';
  }
}
