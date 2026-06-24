import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="landing-body">
      <!-- Floating Navigation Header -->
      <header class="landing-header">
        <div class="landing-logo">
          <!-- Unique Spark Logo Icon -->
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            style="color: #9FEF00"
          >
            <path d="M 14 5 H 18 C 19.66 5 21 6.34 21 8 V 16 C 21 17.66 19.66 19 18 19 H 10 C 8.34 19 7 17.66 7 16 V 15" />
            <path d="M 9 3.5 Q 9 7 12.5 7 Q 9 7 9 10.5 Q 9 7 5.5 7 Q 9 7 9 3.5 Z" fill="#9FEF00" stroke="none" />
            <text x="14" y="14.5" text-anchor="middle" font-size="6.5" font-weight="900" font-family="sans-serif" fill="#ffffff" stroke="none">AI</text>
          </svg>
          AITraining <span>Lab</span>
        </div>

        <nav class="landing-nav d-none d-lg-flex">
          <a href="#" class="landing-nav-link text-decoration-none">Home</a>
          <a href="#features" class="landing-nav-link text-decoration-none">Features</a>
          <a href="#courses" class="landing-nav-link text-decoration-none">Courses</a>
          <a href="#pricing" class="landing-nav-link text-decoration-none">Subscribe</a>
          <a href="#newsletter" class="landing-nav-link text-decoration-none">Newsletter</a>
        </nav>

        <div class="landing-auth-buttons">
          <ng-container *ngIf="isAuthenticated(); else guestButtons">
            <span class="text-white-50 d-none d-md-inline-block me-2">Welcome back, <strong class="text-white">{{ getUserName() }}</strong></span>
            <a routerLink="/dashboard" class="landing-btn-register text-decoration-none">Go to Dashboard</a>
            <button (click)="logout()" class="landing-btn-login">Logout</button>
          </ng-container>
          <ng-template #guestButtons>
            <a routerLink="/login" class="landing-btn-login text-decoration-none">Login</a>
            <a routerLink="/login" [queryParams]="{ mode: 'register' }" class="landing-btn-register text-decoration-none">Register</a>
          </ng-template>
        </div>
      </header>

      <!-- Hero Section with Glowing Accents and Dotted Grid Overlay -->
      <section class="landing-hero">
        <div class="landing-grid-overlay"></div>
        <div class="landing-skyline-glow"></div>

        <div class="container position-relative" style="z-index: 10;">
          <div class="landing-hero-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9FEF00"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M 12 2 L 2 7 L 12 12 L 22 7 Z" />
              <path d="M 2 17 L 12 22 L 22 17" />
              <path d="M 2 12 L 12 17 L 22 12" />
            </svg>
          </div>

          <h1>
            Master Software Engineering <br />
            <span class="gradient-text">With AI-Powered Training</span>
          </h1>

          <p>
            Accelerate your learning curve with personalized 24/7 AI Tutors, interactive code compilation sandboxes, simulated technical interviews, and automated progress evaluations.
          </p>

          <div class="landing-hero-actions">
            <a (click)="onBrowseCourses()" class="landing-btn-register text-decoration-none cursor-pointer" style="padding: 14px 36px; font-size: 1rem;">
              Explore Courses
            </a>
            <a (click)="onStartTrial()" class="landing-btn-login text-decoration-none cursor-pointer" style="padding: 14px 36px; font-size: 1rem;">
              Start Free Trial
            </a>
          </div>
        </div>

        <!-- Custom Wave Separator -->
        <div class="landing-hero-wave">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C240,95 480,95 720,45 C960,-5 1200,-5 1440,45 L1440,90 L0,90 Z"></path>
          </svg>
        </div>
      </section>

      <!-- AI Features Grid -->
      <section id="features" class="landing-section">
        <div class="container">
          <div class="landing-section-title">
            <h2>Next-Generation <span>AI Classrooms</span></h2>
            <p>Our adaptive training lab wraps advanced Large Language Models around your courses to supercharge retention.</p>
          </div>

          <div class="landing-card-grid">
            <!-- Feature 1 -->
            <div class="landing-card">
              <div class="landing-card-icon">
                <i class="bi bi-chat-left-text-fill"></i>
              </div>
              <h3>24/7 AI Code Tutor</h3>
              <p>Stuck on a lesson or bug? Our context-aware AI tutor reads your course content to explain concepts and review code chunks instantly.</p>
            </div>

            <!-- Feature 2 -->
            <div class="landing-card">
              <div class="landing-card-icon">
                <i class="bi bi-mic-fill"></i>
              </div>
              <h3>Simulated Mock Interviews</h3>
              <p>Practice for big tech screenings with realistic, role-specific simulated technical interviews. Get grading reports on your answers.</p>
            </div>

            <!-- Feature 3 -->
            <div class="landing-card">
              <div class="landing-card-icon">
                <i class="bi bi-file-earmark-bar-graph-fill"></i>
              </div>
              <h3>AI Resume Analyzer</h3>
              <p>Upload your resume and get immediate insights on key skill gaps, compatibility scores, and personalized course recommendations.</p>
            </div>

            <!-- Feature 4 -->
            <div class="landing-card">
              <div class="landing-card-icon">
                <i class="bi bi-patch-check-fill"></i>
              </div>
              <h3>Interactive Quizzes</h3>
              <p>Verify your technical skills through dynamically-generated quizzes that test syntax, theory, and real-world code analysis.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Courses Section -->
      <section id="courses" class="landing-section" style="background-color: #050505;">
        <div class="container">
          <div class="landing-section-title">
            <h2>Explore Premium <span>Learning Tracks</span></h2>
            <p>Step-by-step developer paths built for high-scale, modern software applications.</p>
          </div>

          <div class="landing-card-grid">
            <!-- Course 1 -->
            <div class="landing-card">
              <div style="font-size: 0.8rem; color: #9FEF00; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Frontend Track</div>
              <h3>Mastering Angular Core & Signals</h3>
              <p>Deep-dive into component lifecycles, advanced reactive signals state management, routing architectures, and performance tuning.</p>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 14 Hours</span>
                <span class="fw-bold" style="color: #9FEF00;">$49.00</span>
              </div>
            </div>

            <!-- Course 2 -->
            <div class="landing-card">
              <div style="font-size: 0.8rem; color: #9FEF00; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Backend Track</div>
              <h3>ASP.NET Core Clean Architecture</h3>
              <p>Implement Domain-Driven Design (DDD), Entity Framework Core schemas, CQRS patterns, secure JWT pipelines, and Swagger endpoints.</p>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 18 Hours</span>
                <span class="fw-bold" style="color: #9FEF00;">$59.00</span>
              </div>
            </div>

            <!-- Course 3 -->
            <div class="landing-card">
              <div style="font-size: 0.8rem; color: #9FEF00; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">AI & Integrations</div>
              <h3>AI & LLM Integration Patterns</h3>
              <p>Configure Groq/OpenAI completions, prompt engineering workflows, vector search mappings, and automated RAG architectures.</p>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 10 Hours</span>
                <span class="fw-bold" style="color: #9FEF00;">$39.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Pricing / Offer Section -->
      <section id="pricing" class="landing-section">
        <div class="container">
          <div class="landing-section-title">
            <h2>Flexible, <span>All-Access Plans</span></h2>
            <p>Unlock the entire library, including sandbox sandpits and all career guidance tools.</p>
          </div>

          <div class="row g-4 justify-content-center align-items-stretch" style="max-width: 1200px; margin: 0 auto;">
            <!-- Monthly Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card h-100 d-flex flex-column justify-content-between" style="border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 15, 15, 0.65);">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white-50 fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px;">Monthly</span>
                  </div>
                  <div class="my-4">
                    <span style="font-size: 3.2rem; font-weight: 900; color: #ffffff;">$19</span>
                    <span class="text-white-50" style="font-size: 1.1rem;"> / Month</span>
                  </div>
                  <ul class="list-unstyled text-start my-4 py-2 border-top border-bottom border-secondary d-flex flex-column gap-3 text-white-50" style="font-size: 0.95rem;">
                    <li><i class="bi bi-check2 text-success me-2"></i> Access All Courses</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access all Future Videos</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Certificates of Completion</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Webstorm 6 Month License</li>
                  </ul>
                </div>
                <a (click)="onGetStarted()" class="landing-btn-login d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15);">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem;"></i> Get Started
                </a>
              </div>
            </div>

            <!-- Yearly (Most Popular) Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card h-100 d-flex flex-column justify-content-between" style="border: 2px solid #9FEF00; background: radial-gradient(circle at center top, rgba(159, 239, 0, 0.05), transparent), rgba(20, 20, 20, 0.85); box-shadow: 0 12px 40px rgba(159, 239, 0, 0.15); position: relative;">
                <!-- Most Popular Badge -->
                <div class="position-absolute" style="top: -15px; left: 50%; transform: translateX(-50%); background: #9FEF00; color: #050505; padding: 4px 16px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(159, 239, 0, 0.35);">
                  ★ Most Popular
                </div>
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px; color: #9FEF00 !important;">Yearly</span>
                  </div>
                  <div class="my-4">
                    <span style="font-size: 3.2rem; font-weight: 900; color: #ffffff;">$129</span>
                    <span class="text-white-50" style="font-size: 1.1rem;"> / Year</span>
                    <div style="color: #9FEF00; font-size: 0.95rem; font-weight: 600; margin-top: 4px;">
                      <del class="text-white-50 me-2">$180</del> (28% Off)
                    </div>
                  </div>
                  <ul class="list-unstyled text-start my-4 py-2 border-top border-bottom border-secondary d-flex flex-column gap-3 text-white-50" style="font-size: 0.95rem;">
                    <li class="fw-semibold text-white"><i class="bi bi-check2 text-success me-2"></i> Best Value</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Ideal for Training Request</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Webstorm 6 Month License</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access All Courses</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access all Future Videos</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Certificates of Completion</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Instructor Support</li>
                  </ul>
                </div>
                <a (click)="onGetStarted()" class="landing-btn-register d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem; color: #050505;"></i> Get Started
                </a>
              </div>
            </div>

            <!-- Lifetime Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card h-100 d-flex flex-column justify-content-between" style="border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(15, 15, 15, 0.65);">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white-50 fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px;">Lifetime</span>
                  </div>
                  <div class="my-4">
                    <span style="font-size: 3.2rem; font-weight: 900; color: #ffffff;">$499</span>
                    <span class="text-white-50" style="font-size: 1.1rem;"> / Forever!</span>
                  </div>
                  <ul class="list-unstyled text-start my-4 py-2 border-top border-bottom border-secondary d-flex flex-column gap-3 text-white-50" style="font-size: 0.95rem;">
                    <li class="fw-semibold text-white"><i class="bi bi-check2 text-success me-2"></i> Lifetime Access To All Content!</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Webstorm 6 Month License</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access All Courses</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access all Future Videos</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Certificates of Completion</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Instructor Support</li>
                  </ul>
                </div>
                <a (click)="onGetStarted()" class="landing-btn-login d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100" style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.15);">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem;"></i> Get Started
                </a>
              </div>
            </div>
          </div>

          <!-- Guarantee Footer -->
          <div class="d-flex justify-content-center align-items-center flex-wrap gap-4 mt-5 text-white-50" style="font-size: 0.95rem; font-weight: 500; color: rgba(255,255,255,0.6) !important;">
            <span><i class="bi bi-star text-success me-1"></i> 30-day money-back guarantee</span>
            <span class="d-none d-md-inline" style="color: rgba(255,255,255,0.25)">·</span>
            <span><i class="bi bi-check-circle text-success me-1"></i> Cancel anytime, no questions asked</span>
            <span class="d-none d-md-inline" style="color: rgba(255,255,255,0.25)">·</span>
            <span><i class="bi bi-lightning-charge-fill text-success me-1"></i> Instant access after signup</span>
          </div>
        </div>
      </section>

      <!-- Newsletter Signup -->
      <section id="newsletter" class="landing-newsletter-section">
        <div class="landing-newsletter-box">
          <h3>Subscribe to the Training Lab</h3>
          <p>Get notified about new AI frameworks, developer tutorials, course updates, and exclusive membership deals.</p>
          <div class="landing-newsletter-form">
            <input type="email" placeholder="Enter your email address" class="landing-newsletter-input" [(ngModel)]="emailAddress" />
            <button (click)="subscribeNewsletter()" class="landing-btn-register" style="box-shadow: none;">Subscribe</button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="landing-footer">
        <div class="container">
          <p class="mb-2">© 2026 AITraining Lab. All rights reserved.</p>
          <p class="mb-0 text-white-50" style="font-size: 0.8rem;">
            Designed for next-level software engineers. Built with Angular & ASP.NET Core.
          </p>
        </div>
      </footer>

      <!-- Floating Information Prompt Overlay -->
      <div *ngIf="showLoginPrompt" class="info-popup">
        <i class="bi bi-info-circle-fill" style="color: #0958d9; font-size: 1.25rem; margin-top: 2px;"></i>
        <div style="flex-grow: 1;">
          <h6 style="color: #0958d9; margin: 0 0 6px 0; font-weight: 700; font-size: 0.95rem;">Information</h6>
          <p style="color: #262626; margin: 0; font-size: 0.88rem; line-height: 1.4; font-weight: 500;">
            Please login first. You can use Github or email and password if you prefer.
          </p>
        </div>
        <button (click)="showLoginPrompt = false" style="background: transparent; border: none; padding: 0; color: #8c8c8c; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" onmouseover="this.style.color='#595959'" onmouseout="this.style.color='#8c8c8c'">
          <i class="bi bi-x-lg" style="font-size: 0.9rem;"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
  `]
})
export class HomeComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  emailAddress = '';
  showLoginPrompt = false;
  private promptTimeout: any;

  ngOnInit(): void {
    // Scroll to top on load
    window.scrollTo({ top: 0 });
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  getUserName(): string {
    return this.authService.getUserName();
  }

  logout(): void {
    this.authService.logout();
    this.toastr.info('Logged out successfully');
  }

  onBrowseCourses(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/explore']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onStartTrial(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/login'], { queryParams: { mode: 'register' } });
    }
  }

  onGetStarted(): void {
    if (this.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.showLoginPrompt = true;
      if (this.promptTimeout) {
        clearTimeout(this.promptTimeout);
      }
      this.promptTimeout = setTimeout(() => {
        this.showLoginPrompt = false;
      }, 7000);
    }
  }

  subscribeNewsletter(): void {
    if (!this.emailAddress || !this.emailAddress.includes('@')) {
      this.toastr.warning('Please enter a valid email address.');
      return;
    }
    this.toastr.success('Thank you for subscribing to AITraining Lab!');
    this.emailAddress = '';
  }
}

