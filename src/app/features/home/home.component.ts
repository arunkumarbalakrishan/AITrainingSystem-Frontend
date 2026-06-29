import { Component, inject, OnInit, OnDestroy, HostListener, signal, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { AnimationService } from '../../core/services/animation.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <!-- Full-Screen Loading Screen -->
    <div class="loading-splash-screen" *ngIf="isLoading" [style.opacity]="splashOpacity">
      <div class="loading-splash-logo">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="60"
          height="60"
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
        <div class="loading-splash-title">AITraining <span>Lab</span></div>
        <div class="loading-splash-status">{{ loadingStatus }}</div>
        <div class="loading-bar-outer">
          <div class="loading-bar-inner"></div>
        </div>
      </div>
    </div>

    <!-- Scroll Progress Indicator -->
    <div class="scroll-progress-container">
      <div class="scroll-progress-bar" [style.width.%]="scrollProgress"></div>
    </div>

    <!-- Page Transition Curtain -->
    <div class="page-transition-overlay" [class.active]="isTransitioning"></div>

    <div class="landing-body" (mousemove)="updateCursorGlow($event)">
      <!-- Ambient Interactive Glow following cursor -->
      <div class="cursor-glow" [style.left.px]="cursorX" [style.top.px]="cursorY"></div>

      <!-- Moving Background Gradient Orbs -->
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>

      <!-- Floating Navigation Header -->
      <header class="landing-header" [class.scrolled]="isScrolled">
        <div class="landing-logo">
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
          <a href="#" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'home'">Home</a>
          <a href="#features" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'features'">Features</a>
          <a href="#demo" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'demo'">Demo</a>
          <a href="#courses" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'courses'">Courses</a>
          <a href="#pricing" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'pricing'">Subscribe</a>
          <a href="#faq" class="landing-nav-link text-decoration-none" [class.active]="activeSection === 'faq'">FAQs</a>
        </nav>

        <div class="landing-auth-buttons">
          <button (click)="toggleTheme()" class="theme-toggle-btn me-2" aria-label="Toggle Theme">
            <i class="bi" [class.bi-sun-fill]="themeMode === 'dark'" [class.bi-moon-fill]="themeMode === 'light'"></i>
          </button>
          <ng-container *ngIf="isAuthenticated(); else guestButtons">
            <span class="text-white-50 d-none d-md-inline-block me-2">Welcome, <strong class="text-white">{{ getUserName() }}</strong></span>
            <a (click)="navigateWithTransition('/dashboard')" class="landing-btn-register text-decoration-none cursor-pointer"><span class="d-none d-sm-inline">Go to </span>Dashboard</a>
            <button (click)="logout()" class="landing-btn-login">Logout</button>
          </ng-container>
          <ng-template #guestButtons>
            <a (click)="navigateWithTransition('/login')" class="landing-btn-login text-decoration-none cursor-pointer">Login</a>
            <a (click)="navigateWithTransition('/login', { mode: 'register' })" class="landing-btn-register text-decoration-none cursor-pointer">Register</a>
          </ng-template>
          <button (click)="toggleMobileMenu()" class="hamburger-btn d-lg-none" aria-label="Toggle Menu">
            <i class="bi" [class.bi-list]="!isMobileMenuOpen" [class.bi-x-lg]="isMobileMenuOpen"></i>
          </button>
        </div>
      </header>

      <!-- Mobile Navigation Menu Drawer -->
      <div class="mobile-menu-drawer" [class.open]="isMobileMenuOpen">
        <div class="mobile-menu-backdrop" (click)="toggleMobileMenu()"></div>
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <div class="landing-logo">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#9FEF00"/>
                <path d="M9 21V11H12.5L16 16.5L19.5 11H23V21H20.5V14.5L17 20H15L11.5 14.5V21H9Z" fill="#050505"/>
                <text x="14" y="27" font-family="Arial" font-size="8" font-weight="bold" fill="#050505">AI</text>
              </svg>
              AITraining <span>Lab</span>
            </div>
            <button (click)="toggleMobileMenu()" class="mobile-menu-close-btn" aria-label="Close Menu">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          
          <nav class="mobile-menu-nav">
            <a href="#" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'home'">Home</a>
            <a href="#features" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'features'">Features</a>
            <a href="#demo" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'demo'">Demo</a>
            <a href="#courses" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'courses'">Courses</a>
            <a href="#pricing" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'pricing'">Subscribe</a>
            <a href="#faq" (click)="toggleMobileMenu()" class="mobile-nav-link" [class.active]="activeSection === 'faq'">FAQs</a>
          </nav>
          
          <div class="mobile-menu-footer mt-auto pt-4 border-top border-secondary">
            <ng-container *ngIf="isAuthenticated(); else mobileGuestButtons">
              <div class="text-white-50 mb-3 text-center">Welcome, <strong class="text-white">{{ getUserName() }}</strong></div>
              <a (click)="toggleMobileMenu(); navigateWithTransition('/dashboard')" class="landing-btn-register text-decoration-none cursor-pointer w-100 text-center d-block mb-2">Dashboard</a>
              <button (click)="toggleMobileMenu(); logout()" class="landing-btn-login w-100 text-center">Logout</button>
            </ng-container>
            <ng-template #mobileGuestButtons>
              <a (click)="toggleMobileMenu(); navigateWithTransition('/login')" class="landing-btn-login text-decoration-none cursor-pointer w-100 text-center d-block mb-2">Login</a>
              <a (click)="toggleMobileMenu(); navigateWithTransition('/login', { mode: 'register' })" class="landing-btn-register text-decoration-none cursor-pointer w-100 text-center d-block">Register</a>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Hero Section with Typewriter Heading and Floating Badges -->
      <section class="landing-hero">
        <div class="landing-grid-overlay"></div>
        <div class="landing-skyline-glow"></div>

        <!-- Floating Hero Chips representing active system logs -->
        <div class="floating-hero-chip f-chip-1"><i class="bi bi-robot" style="color: #9FEF00"></i> AI Tutor active</div>
        <div class="floating-hero-chip f-chip-2"><i class="bi bi-lightning-fill" style="color: #FFB800"></i> +15 XP Gained</div>
        <div class="floating-hero-chip f-chip-3"><i class="bi bi-patch-check-fill" style="color: #00D26A"></i> Angular Signals Passed</div>
        <div class="floating-hero-chip f-chip-4"><i class="bi bi-award-fill" style="color: #6c63ff"></i> Certificate Earned</div>

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
            Master <span class="text-primary-brand">{{ typewriterText }}</span><span class="typewriter-cursor">|</span> <br />
            <span class="gradient-text">With AI-Powered Training</span>
          </h1>

          <p>
            Accelerate your learning curve with personalized 24/7 AI Tutors, interactive code compilation sandboxes, simulated technical interviews, and automated progress evaluations.
          </p>

          <div class="landing-hero-actions">
            <button (click)="scrollToElement('courses')" class="landing-btn-register landing-btn-pulse border-0" style="padding: 14px 36px; font-size: 1rem;">
              Explore Courses
            </button>
            <button (click)="openDemoModalTab(0)" class="landing-btn-login" style="padding: 14px 36px; font-size: 1rem;">
              <i class="bi bi-play-circle-fill me-2"></i> Try Live Demo
            </button>
          </div>
        </div>

        <!-- Custom Wave Separator -->
        <div class="landing-hero-wave">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C240,95 480,95 720,45 C960,-5 1200,-5 1440,45 L1440,90 L0,90 Z"></path>
          </svg>
        </div>
      </section>

      <!-- Infinite Logo Marquee Strip (Trust Booster) -->
      <div class="logo-scroll-container">
        <div class="logo-scroll-track">
          <!-- Double items for infinite looping -->
          <div class="logo-item"><i class="bi bi-cpu"></i> TCS</div>
          <div class="logo-item"><i class="bi bi-cloud-check"></i> Infosys</div>
          <div class="logo-item"><i class="bi bi-bezier2"></i> Zoho</div>
          <div class="logo-item"><i class="bi bi-terminal-fill"></i> Accenture</div>
          <div class="logo-item"><i class="bi bi-code-square"></i> Wipro</div>
          <div class="logo-item"><i class="bi bi-globe"></i> HCL</div>
          <!-- Second set -->
          <div class="logo-item"><i class="bi bi-cpu"></i> TCS</div>
          <div class="logo-item"><i class="bi bi-cloud-check"></i> Infosys</div>
          <div class="logo-item"><i class="bi bi-bezier2"></i> Zoho</div>
          <div class="logo-item"><i class="bi bi-terminal-fill"></i> Accenture</div>
          <div class="logo-item"><i class="bi bi-code-square"></i> Wipro</div>
          <div class="logo-item"><i class="bi bi-globe"></i> HCL</div>
        </div>
      </div>

      <!-- Count-up Statistics Section immediately below Hero / Logos -->
      <section id="metrics" class="reveal-on-scroll py-4">
        <div class="landing-stats-grid">
          <div class="landing-stat-item">
            <div class="landing-stat-number">{{ displayedStudents | number }}</div>
            <div class="landing-stat-label">Active Learners</div>
          </div>
          <div class="landing-stat-item">
            <div class="landing-stat-number">{{ displayedCompletion }}%</div>
            <div class="landing-stat-label">Placement Rate</div>
          </div>
          <div class="landing-stat-item">
            <div class="landing-stat-number">{{ displayedCourses }}</div>
            <div class="landing-stat-label">Interactive Courses</div>
          </div>
          <div class="landing-stat-item">
            <div class="landing-stat-number">24/7</div>
            <div class="landing-stat-label">AI Tutor Response</div>
          </div>
        </div>
      </section>

      <!-- AI Features Grid (3D Tilt Cards) -->
      <section id="features" class="landing-section reveal-on-scroll">
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

      <!-- Product Demo Section (Browser Mockup Showing Action Tabs) -->
      <section id="demo" class="landing-section reveal-on-scroll">
        <div class="container">
          <div class="landing-section-title">
            <h2>See the <span>AI Classroom</span> in Action</h2>
            <p>Directly interact with the core elements that students use everyday to build production-grade features.</p>
          </div>

          <div class="demo-layout">
            <!-- Left Tab Selectors -->
            <div class="demo-tabs">
              <button (click)="selectDemoTab(0)" class="demo-tab-btn" [class.active]="demoActiveTab === 0">
                <h4><i class="bi bi-chat-dots-fill"></i> 24/7 AI Tutor</h4>
                <p>Interactive chats aligned to course context.</p>
              </button>
              <button (click)="selectDemoTab(1)" class="demo-tab-btn" [class.active]="demoActiveTab === 1">
                <h4><i class="bi bi-terminal-fill"></i> Code Sandbox</h4>
                <p>Compile and run TypeScript directly in your browser.</p>
              </button>
              <button (click)="selectDemoTab(2)" class="demo-tab-btn" [class.active]="demoActiveTab === 2">
                <h4><i class="bi bi-ui-checks"></i> Quiz Generator</h4>
                <p>Verify knowledge with custom assessments.</p>
              </button>
              <button (click)="selectDemoTab(3)" class="demo-tab-btn" [class.active]="demoActiveTab === 3">
                <h4><i class="bi bi-mic-fill"></i> Voice Interview</h4>
                <p>Simulate mock tech panel loops with grading.</p>
              </button>
            </div>

            <!-- Right Interactive Browser Mockup -->
            <div class="browser-mockup">
              <div class="browser-header">
                <div class="browser-dots">
                  <span class="browser-dot red"></span>
                  <span class="browser-dot yellow"></span>
                  <span class="browser-dot green"></span>
                </div>
                <div class="browser-address">https://aitraining-lab.com/classroom/signals-deepdive</div>
              </div>
              <div class="browser-body">
                <!-- Tab 0: AI Tutor Chat Simulation -->
                <div *ngIf="demoActiveTab === 0" class="mockup-chat-container">
                  <div class="mockup-chat-bubble user">
                    How do Angular Signals work?
                  </div>
                  <div class="mockup-chat-bubble ai" *ngFor="let msg of simulatedChatMessages | slice:1">
                    {{ msg.text }}
                  </div>
                  <div class="mockup-chat-bubble ai" *ngIf="simulatedChatInput">
                    <span class="spinner-border spinner-border-sm me-2 text-primary-brand" role="status"></span>
                    {{ simulatedChatInput }}
                  </div>
                  <div class="mockup-chat-input-bar">
                    <input type="text" readonly placeholder="Ask code tutor..." class="mockup-chat-input" />
                    <button class="landing-btn-register py-2 border-0" style="font-size: 0.8rem;">Send</button>
                  </div>
                </div>

                <!-- Tab 1: Code Sandbox -->
                <div *ngIf="demoActiveTab === 1" class="mockup-editor-container">
                  <div class="mockup-editor-header">signals-compilation.ts</div>
                  <textarea class="mockup-editor-content" [(ngModel)]="simulatedCode" style="resize:none; outline:none;"></textarea>
                  <div class="mockup-editor-output">
                    {{ simulatedEditorOutput }}
                  </div>
                  <div class="mt-3 text-end">
                    <button (click)="compileSimulatedCode()" class="landing-btn-register py-2 border-0" [disabled]="isCompilingCode">
                      <span *ngIf="isCompilingCode" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      <i class="bi bi-play-fill me-1" *ngIf="!isCompilingCode"></i> Run Code
                    </button>
                  </div>
                </div>

                <!-- Tab 2: Quiz Generator -->
                <div *ngIf="demoActiveTab === 2" class="mockup-quiz-container">
                  <div class="mockup-quiz-question">Which method is used to write a new value to an Angular signal?</div>
                  <div class="mockup-quiz-options">
                    <button (click)="selectQuizOption(0)" class="mockup-quiz-option" [class.selected]="quizQuestionSelected === 0" [class.correct]="quizSubmitted && quizQuestionSelected === 0">
                      a) count.update(5)
                    </button>
                    <button (click)="selectQuizOption(1)" class="mockup-quiz-option" [class.selected]="quizQuestionSelected === 1" [class.correct]="quizSubmitted && quizQuestionSelected === 1">
                      b) count.set(5)
                    </button>
                    <button (click)="selectQuizOption(2)" class="mockup-quiz-option" [class.selected]="quizQuestionSelected === 2" [class.correct]="quizSubmitted && quizQuestionSelected === 2">
                      c) count.mutate(5)
                    </button>
                  </div>
                  <div class="mockup-quiz-feedback" *ngIf="quizSubmitted">
                    <i class="bi bi-check-circle-fill me-2"></i> Correct! The .set() method sets a signal directly to a new value.
                    <button (click)="resetQuizSimulation()" class="btn btn-sm btn-link text-white ms-3">Reset</button>
                  </div>
                </div>

                <!-- Tab 3: Mock Interview -->
                <div *ngIf="demoActiveTab === 3" class="mockup-interview-container">
                  <div class="mockup-avatar-circle">
                    🤖
                  </div>
                  <div class="text-white-50 text-center">
                    <h5>AI Interviewer: "Explain the difference between clean architecture and layered architecture."</h5>
                    <p class="small">Press space or tap mic to answer...</p>
                  </div>
                  <div class="waveform-bars">
                    <span class="waveform-bar"></span>
                    <span class="waveform-bar"></span>
                    <span class="waveform-bar"></span>
                    <span class="waveform-bar"></span>
                    <span class="waveform-bar"></span>
                    <span class="waveform-bar"></span>
                  </div>
                  <button class="landing-btn-register border-0 py-2 px-4"><i class="bi bi-mic-fill me-2"></i> Answer Verbally</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Student Dashboard Preview Section (Mockup With Skeleton States) -->
      <section id="dashboard-preview" class="landing-section reveal-on-scroll" #dashboardSection>
        <div class="container">
          <div class="landing-section-title">
            <h2>Your Learning <span>Hub Dashboard</span></h2>
            <p>Gain insights, track streak points, unlock certificates, and see your rank in real-time.</p>
          </div>

          <div class="browser-mockup" style="max-width: 1000px; margin: 0 auto;">
            <div class="browser-header">
              <div class="browser-dots">
                <span class="browser-dot red"></span>
                <span class="browser-dot yellow"></span>
                <span class="browser-dot green"></span>
              </div>
              <div class="browser-address">https://aitraining-lab.com/dashboard</div>
            </div>
            <div class="browser-body" style="min-height: 480px; position: relative;">
              <!-- Skeleton loader that matches Stripe layout -->
              <div class="skeleton-shimmer-wrapper" *ngIf="dashboardIsLoading">
                <div class="d-flex gap-3 align-items-center mb-4">
                  <div class="skeleton-box-shimmer" style="width: 50px; height: 50px; border-radius: 50%;"></div>
                  <div class="flex-grow-1">
                    <div class="skeleton-box-shimmer" style="width: 180px; height: 18px; margin-bottom: 8px;"></div>
                    <div class="skeleton-box-shimmer" style="width: 100px; height: 12px;"></div>
                  </div>
                </div>
                <div class="row g-4">
                  <div class="col-md-4">
                    <div class="skeleton-box-shimmer" style="height: 140px; border-radius: 16px;"></div>
                  </div>
                  <div class="col-md-4">
                    <div class="skeleton-box-shimmer" style="height: 140px; border-radius: 16px;"></div>
                  </div>
                  <div class="col-md-4">
                    <div class="skeleton-box-shimmer" style="height: 140px; border-radius: 16px;"></div>
                  </div>
                </div>
                <div class="skeleton-box-shimmer mt-4" style="height: 120px; border-radius: 16px;"></div>
              </div>

              <!-- Actual Dashboard mockup content resolving after observer triggers -->
              <div class="row g-4" *ngIf="!dashboardIsLoading">
                <!-- User Welcome Header -->
                <div class="col-12 d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-2">
                  <div class="d-flex align-items-center gap-3">
                    <div class="mockup-avatar-circle" style="width: 48px; height: 48px; font-size: 1.5rem; background: linear-gradient(135deg, #6c63ff, #9FEF00)">
                      👨‍💻
                    </div>
                    <div>
                      <h4 class="text-white mb-0 font-weight-700">Welcome back, Alex!</h4>
                      <p class="text-white-50 small mb-0">Track your weekly AI engineering milestone targets.</p>
                    </div>
                  </div>
                  <!-- Streak Flame indicator -->
                  <div class="d-flex align-items-center gap-2 bg-dark-accent px-3 py-2 rounded-xl border border-secondary" style="background: rgba(255,255,255,0.02)">
                    <span style="font-size: 1.2rem; animation: float-hero 2s infinite alternate; display: inline-block;">🔥</span>
                    <strong class="text-white">12 Day Streak</strong>
                  </div>
                </div>

                <!-- Three main dashboard statistic widgets -->
                <div class="col-md-4">
                  <div class="landing-card" style="padding: 24px;">
                    <div class="text-white-50 small">COURSE PROGRESS</div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <h3 class="text-white font-weight-800 mb-0">78%</h3>
                      <div class="spinner-border spinner-border-sm text-primary-brand" role="status" style="width: 20px; height: 20px; border-width: 3px;"></div>
                    </div>
                    <div class="progress mt-3" style="height: 6px;">
                      <div class="progress-bar" style="width: 78%;"></div>
                    </div>
                    <span class="text-white-50 small d-block mt-2">Angular Signals Advanced Track</span>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="landing-card" style="padding: 24px;">
                    <div class="text-white-50 small">INTERVIEW PASS RATE</div>
                    <h3 class="text-white font-weight-800 mt-3 mb-0">92%</h3>
                    <div class="text-success small mt-2"><i class="bi bi-graph-up-arrow me-1"></i> +4% improvement from last week</div>
                  </div>
                </div>

                <div class="col-md-4">
                  <div class="landing-card" style="padding: 24px;">
                    <div class="text-white-50 small">XP LEVEL</div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                      <h3 class="text-white font-weight-800 mb-0">Level 8</h3>
                      <span class="text-primary-brand" style="font-weight: 700; font-size: 0.85rem;">2,450 / 3,000 XP</span>
                    </div>
                    <div class="progress mt-3" style="height: 6px;">
                      <div class="progress-bar" style="width: 81%;"></div>
                    </div>
                  </div>
                </div>

                <!-- AI Recommendations Box -->
                <div class="col-12">
                  <div class="landing-card d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3" style="padding: 24px; border-color: rgba(159,239,0,0.15); background: rgba(159,239,0,0.02)">
                    <div>
                      <h5 class="text-white font-weight-700 mb-1"><i class="bi bi-robot text-primary-brand me-2"></i> AI Buddy Suggestion</h5>
                      <p class="text-white-50 small mb-0">You're matching 88% of requirements for ASP.NET Backend clean architecture loops. Enroll to bridge the remaining gaps.</p>
                    </div>
                    <button class="landing-btn-register border-0 py-2 px-4" style="font-size: 0.85rem;">Bridge Skill Gap</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Learning Tracks Upgrades -->
      <section id="courses" class="landing-section">
        <div class="container">
          <div class="landing-section-title">
            <h2>Explore Premium <span>Learning Tracks</span></h2>
            <p>Step-by-step developer paths built for high-scale, modern software applications.</p>
          </div>

          <div class="landing-card-grid">
            <!-- Course 1 -->
            <div class="landing-card">
              <span class="course-badge-popular">🔥 Popular</span>
              <div class="text-primary-brand" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Frontend Track</div>
              <h3>Mastering Angular Core & Signals</h3>
              <p>Deep-dive into component lifecycles, advanced reactive signals state management, routing architectures, and performance tuning.</p>
              <div class="course-rating mt-3">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <span>4.9 (1,245 Students)</span>
              </div>
              <div class="course-progress-container">
                <div class="course-progress-text">
                  <span>Course Progress</span>
                  <span>75%</span>
                </div>
                <div class="course-progress-bar">
                  <div class="course-progress-fill" style="width: 75%;"></div>
                </div>
              </div>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 14 Hours</span>
                <span class="fw-bold text-primary-brand">$49.00</span>
              </div>
            </div>

            <!-- Course 2 -->
            <div class="landing-card">
              <div class="text-primary-brand" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Backend Track</div>
              <h3>ASP.NET Core Clean Architecture</h3>
              <p>Implement Domain-Driven Design (DDD), Entity Framework Core schemas, CQRS patterns, secure JWT pipelines, and Swagger endpoints.</p>
              <div class="course-rating mt-3">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-half"></i>
                <span>4.8 (980 Students)</span>
              </div>
              <div class="course-progress-container">
                <div class="course-progress-text">
                  <span>Course Progress</span>
                  <span>40%</span>
                </div>
                <div class="course-progress-bar">
                  <div class="course-progress-fill" style="width: 40%;"></div>
                </div>
              </div>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 18 Hours</span>
                <span class="fw-bold text-primary-brand">$59.00</span>
              </div>
            </div>

            <!-- Course 3 -->
            <div class="landing-card">
              <div class="text-primary-brand" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">AI & Integrations</div>
              <h3>AI & LLM Integration Patterns</h3>
              <p>Configure Groq/OpenAI completions, prompt engineering workflows, vector search mappings, and automated RAG architectures.</p>
              <div class="course-rating mt-3">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <span>4.9 (1,450 Students)</span>
              </div>
              <div class="course-progress-container">
                <div class="course-progress-text">
                  <span>Course Progress</span>
                  <span>10%</span>
                </div>
                <div class="course-progress-bar">
                  <div class="course-progress-fill" style="width: 10%;"></div>
                </div>
              </div>
              <div class="mt-4 pt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                <span class="text-white-50" style="font-size: 0.85rem;"><i class="bi bi-clock me-1"></i> 10 Hours</span>
                <span class="fw-bold text-primary-brand">$39.00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Achievement Showcase Section -->
      <section id="achievements" class="landing-section reveal-on-scroll">
        <div class="container">
          <div class="landing-section-title">
            <h2>Earn Industry-Standard <span>Certificates</span></h2>
            <p>Each track unlocks a downloadable certificate of training verified through blockchain hashes.</p>
          </div>

          <div class="certificate-showcase-grid">
            <div class="certificate-badge-card">
              <div class="cert-icon-container"><i class="bi bi-award-fill"></i></div>
              <h4 class="text-white font-weight-700">Angular Master</h4>
              <p class="text-white-50 small mt-2">Signals architecture, custom directive pipelines, performance tuning.</p>
            </div>
            <div class="certificate-badge-card">
              <div class="cert-icon-container" style="color: #6C63FF; background: rgba(108,99,255,0.08); border-color: rgba(108,99,255,0.2);"><i class="bi bi-shield-lock-fill"></i></div>
              <h4 class="text-white font-weight-700">ASP.NET Clean Architect</h4>
              <p class="text-white-50 small mt-2">DDD practices, CQRS patterns, secure JWT middleware, and unit test filters.</p>
            </div>
            <div class="certificate-badge-card">
              <div class="cert-icon-container brand-cert-icon"><i class="bi bi-cpu-fill"></i></div>
              <h4 class="text-white font-weight-700">AI Integration Expert</h4>
              <p class="text-white-50 small mt-2">Embedding configurations, prompt security loops, automated RAG flows.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials Section -->
      <section id="testimonials" class="landing-section reveal-on-scroll">
        <div class="container">
          <div class="landing-section-title">
            <h2>What Developers <span>Say About Us</span></h2>
            <p>Over 10,000 developers have upgraded their engineering careers with our labs.</p>
          </div>

          <div class="testimonials-slider">
            <div class="testimonial-track" [style.transform]="'translate3d(' + (-activeTestimonial * 100) + '%, 0, 0)'">
              <!-- Slide 1 -->
              <div class="testimonial-slide">
                <div class="testimonial-quote-box">
                  <div class="text-warning mb-3">
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill"></i>
                  </div>
                  <h4 class="text-white mb-4">"Got hired in 3 months! The simulated mock interviews were exactly like the actual interview panel I faced."</h4>
                  <strong class="text-white d-block">Arun Kumar</strong>
                  <span class="text-white-50 small">Frontend Engineer, TCS</span>
                </div>
              </div>

              <!-- Slide 2 -->
              <div class="testimonial-slide">
                <div class="testimonial-quote-box">
                  <div class="text-warning mb-3">
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill"></i>
                  </div>
                  <h4 class="text-white mb-4">"The 24/7 AI Tutor is a lifesaver. Whenever I got stuck on entity mapping bugs, it explained the database logs."</h4>
                  <strong class="text-white d-block">Sneha Patil</strong>
                  <span class="text-white-50 small">Backend Dev, Zoho</span>
                </div>
              </div>

              <!-- Slide 3 -->
              <div class="testimonial-slide">
                <div class="testimonial-quote-box">
                  <div class="text-warning mb-3">
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill me-1"></i>
                    <i class="bi bi-star-fill"></i>
                  </div>
                  <h4 class="text-white mb-4">"AITraining Lab bridged the gap for vector searches. The RAG architecture was extremely clear to implement."</h4>
                  <strong class="text-white d-block">David Miller</strong>
                  <span class="text-white-50 small">AI Architect, Accenture</span>
                </div>
              </div>
            </div>

            <!-- Dots Indicators -->
            <div class="testimonial-dots">
              <button (click)="activeTestimonial = 0" class="testimonial-dot" [class.active]="activeTestimonial === 0"></button>
              <button (click)="activeTestimonial = 1" class="testimonial-dot" [class.active]="activeTestimonial === 1"></button>
              <button (click)="activeTestimonial = 2" class="testimonial-dot" [class.active]="activeTestimonial === 2"></button>
            </div>
          </div>
        </div>
      </section>

      <!-- Upgraded Premium Pricing Section -->
      <section id="pricing" class="landing-section reveal-on-scroll">
        <div class="container">
          <div class="landing-section-title">
            <h2>Flexible, <span>All-Access Plans</span></h2>
            <p>Unlock the entire library, including sandbox sandpits and all career guidance tools.</p>
          </div>

          <!-- Billing Toggle switch -->
          <div class="pricing-switch-container">
            <span class="pricing-switch-label" [class.active]="billingPeriod === 'monthly'" (click)="billingPeriod = 'monthly'">Monthly</span>
            <div class="pricing-toggle-switch" [class.yearly]="billingPeriod === 'yearly'" (click)="toggleBillingPeriod()">
              <span class="pricing-toggle-handle"></span>
            </div>
            <span class="pricing-switch-label" [class.active]="billingPeriod === 'yearly'" (click)="billingPeriod = 'yearly'">
              Yearly <span class="savings-pulse-badge ms-2">Save 28%</span>
            </span>
          </div>

          <div class="row g-4 justify-content-center align-items-stretch" style="max-width: 1200px; margin: 0 auto;">
            <!-- Monthly / Yearly Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card pricing-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white-50 fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px;">Monthly Tier</span>
                  </div>
                  <div class="my-4">
                    <span class="pricing-price" style="font-size: 3.2rem; font-weight: 900;">
                      $ {{ billingPeriod === 'monthly' ? '19' : '13' }}
                    </span>
                    <span class="text-white-50" style="font-size: 1.1rem;"> / Month</span>
                    <div class="text-white-50 small mt-1" *ngIf="billingPeriod === 'yearly'">Billed annually ($156/yr)</div>
                  </div>
                  <ul class="list-unstyled text-start my-4 py-2 border-top border-bottom border-secondary d-flex flex-column gap-3 text-white-50" style="font-size: 0.95rem;">
                    <li><i class="bi bi-check2 text-success me-2"></i> Access All Courses</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access all Future Videos</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Certificates of Completion</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Webstorm 6 Month License</li>
                  </ul>
                </div>
                <button (click)="onGetStarted()" class="landing-btn-login pricing-btn d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem;"></i> Get Started
                </button>
              </div>
            </div>

            <!-- Yearly (Most Popular) Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card pricing-card featured-pricing h-100 d-flex flex-column justify-content-between">
                <!-- Most Popular Badge -->
                <div class="position-absolute" style="top: -15px; left: 50%; transform: translateX(-50%); background: #9FEF00; color: #050505; padding: 4px 16px; border-radius: 99px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(159, 239, 0, 0.35);">
                  ★ Most Popular
                </div>
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px; color: #9FEF00 !important;">Yearly Tier</span>
                  </div>
                  <div class="my-4">
                    <span class="pricing-price" style="font-size: 3.2rem; font-weight: 900;">
                      $ {{ billingPeriod === 'monthly' ? '180' : '129' }}
                    </span>
                    <span class="text-white-50" style="font-size: 1.1rem;"> / Year</span>
                    <div style="color: #9FEF00; font-size: 0.95rem; font-weight: 600; margin-top: 4px;">
                      <del class="text-white-50 me-2" *ngIf="billingPeriod === 'yearly'">$180</del> (28% Off)
                    </div>
                  </div>
                  <ul class="list-unstyled text-start my-4 py-2 border-top border-bottom border-secondary d-flex flex-column gap-3 text-white-50" style="font-size: 0.95rem;">
                    <li class="fw-semibold text-white"><i class="bi bi-check2 text-success me-2"></i> Best Value</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Ideal for Training Requests</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Webstorm 6 Month License</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access All Courses</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> Access all Future Videos</li>
                    <li><i class="bi bi-check2 text-success me-2"></i> blockchain Verified Certificates</li>
                  </ul>
                </div>
                <button (click)="onGetStarted()" class="landing-btn-register border-0 d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem; color: #050505;"></i> Get Started
                </button>
              </div>
            </div>

            <!-- Lifetime Card -->
            <div class="col-lg-4 col-md-6">
              <div class="landing-card pricing-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="text-uppercase text-white-50 fw-bold" style="font-size: 0.85rem; letter-spacing: 1.5px;">Lifetime Access</span>
                  </div>
                  <div class="my-4">
                    <span class="pricing-price" style="font-size: 3.2rem; font-weight: 900;">$499</span>
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
                <button (click)="onGetStarted()" class="landing-btn-login pricing-btn d-flex align-items-center justify-content-center text-decoration-none cursor-pointer mt-4 py-3 w-100">
                  <i class="bi bi-play-circle-fill me-2" style="font-size: 1.1rem;"></i> Get Started
                </button>
              </div>
            </div>
          </div>

          <!-- Guarantee Footer -->
          <div class="pricing-guarantee-footer d-flex justify-content-center align-items-center flex-wrap gap-4 mt-5">
            <span><i class="bi bi-star text-success me-1"></i> 30-day money-back guarantee</span>
            <span class="d-none d-md-inline dot-divider">·</span>
            <span><i class="bi bi-check-circle text-success me-1"></i> Cancel anytime, no questions asked</span>
            <span class="d-none d-md-inline dot-divider">·</span>
            <span><i class="bi bi-lightning-charge-fill text-success me-1"></i> Instant access after signup</span>
          </div>
        </div>
      </section>

      <!-- FAQ Accordion Section -->
      <section id="faq" class="landing-section reveal-on-scroll">
        <div class="container">
          <div class="landing-section-title">
            <h2>Frequently Asked <span>Questions</span></h2>
            <p>Find answers to common questions about our AI tutor integrations and billing policy.</p>
          </div>

          <div class="faq-accordion-container">
            <div class="faq-accordion-item" [class.active]="expandedFaq === 0">
              <div class="faq-accordion-header" (click)="toggleFaq(0)">
                <span>How does the 24/7 AI Tutor work?</span>
                <i class="bi bi-chevron-down faq-accordion-icon"></i>
              </div>
              <div class="faq-accordion-body" [style.maxHeight]="expandedFaq === 0 ? '200px' : '0'">
                <div class="faq-accordion-body-content">
                  The AI Tutor scans the code sandbox context, compiler output errors, and lesson slide content to formulate step-by-step guidance. It operates like a senior developer pointing out syntax bugs without spoiling the solutions directly.
                </div>
              </div>
            </div>

            <div class="faq-accordion-item" [class.active]="expandedFaq === 1">
              <div class="faq-accordion-header" (click)="toggleFaq(1)">
                <span>How do verified blockchain certifications work?</span>
                <i class="bi bi-chevron-down faq-accordion-icon"></i>
              </div>
              <div class="faq-accordion-body" [style.maxHeight]="expandedFaq === 1 ? '200px' : '0'">
                <div class="faq-accordion-body-content">
                  Upon finishing all lessons and compiling required unit-tested assignments, we sign a completion certificate containing a cryptographic hash identifier. Anyone can verify your credentials on our public ledger interface.
                </div>
              </div>
            </div>

            <div class="faq-accordion-item" [class.active]="expandedFaq === 2">
              <div class="faq-accordion-header" (click)="toggleFaq(2)">
                <span>Can I cancel my subscription anytime?</span>
                <i class="bi bi-chevron-down faq-accordion-icon"></i>
              </div>
              <div class="faq-accordion-body" [style.maxHeight]="expandedFaq === 2 ? '200px' : '0'">
                <div class="faq-accordion-body-content">
                  Yes, subscriptions can be terminated immediately through your account dashboard parameters. You maintain full access until the current billing cycle resolves, and no cancellation penalties are applied.
                </div>
              </div>
            </div>

            <div class="faq-accordion-item" [class.active]="expandedFaq === 3">
              <div class="faq-accordion-header" (click)="toggleFaq(3)">
                <span>Are sandbox compiler projects included in all plans?</span>
                <i class="bi bi-chevron-down faq-accordion-icon"></i>
              </div>
              <div class="faq-accordion-body" [style.maxHeight]="expandedFaq === 3 ? '200px' : '0'">
                <div class="faq-accordion-body-content">
                  Absolutely. Complete sandbox compilation instances for TypeScript, ASP.NET cleanly isolated containers, and Mock voice screening panels are accessible for all subscription plans.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="premium-footer">
        <div class="footer-grid">
          <div class="footer-logo-col">
            <div class="landing-logo">
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
            <p>Accelerate your engineering learning curve with context-aware AI Tutors, cloud sandboxes, and simulated screenings.</p>
            <div class="footer-social-links">
              <a href="https://github.com" target="_blank" class="footer-social-btn"><i class="bi bi-github"></i></a>
              <a href="https://linkedin.com" target="_blank" class="footer-social-btn"><i class="bi bi-linkedin"></i></a>
              <a href="https://discord.com" target="_blank" class="footer-social-btn"><i class="bi bi-discord"></i></a>
              <a href="https://youtube.com" target="_blank" class="footer-social-btn"><i class="bi bi-youtube"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h5>Company</h5>
            <ul class="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Brand Assets</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Courses</h5>
            <ul class="footer-links">
              <li><a href="#">Angular Signals</a></li>
              <li><a href="#">Clean Architecture</a></li>
              <li><a href="#">AI Integration</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Resources</h5>
            <ul class="footer-links">
              <li><a href="#">Documentation</a></li>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">API Keys</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h5>Community</h5>
            <ul class="footer-links">
              <li><a href="#">Discord Server</a></li>
              <li><a href="#">YouTube Channel</a></li>
              <li><a href="#">GitHub Repo</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="mb-0">© 2026 AITraining Lab. All rights reserved.</p>
          <div class="d-flex gap-4">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </footer>


      <!-- Interactive Demo Modal -->
      <div class="demo-modal-overlay" *ngIf="showDemoModal">
        <div class="demo-modal-card">
          <div class="demo-modal-header">
            <h4 class="demo-modal-title"><i class="bi bi-cpu-fill text-primary-brand"></i> Try <span>Live Demo</span></h4>
            <button class="demo-modal-close-btn" (click)="showDemoModal = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="demo-modal-nav">
            <div class="demo-modal-tab" [class.active]="demoModalActiveTab === 0" (click)="demoModalActiveTab = 0">
              <i class="bi bi-chat-left-text-fill"></i> AI Chat
            </div>
            <div class="demo-modal-tab" [class.active]="demoModalActiveTab === 1" (click)="demoModalActiveTab = 1">
              <i class="bi bi-terminal-fill"></i> Sandbox Compiler
            </div>
            <div class="demo-modal-tab" [class.active]="demoModalActiveTab === 2" (click)="demoModalActiveTab = 2">
              <i class="bi bi-patch-question-fill"></i> Assessment Quiz
            </div>
          </div>
          <div class="demo-modal-body">
            <!-- Modal Tab 0: AI Chat Custom Demo -->
            <div *ngIf="demoModalActiveTab === 0">
              <div class="mockup-chat-container" style="height: 300px;">
                <div class="mockup-chat-bubble ai">
                  Hello! I'm your AI Buddy. You can ask me any coding query about Angular Signals or clean architecture rules!
                </div>
                <div class="mockup-chat-bubble user" *ngFor="let chat of customDemoChats">
                  {{ chat.text }}
                </div>
                <div class="mockup-chat-bubble ai" *ngIf="customDemoAiReply">
                  {{ customDemoAiReply }}
                </div>
                <div class="mockup-chat-bubble ai" *ngIf="isCustomDemoReplying">
                  <span class="spinner-border spinner-border-sm me-2 text-primary-brand" role="status"></span>
                  Processing custom query...
                </div>
              </div>
              <div class="mockup-chat-input-bar">
                <input type="text" [(ngModel)]="customChatInputText" placeholder="Type a custom coding query..." class="mockup-chat-input" (keyup.enter)="sendCustomDemoChat()" />
                <button (click)="sendCustomDemoChat()" class="landing-btn-register py-2 border-0" style="font-size: 0.9rem;">Ask AI</button>
              </div>
            </div>

            <!-- Modal Tab 1: Sandbox Compiler -->
            <div *ngIf="demoModalActiveTab === 1">
              <div class="mockup-editor-container" style="height: 300px;">
                <div class="mockup-editor-header">compiler-sandbox.ts</div>
                <textarea class="mockup-editor-content" [(ngModel)]="customSandboxCode" style="resize:none; outline:none; height: 160px;"></textarea>
                <div class="mockup-editor-output" style="min-height: 60px;">
                  {{ customSandboxOutput }}
                </div>
                <div class="mt-2 text-end">
                  <button (click)="runCustomSandbox()" class="landing-btn-register py-2 border-0" [disabled]="isCustomCompiling">
                    <span *ngIf="isCustomCompiling" class="spinner-border spinner-border-sm me-2" role="status"></span>
                    <i class="bi bi-play-fill me-1" *ngIf="!isCustomCompiling"></i> Compile Code
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Tab 2: Quiz assessment -->
            <div *ngIf="demoModalActiveTab === 2" class="mockup-quiz-container">
              <div class="mockup-quiz-question">Which option is an advantage of clean architectures?</div>
              <div class="mockup-quiz-options">
                <button (click)="selectModalQuizOption(0)" class="mockup-quiz-option" [class.selected]="modalQuizSelected === 0" [class.correct]="modalQuizSubmitted && modalQuizSelected === 0">
                  a) Direct coupling of API logic to UI databases.
                </button>
                <button (click)="selectModalQuizOption(1)" class="mockup-quiz-option" [class.selected]="modalQuizSelected === 1" [class.correct]="modalQuizSubmitted && modalQuizSelected === 1">
                  b) Separation of business domain entities from external framework dependencies.
                </button>
                <button (click)="selectModalQuizOption(2)" class="mockup-quiz-option" [class.selected]="modalQuizSelected === 2" [class.correct]="modalQuizSubmitted && modalQuizSelected === 2">
                  c) Complete removal of interface adapters.
                </button>
              </div>
              <div class="mockup-quiz-feedback" *ngIf="modalQuizSubmitted">
                <i class="bi bi-check-circle-fill me-2"></i> Correct! Clean architecture establishes stable inner circles representing database-independent domain business entities.
                <button (click)="resetModalQuiz()" class="btn btn-sm btn-link text-white ms-3">Reset Quiz</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer {
      cursor: pointer;
    }
    .typewriter-cursor {
      color: #9FEF00;
      animation: blink 0.8s infinite;
      font-weight: 400;
    }
    @keyframes blink {
      0%, 100% { opacity: 0; }
      50% { opacity: 1; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private animationService = inject(AnimationService);

  // Splash screen status
  isLoading = true;
  splashOpacity = 1;
  loadingStatus = 'Loading AI Models...';

  // Navigation & scrolls
  scrollProgress = 0;
  isScrolled = false;
  activeSection = 'home';
  isTransitioning = false;
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Typewriter
  typewriterText = 'Software Engineering';
  private words = ['Angular Development', 'ASP.NET Core', 'AI Engineering', 'Full Stack Codebases'];
  private typewriterTimeout: any;

  // Theme
  themeMode = 'dark';

  // Stats Counters
  targetStudents = 10450;
  displayedStudents = 0;
  targetCompletion = 95;
  displayedCompletion = 0;
  targetCourses = 540;
  displayedCourses = 0;

  // Interactive Product Demo
  demoActiveTab = 0;
  simulatedChatMessages = [
    { sender: 'user', text: 'How do Angular Signals work?' }
  ];
  simulatedChatInput = '';
  private chatSimTimeout: any;

  simulatedCode = `import { signal } from '@angular/core';

const count = signal(0);
console.log('Initial count:', count());

count.set(5);
console.log('New count:', count());`;
  simulatedEditorOutput = 'Ready to compile...';
  isCompilingCode = false;

  quizQuestionSelected = -1;
  quizSubmitted = false;

  // Student Dashboard preview resolver
  dashboardIsLoading = true;
  @ViewChild('dashboardSection') dashboardSection!: ElementRef;

  // Testimonials Auto-Slider
  activeTestimonial = 0;
  private testimonialInterval: any;

  // Pricing switch
  billingPeriod = 'yearly';

  // FAQAccordion
  expandedFaq = -1;

  // AI Mascot
  showMascotBubble = true;
  mascotMessage = 'Hey there! Ready to level up your engineering skills today? 🚀';
  mascotMinimized = false;
  private mascotBubbleTimeout: any;

  // Interactive Demo Modal
  showDemoModal = false;
  demoModalActiveTab = 0;
  customChatInputText = '';
  customDemoChats: Array<{sender: string, text: string}> = [];
  customDemoAiReply = '';
  isCustomDemoReplying = false;

  customSandboxCode = `// Edit this code to run
function calculateSignalsScore(lessonsCount) {
  return lessonsCount * 15;
}
console.log("XP Score:", calculateSignalsScore(12));`;
  customSandboxOutput = 'Ready to compile...';
  isCustomCompiling = false;

  modalQuizSelected = -1;
  modalQuizSubmitted = false;

  // Cursor position variables
  cursorX = -1000;
  cursorY = -1000;

  // Scroll Reveal elements
  private observer!: IntersectionObserver;

  ngOnInit(): void {
    // Initial scroll setup
    window.scrollTo({ top: 0 });

    // Handle splash screen simulation
    setTimeout(() => {
      this.loadingStatus = 'Initializing Sandboxes...';
      setTimeout(() => {
        this.loadingStatus = 'Loading Training Lab...';
        setTimeout(() => {
          this.splashOpacity = 0;
          setTimeout(() => {
            this.isLoading = false;
            // Activate typewriter loop
            this.runTypewriter();
          }, 500);
        }, 800);
      }, 800);
    }, 800);

    // Sync theme settings
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.themeMode = savedTheme;
      if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Auto-advance testimonials
    this.testimonialInterval = setInterval(() => {
      this.activeTestimonial = (this.activeTestimonial + 1) % 3;
    }, 6000);

    // Initialize AI Mascot greetings sequence
    this.mascotBubbleTimeout = setTimeout(() => {
      this.mascotMessage = 'Did you know? Completing our Angular signals path yields 2,500 XP! ⚡';
    }, 8000);
  }

  ngAfterViewInit(): void {
    // Intersection observer for scroll reveal and statistics trigger
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };

    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // Trigger statistics countup when stats grid intersects
          if (entry.target.id === 'metrics') {
            this.triggerStatsCountUp();
          }

          // Trigger Dashboard Preview resolving
          if (entry.target.id === 'dashboard-preview') {
            setTimeout(() => {
              this.dashboardIsLoading = false;
            }, 1200);
          }
        }
      });
    }, options);

    // Find and observe reveal elements
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => this.observer.observe(el));
  }

  ngOnDestroy(): void {
    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
    if (this.chatSimTimeout) clearTimeout(this.chatSimTimeout);
    if (this.testimonialInterval) clearInterval(this.testimonialInterval);
    if (this.mascotBubbleTimeout) clearTimeout(this.mascotBubbleTimeout);
    if (this.observer) this.observer.disconnect();
  }

  // Update cursor glows
  updateCursorGlow(event: MouseEvent) {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;
  }

  // Scroll listener for blur & progress
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const docElement = document.documentElement;
    const scrollTop = docElement.scrollTop || document.body.scrollTop;
    const scrollHeight = docElement.scrollHeight - docElement.clientHeight;

    this.scrollProgress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    this.isScrolled = scrollTop > 40;

    // Detect active section for navigation
    const sections = ['home', 'features', 'demo', 'courses', 'pricing', 'faq'];
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  // Toggle Theme
  toggleTheme() {
    if (this.themeMode === 'dark') {
      this.themeMode = 'light';
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    } else {
      this.themeMode = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }
    this.toastr.success(`Switched to ${this.themeMode} theme!`);
  }

  // Scroll to Anchor smoothly
  scrollToElement(id: string): void {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  // Typewriter Loop
  private runTypewriter() {
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const tickType = () => {
      const currentWord = this.words[wordIndex];
      if (isDeleting) {
        this.typewriterText = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        this.typewriterText = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let speed = isDeleting ? 30 : 60;

      if (!isDeleting && charIndex === currentWord.length) {
        speed = 2200; // wait before erasing
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % this.words.length;
        speed = 400; // wait before typing next
      }

      this.typewriterTimeout = setTimeout(tickType, speed);
    };

    tickType();
  }

  // Stats count up animation
  private statsTriggered = false;
  private triggerStatsCountUp() {
    if (this.statsTriggered) return;
    this.statsTriggered = true;

    this.animationService.animateNumber(0, this.targetStudents, 1500, (v) => {
      this.displayedStudents = v;
    });
    this.animationService.animateNumber(0, this.targetCompletion, 1500, (v) => {
      this.displayedCompletion = v;
    });
    this.animationService.animateNumber(0, this.targetCourses, 1500, (v) => {
      this.displayedCourses = v;
    });
  }

  // Interactive Product Demo tab controller
  selectDemoTab(index: number) {
    this.demoActiveTab = index;
    if (index === 0) {
      this.runChatSimulation();
    }
  }

  // Chat simulator
  private runChatSimulation() {
    if (this.chatSimTimeout) clearTimeout(this.chatSimTimeout);
    this.simulatedChatMessages = [
      { sender: 'user', text: 'How do Angular Signals work?' }
    ];
    this.simulatedChatInput = '';

    this.chatSimTimeout = setTimeout(() => {
      this.simulatedChatInput = 'Generating reply...';
      this.chatSimTimeout = setTimeout(() => {
        this.simulatedChatInput = '';
        this.simulatedChatMessages.push({
          sender: 'ai',
          text: 'Signals are reactive values that represent state. You initialize them with signal(), set values using .set(), and read values via count(). This avoids manual dependency tracking!'
        });
      }, 1500);
    }, 1200);
  }

  // Code compiler simulation
  compileSimulatedCode() {
    this.isCompilingCode = true;
    this.simulatedEditorOutput = 'Linking sandbox dependencies...';
    setTimeout(() => {
      this.simulatedEditorOutput = 'Compiling and executing code...';
      setTimeout(() => {
        this.simulatedEditorOutput = `[Compiler Output]
Initial count: 0
New count: 5

Execution finished successfully. 0 warnings.`;
        this.isCompilingCode = false;
      }, 1000);
    }, 800);
  }

  // Quiz simulator option select
  selectQuizOption(idx: number) {
    if (this.quizSubmitted) return;
    this.quizQuestionSelected = idx;
    if (idx === 1) {
      this.quizSubmitted = true;
    } else {
      this.toastr.error('Incorrect option. Try again!');
    }
  }

  resetQuizSimulation() {
    this.quizQuestionSelected = -1;
    this.quizSubmitted = false;
  }

  // FAQ Accordion toggler
  toggleFaq(index: number) {
    this.expandedFaq = this.expandedFaq === index ? -1 : index;
  }

  // AI Mascot triggers
  triggerMascotGreet() {
    this.mascotMinimized = false;
    this.showMascotBubble = true;
    const tips = [
      'Ready to study ASP.NET Clean architecture schemas? 🚀',
      'Need resume advice? Upload your file to our AI Analyzer page! 📄',
      'Waving hello! Let me know if you need learning tips. 🤖',
      'Pro tip: You can toggle Billing mode to Yearly to save 28% instantly! 💡'
    ];
    const rand = Math.floor(Math.random() * tips.length);
    this.mascotMessage = tips[rand];
  }

  minimizeMascot() {
    this.mascotMinimized = true;
  }

  // Interactive Demo Modal commands
  openDemoModalTab(tabIdx: number) {
    this.showDemoModal = true;
    this.demoModalActiveTab = tabIdx;
    this.customChatInputText = '';
    this.customDemoChats = [];
    this.customDemoAiReply = '';
  }

  sendCustomDemoChat() {
    if (!this.customChatInputText.trim()) return;
    this.customDemoChats.push({ sender: 'user', text: this.customChatInputText });
    const userMsg = this.customChatInputText.toLowerCase();
    this.customChatInputText = '';
    this.isCustomDemoReplying = true;
    this.customDemoAiReply = '';

    setTimeout(() => {
      this.isCustomDemoReplying = false;
      if (userMsg.includes('signal')) {
        this.customDemoAiReply = 'Signals establish a tracking graph. When a signal is updated (e.g. by set() or update()), any computed signal or effect reading it is automatically re-evaluated.';
      } else if (userMsg.includes('clean') || userMsg.includes('architecture')) {
        this.customDemoAiReply = 'Clean architecture places core enterprise rules (Domain entities) in the center. Web API layers and DB controllers reside on the outer rings, keeping domain code modular.';
      } else {
        this.customDemoAiReply = 'That sounds like an interesting topic! In our full modules, you get precise blockchain evaluations, sandboxed compiler outputs, and AI feedback loops on this exact concept.';
      }
    }, 1500);
  }

  runCustomSandbox() {
    this.isCustomCompiling = true;
    this.customSandboxOutput = 'Compiling TypeScript code...';
    setTimeout(() => {
      this.customSandboxOutput = `[Compiler Output]
XP Score: 180

Sandbox compilation successful.`;
      this.isCustomCompiling = false;
    }, 1400);
  }

  selectModalQuizOption(idx: number) {
    this.modalQuizSelected = idx;
    this.modalQuizSubmitted = true;
  }

  resetModalQuiz() {
    this.modalQuizSelected = -1;
    this.modalQuizSubmitted = false;
  }

  // Pricing toggler
  toggleBillingPeriod() {
    this.billingPeriod = this.billingPeriod === 'monthly' ? 'yearly' : 'monthly';
  }

  // Route transition helper using curtain animation overlay
  navigateWithTransition(route: string, queryParams?: any) {
    this.isTransitioning = true;
    setTimeout(() => {
      this.router.navigate([route], { queryParams }).then(() => {
        setTimeout(() => {
          this.isTransitioning = false;
        }, 150);
      });
    }, 450); // curtains slide up matching transition speed
  }

  // Auth logic helpers
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
      this.navigateWithTransition('/explore');
    } else {
      this.navigateWithTransition('/login');
    }
  }

  onStartTrial(): void {
    if (this.isAuthenticated()) {
      this.navigateWithTransition('/dashboard');
    } else {
      this.navigateWithTransition('/login', { mode: 'register' });
    }
  }

  onGetStarted(): void {
    if (this.isAuthenticated()) {
      this.navigateWithTransition('/dashboard');
    } else {
      this.navigateWithTransition('/login', { mode: 'register' });
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

  emailAddress = '';
  showLoginPrompt = false;

  // 3D Mouse Card Tilt Calculations
  onCardMouseMove(event: MouseEvent, cardWrapper: HTMLElement) {
    const card = cardWrapper.querySelector('.landing-card') as HTMLElement;
    if (!card) return;

    const rect = cardWrapper.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (centerY - y) / 15;
    const rotateY = (x - centerX) / 15;

    // Apply 3D perspective rotation matrix
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;

    // Set glow coordinates
    card.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
    card.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);
  }

  onCardMouseLeave(cardWrapper: HTMLElement) {
    const card = cardWrapper.querySelector('.landing-card') as HTMLElement;
    if (!card) return;
    // Reset transform transition
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }
}
