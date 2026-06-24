import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layouts/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'explore', loadComponent: () => import('./features/courses/explore-courses/explore-courses.component').then(m => m.ExploreCoursesComponent) },
      { path: 'course/:id', loadComponent: () => import('./features/courses/course-details/course-details.component').then(m => m.CourseDetailsComponent) },
      { path: 'my-courses', loadComponent: () => import('./features/courses/my-courses/my-courses.component').then(m => m.MyCoursesComponent) },
      { path: 'course-player/:id', loadComponent: () => import('./features/courses/course-player/course-player.component').then(m => m.CoursePlayerComponent) },
      { path: 'certificates', loadComponent: () => import('./features/certificates/my-certificates/my-certificates.component').then(m => m.MyCertificatesComponent) },
      { path: 'ai-chat', loadComponent: () => import('./features/ai-chat/ai-chat.component').then(m => m.AiChatComponent) },
      { path: 'live-classes', loadComponent: () => import('./features/live-classes/live-classes.component').then(m => m.LiveClassesComponent) },
      { path: 'resume-analyzer', loadComponent: () => import('./features/ai-features/resume-analyzer.component').then(m => m.ResumeAnalyzerComponent) },
      { path: 'mock-interview', loadComponent: () => import('./features/ai-features/mock-interview.component').then(m => m.MockInterviewComponent) },
      { path: 'trainer/create-course', loadComponent: () => import('./features/courses/trainer-course-creator/trainer-course-creator.component').then(m => m.TrainerCourseCreatorComponent) },
      { path: 'trainer/create-lesson', loadComponent: () => import('./features/courses/trainer-lesson-creator/trainer-lesson-creator').then(m => m.TrainerLessonCreator) },
      { path: 'trainer/create-quiz', loadComponent: () => import('./features/courses/trainer-quiz-creator/trainer-quiz-creator').then(m => m.TrainerQuizCreator) },
      { path: 'admin', loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent) },
      { path: 'admin/diagnostics', loadComponent: () => import('./features/admin/diagnostics/diagnostics.component').then(m => m.DiagnosticsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];

