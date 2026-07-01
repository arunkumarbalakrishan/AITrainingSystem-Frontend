import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MarkdownModule } from 'ngx-markdown';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { AIService } from '../core/services/ai.service';
import { ThemeService } from '../core/services/theme.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    FormsModule,
    DragDropModule,
    MarkdownModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: [],
})
export class MainLayoutComponent implements OnInit {
  public authService = inject(AuthService);
  private notifyService = inject(NotificationService);
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private titleService = inject(Title);

  public themeService = inject(ThemeService);

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('notifyContainer') notifyContainer!: ElementRef;
  @ViewChild('profileContainer') profileContainer!: ElementRef;

  userName = 'User';
  userRole = 'Student';
  notifications: any[] = [];
  unreadCount = 0;
  showNotifyDropdown = false;
  showProfileDropdown = false;
  private isFirstNotifLoad = true;

  // Sidebar Dropdown & Mobile Toggle State
  showAiTools = false;
  showTrainerTools = false;
  isSidebarOpen = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Theme State
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  // Floating Mini-Chat State
  showMiniChat = false;
  miniChatHistory: { role: string; content: string; isCopied?: boolean }[] = [];
  miniChatInput = '';
  miniChatLoading = false;

  // Scroll to Top State
  showScrollToTop = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showScrollToTop = window.scrollY > 400;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (
      this.showNotifyDropdown &&
      this.notifyContainer &&
      !this.notifyContainer.nativeElement.contains(event.target)
    ) {
      this.showNotifyDropdown = false;
    }
    if (
      this.showProfileDropdown &&
      this.profileContainer &&
      !this.profileContainer.nativeElement.contains(event.target)
    ) {
      this.showProfileDropdown = false;
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcuts(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      if (event.key.toLowerCase() === 'k') {
        if (this.isDashboard) {
          event.preventDefault();
          setTimeout(() => {
            if (this.searchInput) {
              this.searchInput.nativeElement.focus();
            }
          });
        }
      } else if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        this.toggleMiniChat();
      }
    }
  }

  // Global Search
  globalSearchQuery = '';

  onGlobalSearch() {
    if (this.globalSearchQuery.trim()) {
      this.router.navigate(['/explore'], { queryParams: { q: this.globalSearchQuery.trim() } });
      this.globalSearchQuery = ''; // clear after searching
    }
  }

  toggleMiniChat() {
    this.showMiniChat = !this.showMiniChat;
  }

  sendMiniChat() {
    if (!this.miniChatInput.trim() || this.miniChatLoading) return;
    const question = this.miniChatInput.trim();
    this.miniChatHistory.push({ role: 'user', content: question });
    this.miniChatInput = '';
    this.miniChatLoading = true;
    this.cdr.detectChanges();

    // Use default Guid or mock course ID
    const mockCourseId = '00000000-0000-0000-0000-000000000000';
    this.aiService.askTutor(mockCourseId, question, this.miniChatHistory.slice(0, -1)).subscribe({
      next: (res: any) => {
        const reply = res.data || res.message || 'No reply from AI assistant.';
        this.miniChatHistory.push({ role: 'assistant', content: reply });
        this.miniChatLoading = false;
        this.aiService.saveMiniChatHistory(this.miniChatHistory);
        this.cdr.detectChanges();
      },
      error: () => {
        this.miniChatHistory.push({
          role: 'assistant',
          content: 'Could not connect to AI Assistant. Please try again.',
        });
        this.miniChatLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  clearMiniChat() {
    this.miniChatHistory = [];
    this.aiService.saveMiniChatHistory([]);
  }

  copyToClipboard(msg: any) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(msg.content).then(() => {
      msg.isCopied = true;
      setTimeout(() => {
        msg.isCopied = false;
        this.cdr.detectChanges();
      }, 2000);
      this.cdr.detectChanges();
    });
  }

  ngOnInit() {
    this.userName = this.authService.getUserName();
    this.userRole = this.authService.getUserRole();

    // Start SignalR Connection if authenticated
    if (this.authService.isAuthenticated()) {
      const token = this.authService.getToken();
      if (token) {
        this.notifyService.startConnection(token);
        
        // Listen for real-time notifications
        this.notifyService.realTimeNotification$.subscribe((notif: any) => {
          // Check if it already exists to avoid duplicates
          if (!this.notifications.some(n => n.id === notif.id)) {
            this.notifications.unshift(notif);
            this.unreadCount = this.notifications.filter(n => !n.isRead).length;
            this.toastr.success(notif.message, notif.title || 'New Notification', {
              timeOut: 8000,
              progressBar: true,
              closeButton: true,
            });
            this.cdr.detectChanges();
          }
        });
      }
    }

    // Dynamic Title Update & Notification Reload
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const pageTitle = this.getPageTitle();
      this.titleService.setTitle(`${pageTitle} - AITrainingSystem`);
      this.loadNotifications();
      this.isSidebarOpen = false;
    });

    // Set initial title on load
    this.titleService.setTitle(`${this.getPageTitle()} - AITrainingSystem`);

    this.loadNotifications();
    this.miniChatHistory = this.aiService.getMiniChatHistory();
  }

  get userNameDisplay(): string {
    const localProfile = localStorage.getItem('premium_user_profile');
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.fullName) return parsed.fullName;
      } catch (e) {}
    }
    return this.authService.getUserName();
  }

  get userRoleDisplay(): string {
    const localProfile = localStorage.getItem('premium_user_profile');
    if (localProfile) {
      try {
        const parsed = JSON.parse(localProfile);
        if (parsed.role) return parsed.role;
      } catch (e) {}
    }
    return this.authService.getUserRole() || 'Student';
  }

  getAvatarUrl(): string {
    const localAvatar = localStorage.getItem('premium_profile_avatar');
    if (localAvatar) return localAvatar;
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.userNameDisplay)}&backgroundColor=a3e635,84cc16,65a30d`;
  }


  toggleDarkMode(event: MouseEvent) {
    this.themeService.toggleTheme(event);
  }

  loadNotifications() {
    if (this.authService.isAuthenticated()) {
      this.notifyService.getNotifications().subscribe({
        next: (res: any) => {
          const newNotifs = (res.data || res || []).filter((n: any) => !n.isRead);

          if (!this.isFirstNotifLoad && newNotifs.length > this.notifications.length) {
            const existingIds = this.notifications.map((n) => n.id);
            const brandNew = newNotifs.filter((n: any) => !existingIds.includes(n.id));

            brandNew.forEach((n: any) => {
              this.toastr.success(n.message, n.title || 'New Notification', {
                timeOut: 8000,
                progressBar: true,
                closeButton: true,
              });
            });
          }

          this.notifications = newNotifs;
          this.unreadCount = this.notifications.length;
          this.isFirstNotifLoad = false;
        },
        error: () => {
          this.isFirstNotifLoad = false;
        },
      });
    }
  }

  toggleNotifyDropdown() {
    this.showNotifyDropdown = !this.showNotifyDropdown;
    if (this.showNotifyDropdown) {
      this.showProfileDropdown = false;
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.showProfileDropdown) {
      this.showNotifyDropdown = false;
    }
  }

  markAllAsRead(event: Event) {
    event.stopPropagation();
    if (this.notifications.length === 0) return;

    let completedCount = 0;
    const total = this.notifications.length;
    const listToMark = [...this.notifications];

    listToMark.forEach((n) => {
      this.notifyService.markAsRead(n.id).subscribe({
        next: () => {
          completedCount++;
          if (completedCount === total) {
            this.notifications = [];
            this.unreadCount = 0;
            this.showNotifyDropdown = false;
            this.toastr.success('All notifications marked as read.');
            this.cdr.detectChanges();
          }
        },
        error: () => {
          completedCount++;
          if (completedCount === total) {
            this.notifications = this.notifications.filter((x) => !x.isRead);
            this.unreadCount = this.notifications.length;
            this.cdr.detectChanges();
          }
        },
      });
    });
  }

  markAsRead(n: any) {
    if (n.isRead) return;
    this.notifyService.markAsRead(n.id).subscribe({
      next: () => {
        n.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);

        // Remove it from the UI completely
        this.notifications = this.notifications.filter((notif) => notif.id !== n.id);

        // Close dropdown if empty
        if (this.notifications.length === 0) {
          this.showNotifyDropdown = false;
        }
      },
    });
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to log out of your session?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6C63FF',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      background: this.isDarkMode ? '#0d1117' : '#ffffff',
      color: this.isDarkMode ? '#f0f6fc' : '#111827',
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.toastr.info('Logged out successfully');
      }
    });
  }

  get isDashboard(): boolean {
    return this.router.url.includes('/dashboard');
  }

  getPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/explore')) return 'Explore Courses';
    if (url.includes('/my-courses')) return 'My Learning';
    if (url.includes('/player')) return 'Course Player';
    if (url.includes('/admin')) return 'Admin Panel';
    if (url.includes('/certificates')) return 'Certificates';
    if (url.includes('/live-classes')) return 'Live Classes';
    if (url.includes('/resume-analyzer')) return 'Resume Analyzer';
    if (url.includes('/mock-interview')) return 'Mock Interview';
    if (url.includes('/profile')) return 'My Profile';
    return 'Training System';
  }
}
