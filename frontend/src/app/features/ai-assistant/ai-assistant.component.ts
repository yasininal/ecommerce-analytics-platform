import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
    chartData?: any;
    timestamp: Date;
}

interface ChatResponse {
    answer: string;
    visualization_data?: string;
    error?: string;
}

@Component({
    selector: 'app-ai-assistant',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="page-content ai-page">
      <div class="section-header">
        <div>
          <h1>AI Data Assistant 🤖</h1>
          <p>Ask anything about your store data — I'll visualize it for you!</p>
        </div>
      </div>

      <div class="chat-wrapper">
        <!-- Bot Header -->
        <div class="bot-header">
          <div class="bot-avatar">🤖</div>
          <div>
            <p class="bot-name">DataPulse AI</p>
            <p class="bot-status"><span class="status-dot"></span> Online — Ready to analyze</p>
          </div>
        </div>

        <!-- Messages -->
        <div class="messages-area" #messagesArea>
          <!-- Welcome message -->
          <div class="message bot-message">
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble bot-bubble">
              <p>Hello! 👋 I'm your AI data assistant with <strong>real-time visualization</strong> capabilities!</p>
              <p style="margin-top:8px">I can analyze your data and create charts instantly. Try asking:</p>
              <ul class="suggestions-list">
                <li *ngFor="let s of suggestions" (click)="sendSuggestion(s)" class="suggestion-chip">
                  "{{ s }}"
                </li>
              </ul>
            </div>
          </div>

          <!-- Chat History -->
          <ng-container *ngFor="let msg of messages">
            <!-- User message -->
            <div class="message user-message" *ngIf="msg.role === 'user'">
              <div class="msg-bubble user-bubble">{{ msg.text }}</div>
              <div class="user-avatar">JD</div>
            </div>

            <!-- Bot message -->
            <div class="message bot-message" *ngIf="msg.role === 'bot'">
              <div class="msg-avatar">🤖</div>
              <div class="msg-bubble bot-bubble">
                <p style="white-space:pre-line">{{ msg.text }}</p>
                <!-- Chart visualization placeholder if data exists -->
                <div *ngIf="msg.chartData" class="chart-preview">
                  <div class="chart-mini-bars">
                    <div *ngFor="let b of getChartBars(msg.chartData)" class="chart-mini-bar" [style.height.%]="b.h" [style.background]="b.c"></div>
                  </div>
                  <p style="font-size:11px;color:var(--text-muted);margin-top:8px">📊 Visualization generated</p>
                </div>
              </div>
            </div>
          </ng-container>

          <!-- Typing indicator -->
          <div class="message bot-message" *ngIf="isLoading">
            <div class="msg-avatar">🤖</div>
            <div class="msg-bubble bot-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-bar">
          <input
            type="text"
            class="chat-input dp-input"
            placeholder="Ask me to analyze and visualize your data..."
            [(ngModel)]="inputText"
            (keyup.enter)="sendMessage()"
            [disabled]="isLoading"
          />
          <button class="send-btn" (click)="sendMessage()" [disabled]="isLoading || !inputText.trim()">
            <span *ngIf="!isLoading">➤</span>
            <span *ngIf="isLoading" class="spinner" style="width:16px;height:16px;margin:0"></span>
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .ai-page { padding: 28px 32px; height: 100%; display: flex; flex-direction: column; }
    .section-header { flex-shrink: 0; }

    .chat-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-top: 20px;
      min-height: 0;
    }

    .bot-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      background: var(--bg-elevated);
      flex-shrink: 0;
    }
    .bot-avatar {
      width: 44px; height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      display: flex; align-items: center; justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .bot-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .bot-status { font-size: 12px; color: var(--success); display: flex; align-items: center; gap: 6px; margin-top: 2px; }
    .status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--success); display: inline-block; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message { display: flex; align-items: flex-end; gap: 10px; max-width: 75%; }
    .bot-message { align-self: flex-start; }
    .user-message { align-self: flex-end; flex-direction: row-reverse; }

    .msg-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-light));
      display: flex; align-items: center; justify-content: center;
      font-size: 16px; flex-shrink: 0;
    }
    .user-avatar {
      width: 34px; height: 34px; border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8, var(--accent));
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }

    .msg-bubble { padding: 12px 16px; border-radius: var(--radius-lg); font-size: 13px; line-height: 1.6; }
    .bot-bubble {
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      color: var(--text-primary);
      border-bottom-left-radius: 4px;
    }
    .user-bubble {
      background: var(--accent);
      color: #fff;
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 15px rgba(124,92,252,0.35);
    }

    .suggestions-list { list-style: none; margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
    .suggestion-chip {
      background: rgba(124,92,252,0.12);
      border: 1px solid rgba(124,92,252,0.25);
      color: var(--accent-light);
      padding: 6px 12px;
      border-radius: 99px;
      font-size: 12px;
      cursor: pointer;
      transition: all var(--transition);
    }
    .suggestion-chip:hover { background: rgba(124,92,252,0.25); }

    /* Typing indicator */
    .typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
    .typing span { width: 7px; height: 7px; border-radius: 50%; background: var(--accent-light); animation: bounce 1.4s infinite ease-in-out; }
    .typing span:nth-child(1){animation-delay:0s}
    .typing span:nth-child(2){animation-delay:0.2s}
    .typing span:nth-child(3){animation-delay:0.4s}
    @keyframes bounce { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }

    /* Mini chart */
    .chart-preview { margin-top: 12px; background: var(--bg-card); border-radius: var(--radius-md); padding: 12px; border: 1px solid var(--border); }
    .chart-mini-bars { display: flex; align-items: flex-end; gap: 8px; height: 80px; }
    .chart-mini-bar { flex: 1; border-radius: 3px 3px 0 0; min-height: 10%; }

    /* Input */
    .chat-input-bar {
      display: flex;
      gap: 10px;
      padding: 16px 20px;
      border-top: 1px solid var(--border);
      background: var(--bg-elevated);
      flex-shrink: 0;
    }
    .chat-input { flex: 1; }
    .send-btn {
      width: 42px; height: 42px;
      border-radius: 50%;
      background: var(--accent);
      border: none;
      color: #fff;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: all var(--transition);
      flex-shrink: 0;
      box-shadow: 0 4px 15px rgba(124,92,252,0.35);
    }
    .send-btn:hover:not(:disabled) { background: var(--accent-light); transform: scale(1.05); }
    .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class AiAssistantComponent {
    inputText = '';
    isLoading = false;
    messages: ChatMessage[] = [];

    suggestions = [
        'Show sales by category',
        'Weekly revenue chart',
        'Top products performance',
        'Find negative reviews',
        'Customer distribution'
    ];

    constructor(private http: HttpClient) { }

    sendSuggestion(text: string) {
        this.inputText = text;
        this.sendMessage();
    }

    sendMessage() {
        const text = this.inputText.trim();
        if (!text || this.isLoading) return;

        this.messages.push({ role: 'user', text, timestamp: new Date() });
        this.inputText = '';
        this.isLoading = true;

        this.http.post<ChatResponse>('/chatbot/api/chat', { message: text }).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.messages.push({
                    role: 'bot',
                    text: res.answer || 'I processed your request.',
                    chartData: res.visualization_data || null,
                    timestamp: new Date()
                });
                this.scrollToBottom();
            },
            error: () => {
                this.isLoading = false;
                this.messages.push({
                    role: 'bot',
                    text: '⚠️ I had trouble connecting to the analysis engine. Please make sure the AI service is running and your GOOGLE_API_KEY is configured.',
                    timestamp: new Date()
                });
                this.scrollToBottom();
            }
        });
        this.scrollToBottom();
    }

    getChartBars(chartData: string): { h: number; c: string }[] {
        const colors = ['#7c5cfc', '#00c896', '#38bdf8', '#ffb547', '#ff5c7a'];
        return [65, 45, 80, 35, 90, 55, 70].map((h, i) => ({
            h,
            c: colors[i % colors.length]
        }));
    }

    private scrollToBottom() {
        setTimeout(() => {
            const el = document.querySelector('.messages-area');
            if (el) el.scrollTop = el.scrollHeight;
        }, 100);
    }
}
