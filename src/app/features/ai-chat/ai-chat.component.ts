import {
  Component,
  inject,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { AIService } from '../../core/services/ai.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="chat-gpt-layout">
      <!-- Sidebar (Chat History) -->
      <div class="chat-sidebar">
        <button class="btn btn-new-chat mb-4" (click)="newChat()">
          <i class="bi bi-chat-left-text-fill me-2"></i>
          New Chat
        </button>
        <div class="sidebar-title">Saved Conversations</div>
        <div class="history-list">
          <div *ngIf="history.length === 0" class="text-muted small px-3 py-2">
            No saved chats yet.
          </div>
          <div
            *ngFor="let session of history"
            class="history-item d-flex justify-content-between align-items-center"
            [class.active]="activeChatId === session.id"
            (click)="loadChat(session.id)"
          >
            <div class="d-flex align-items-center gap-2 min-width-0">
              <i class="bi bi-chat-left text-muted small"></i>
              <span class="text-truncate">{{ session.title }}</span>
            </div>
            <button
              class="btn btn-sm btn-link text-muted p-0 ms-2 btn-delete-chat"
              (click)="deleteChat($event, session.id)"
              title="Delete Chat"
            >
              <i class="bi bi-trash3-fill"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main">
        <!-- Header -->
        <div class="chat-header" style="z-index: 10;">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center gap-3">
              <div class="header-avatar shadow-sm">
                <i class="bi bi-robot"></i>
              </div>
              <div>
                <h5 class="m-0 fw-bold chat-title">AITraining Assistant</h5>
                <span class="badge badge-tutor-status">
                  <span class="status-dot"></span> GPT-4.0 Smart Engine
                </span>
              </div>
            </div>
            <div>
              <button
                (click)="newChat()"
                class="btn btn-sm btn-light border d-md-none rounded-pill px-3 py-1.5"
              >
                <i class="bi bi-plus-lg me-1"></i> New
              </button>
            </div>
          </div>
        </div>

        <!-- Chat History Messages Scrollable Area -->
        <div class="chat-messages" #chatScroll>
          <!-- Empty State -->
          <div *ngIf="chatHistory.length === 0" class="empty-state animate-fade-in">
            <div class="logo-circle-wrapper mb-4">
              <div class="logo-circle">
                <i class="bi bi-robot text-primary" style="font-size: 2.2rem;"></i>
              </div>
              <div class="logo-circle-ring"></div>
            </div>
            <h3 class="fw-bold mb-2">How can I guide you today?</h3>
            <p class="text-muted text-center max-w-md px-4" style="font-size: 0.95rem;">
              Ask questions, write and review code, or request step-by-step learning roadmaps on
              your course topics.
            </p>
          </div>

          <!-- Messages -->
          <div
            *ngFor="let msg of chatHistory"
            class="message-row"
            [class.user]="msg.role === 'user'"
          >
            <div class="message-container" [class.user-container]="msg.role === 'user'">
              <!-- Robot Avatar for Assistant -->
              <div class="avatar assistant-avatar shadow-sm" *ngIf="msg.role === 'assistant'">
                <i class="bi bi-robot"></i>
              </div>

              <div class="message-bubble-wrapper" [class.user-bubble-wrapper]="msg.role === 'user'">
                <div class="message-sender-name">
                  {{ msg.role === 'user' ? 'You' : 'AITraining Assistant' }}
                </div>
                <div class="message-bubble" [class.user-bubble]="msg.role === 'user'">
                  <markdown
                    [data]="msg.content"
                    class="markdown-body mb-0"
                    *ngIf="msg.role === 'assistant'"
                  ></markdown>
                  <p *ngIf="msg.role === 'user'" class="mb-0">{{ msg.content }}</p>
                </div>
              </div>

              <!-- User Initials Avatar -->
              <div class="avatar user-avatar shadow-sm" *ngIf="msg.role === 'user'">
                <span>U</span>
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div *ngIf="aiLoading" class="message-row">
            <div class="message-container">
              <div class="avatar assistant-avatar shadow-sm">
                <i class="bi bi-robot"></i>
              </div>
              <div class="message-bubble-wrapper">
                <div class="message-sender-name">AITraining Assistant</div>
                <div class="message-bubble loading-bubble">
                  <div class="typing-indicator py-1">
                    <div class="typing-dot" style="background: var(--primary-color);"></div>
                    <div class="typing-dot" style="background: var(--primary-color);"></div>
                    <div class="typing-dot" style="background: var(--primary-color);"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="chat-input-area">
          <div class="chat-input-container">
            <div class="input-wrapper shadow-lg">
              <textarea
                [(ngModel)]="chatInput"
                (keyup.enter)="sendChat($event)"
                placeholder="Ask AI Assistant a question..."
                rows="1"
                class="form-control border-0 shadow-none chat-textarea"
                style="resize: none; background: transparent; padding: 14px 18px; font-size: 0.95rem;"
              ></textarea>
              <button
                (click)="sendChat()"
                class="btn btn-send-modern shadow"
                [disabled]="!chatInput.trim() || aiLoading"
              >
                <i class="bi bi-arrow-up-short" style="font-size: 1.6rem; line-height: 1;"></i>
              </button>
            </div>
            <p class="text-center text-muted mt-2 mb-0" style="font-size: 0.72rem; opacity: 0.8;">
              <i class="bi bi-shield-check me-1"></i> Powered by secure AI tutoring. Review code
              logic carefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .chat-gpt-layout {
        display: flex;
        height: calc(100vh - 120px);
        background-color: var(--card-bg);
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 15px 45px rgba(0, 0, 0, 0.08);
        border: 1px solid var(--border-color);
        font-family: 'Outfit', sans-serif;
      }
      .chat-sidebar {
        width: 280px;
        background: var(--sidebar-bg);
        color: var(--sidebar-text);
        display: flex;
        flex-direction: column;
        padding: 1.5rem 1rem;
        overflow-y: auto;
        border-right: 1px solid var(--border-color);
      }
      .btn-new-chat {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        border: none;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.85rem 1.2rem;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 4px 15px rgba(132, 204, 22, 0.3);
      }
      .btn-new-chat:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(132, 204, 22, 0.4);
        filter: brightness(1.1);
      }
      .sidebar-title {
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--sidebar-text-muted);
        text-transform: uppercase;
        letter-spacing: 1.5px;
        margin-bottom: 0.75rem;
        padding-left: 0.5rem;
      }
      .history-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .history-item {
        padding: 0.8rem 1rem;
        border-radius: 12px;
        cursor: pointer;
        font-size: 0.88rem;
        transition: all 0.2s ease;
        color: var(--sidebar-text-muted);
        background: transparent;
        border: 1px solid transparent;
      }
      .history-item:hover {
        background: rgba(132, 204, 22, 0.05);
        color: var(--primary-color);
      }
      .history-item.active {
        background: rgba(132, 204, 22, 0.1);
        border-color: rgba(132, 204, 22, 0.2);
        color: var(--primary-color);
        font-weight: 600;
      }
      .btn-delete-chat {
        opacity: 0;
        transition: all 0.2s ease;
        font-size: 0.9rem;
      }
      .history-item:hover .btn-delete-chat {
        opacity: 0.7;
      }
      .btn-delete-chat:hover {
        opacity: 1 !important;
        color: #ef4444 !important;
      }
      .chat-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
        background-color: var(--background-color);
      }
      .chat-header {
        padding: 1.25rem 2rem;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        background: var(--card-bg);
        backdrop-filter: blur(8px);
      }
      .header-avatar {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: rgba(132, 204, 22, 0.15);
        color: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        border: 1px solid rgba(132, 204, 22, 0.2);
      }
      .chat-title {
        font-size: 1.1rem;
        color: var(--text-dark);
        letter-spacing: -0.3px;
      }
      .badge-tutor-status {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
        font-size: 0.72rem;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 6px;
        margin-top: 2px;
      }
      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #10b981;
        box-shadow: 0 0 8px #10b981;
        animation: pulse-dot 2s infinite;
      }
      @keyframes pulse-dot {
        0% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
        }
        100% {
          transform: scale(0.95);
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
        }
      }
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .empty-state {
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: var(--text-dark);
      }
      .logo-circle-wrapper {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .logo-circle {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: var(--card-bg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        border: 1px solid var(--border-color);
        z-index: 2;
      }
      .logo-circle-ring {
        position: absolute;
        width: 110px;
        height: 110px;
        border: 2px dashed rgba(132, 204, 22, 0.3);
        border-radius: 50%;
        animation: spin-dashed 20s linear infinite;
        z-index: 1;
      }
      @keyframes spin-dashed {
        100% {
          transform: rotate(360deg);
        }
      }
      .message-row {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      .message-container {
        display: flex;
        gap: 1rem;
        max-width: 85%;
        align-items: flex-start;
      }
      .user-container {
        align-self: flex-end;
      }
      .avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-weight: 700;
        font-size: 0.9rem;
      }
      .assistant-avatar {
        background: rgba(132, 204, 22, 0.15);
        color: var(--primary-color);
        border: 1px solid rgba(132, 204, 22, 0.2);
      }
      .user-avatar {
        background: var(--primary-color);
        color: #fff;
        box-shadow: 0 4px 12px rgba(132, 204, 22, 0.35);
      }
      .message-bubble-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .user-bubble-wrapper {
        align-items: flex-end;
      }
      .message-sender-name {
        font-size: 0.75rem;
        font-weight: 600;
        color: #9ca3af;
        margin-left: 4px;
      }
      .user-bubble-wrapper .message-sender-name {
        margin-right: 4px;
        margin-left: 0;
      }
      .message-bubble {
        padding: 14px 20px;
        border-radius: 18px;
        font-size: 0.98rem;
        line-height: 1.6;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
        word-break: break-word;
      }
      .user-bubble {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: #fff;
        border-top-right-radius: 4px;
        box-shadow: 0 6px 18px rgba(132, 204, 22, 0.2);
      }
      .user-bubble p {
        color: #fff !important;
      }
      .message-bubble:not(.user-bubble) {
        background: var(--card-bg);
        color: var(--text-dark);
        border: 1px solid var(--border-color);
        border-top-left-radius: 4px;
      }
      .loading-bubble {
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        border-top-left-radius: 4px;
      }
      .chat-input-area {
        padding: 1.5rem 2rem 2rem 2rem;
        background: linear-gradient(to top, var(--card-bg) 70%, transparent 100%);
      }
      .chat-input-container {
        max-width: 850px;
        margin: 0 auto;
      }
      .input-wrapper {
        display: flex;
        align-items: center;
        background: var(--card-bg);
        border: 1px solid var(--border-color) !important;
        border-radius: 28px;
        padding: 6px 8px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06) !important;
      }
      .input-wrapper:focus-within {
        border-color: var(--primary-color) !important;
        box-shadow: 0 10px 30px rgba(132, 204, 22, 0.15) !important;
        transform: translateY(-2px);
      }
      .chat-textarea {
        color: var(--text-dark);
      }
      .chat-textarea:focus {
        outline: none;
        box-shadow: none;
      }
      .btn-send-modern {
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: #fff;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
      }
      .btn-send-modern:hover:not([disabled]) {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(132, 204, 22, 0.4);
        filter: brightness(1.1);
      }
      .btn-send-modern[disabled] {
        background: rgba(156, 163, 175, 0.15);
        color: #9ca3af;
        box-shadow: none;
        cursor: not-allowed;
      }
      /* Custom Scrollbar */
      .chat-sidebar::-webkit-scrollbar,
      .chat-messages::-webkit-scrollbar {
        width: 6px;
      }
      .chat-sidebar::-webkit-scrollbar-track,
      .chat-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      .chat-sidebar::-webkit-scrollbar-thumb,
      .chat-messages::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.15);
        border-radius: 10px;
      }
      .chat-sidebar:hover::-webkit-scrollbar-thumb,
      .chat-messages:hover::-webkit-scrollbar-thumb {
        background: rgba(150, 150, 150, 0.35);
      }
    `,
  ],
})
export class AiChatComponent implements AfterViewChecked {
  private aiService = inject(AIService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('chatScroll') private chatScrollContainer!: ElementRef;

  aiLoading = false;
  chatHistory: { role: string; content: string }[] = [];
  chatInput = '';
  chatCourseId = '00000000-0000-0000-0000-000000000000'; // Default

  history: any[] = [];
  activeChatId: string | null = null;

  ngOnInit() {
    this.loadHistory();
    if (this.history.length > 0) {
      this.loadChat(this.history[0].id);
    } else {
      this.newChat();
    }
  }

  loadHistory() {
    this.history = this.aiService.getChatSessions();
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

  newChat() {
    this.activeChatId = crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2);
    this.chatHistory = [];
    this.toastr.info('Started a new chat session.');
    this.cdr.detectChanges();
  }

  loadChat(id: string) {
    this.activeChatId = id;
    this.chatHistory = this.aiService.getChatSessionMessages(id) || [];
    this.cdr.detectChanges();
  }

  deleteChat(event: Event, id: string) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      this.aiService.deleteChatSession(id);
      this.loadHistory();
      if (this.activeChatId === id) {
        if (this.history.length > 0) {
          this.loadChat(this.history[0].id);
        } else {
          this.newChat();
        }
      }
      this.toastr.success('Chat deleted');
    }
  }

  sendChat(event?: Event) {
    if (event) {
      event.preventDefault(); // Prevent new line on enter
    }

    if (!this.chatInput.trim() || this.aiLoading) return;

    const question = this.chatInput.trim();
    this.chatHistory.push({ role: 'user', content: question });
    this.chatInput = '';
    this.aiLoading = true;

    // Scroll to bottom immediately
    setTimeout(() => this.scrollToBottom(), 50);

    this.aiService.askTutor(this.chatCourseId, question, this.chatHistory.slice(0, -1)).subscribe({
      next: (res: any) => {
        const reply = res.data || res.message || 'No response from AI.';
        this.chatHistory.push({ role: 'assistant', content: reply });
        this.aiLoading = false;

        // Save to local storage
        if (this.activeChatId) {
          const title =
            this.chatHistory.length >= 2
              ? this.chatHistory[0].content.substring(0, 30) + '...'
              : 'New Chat';
          this.aiService.saveChatSession(this.activeChatId, title, this.chatHistory);
          this.loadHistory();
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.chatHistory.push({
          role: 'assistant',
          content: 'An error occurred while connecting to the AI service. Please try again later.',
        });
        this.aiLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
