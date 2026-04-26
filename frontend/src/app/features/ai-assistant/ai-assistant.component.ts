import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';

interface ChatMessage {
    role: 'user' | 'bot';
    text: string;
    chartData?: any;
    chartType?: string;
    sqlQuery?: string;
    guardrail?: { type: string; trigger: string; action: string; };
    timestamp: Date;
}

interface ChatResponse {
    answer: string;
    visualization_code?: string;
    chart_type?: string;
    sql?: string;
    error?: string;
}

@Component({
    selector: 'app-ai-assistant',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="ai-dashboard-wrapper">
      <div class="sidebar-info">
        <div class="brain-card" [class.active-think]="isLoading">
          <div class="brain-icon">🧠</div>
          <h2>Data Brain AI</h2>
          <p>Analyzing your enterprise database in real-time. Ask questions naturally.</p>
          <div class="status-pill">
            <span class="pulse"></span> Active
          </div>
        </div>

        <div class="suggestion-group">
          <p class="section-tag">Quick Analytics</p>
          <button *ngFor="let s of suggestions" (click)="sendSuggestion(s)" class="s-btn">
             {{ s }}
          </button>
        </div>
      </div>

      <div class="chat-main-area">
        <div class="messages-scroll" #messagesArea>
          <div class="welcome-box">
             <div class="bot-ico">🤖</div>
             <h1>Pulse Intelligence</h1>
             <p>Welcome! I'm your NLP-powered analyst. I can cross-reference products, sales, and reviews to give you deep insights.</p>
          </div>

          <div *ngFor="let msg of messages" class="message-row" [class.user]="msg.role === 'user'">
             <div class="bubble-wrap">
               <div class="bubble">
                 <div class="text-content" *ngIf="!msg.guardrail">{{ msg.text }}</div>
                 
                 <!-- Dynamic Data Visualization -->
                 <div *ngIf="msg.chartData && getChartItems(msg.chartData).length > 0 && !msg.guardrail" class="visualization-container">
                    <!-- BAR CHART -->
                    <div *ngIf="msg.chartType === 'bar'" class="dynamic-chart bar-chart">
                       <div *ngFor="let item of getChartItems(msg.chartData) | slice:0:10" class="bar-group">
                          <div class="bar-val">{{ getChartValue(item) }}</div>
                          <div class="bar-body" [style.height.%]="getChartHeight(item, msg.chartData)"></div>
                          <div class="bar-label">{{ getChartLabel(item) }}</div>
                       </div>
                    </div>

                    <!-- PIE CHART -->
                    <div *ngIf="msg.chartType === 'pie'" class="dynamic-chart pie-chart-container">
                       <div class="pie-chart" [style.background]="getPieGradient(msg.chartData)"></div>
                       <div class="pie-legend">
                          <div *ngFor="let item of getChartItems(msg.chartData); let i = index" class="legend-item">
                             <span class="color-dot" [style.background]="getChartColor(i)"></span>
                             <span class="label">{{ getChartLabel(item) }} ({{ getChartValue(item) }})</span>
                          </div>
                       </div>
                    </div>

                    <!-- LINE CHART (SVG) -->
                    <div *ngIf="msg.chartType === 'line'" class="dynamic-chart line-chart-container">
                       <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" class="line-svg">
                          <path [attr.d]="getLinePath(msg.chartData)" fill="none" stroke="var(--accent)" stroke-width="2" class="line-path" />
                          <circle *ngFor="let p of getLinePoints(msg.chartData)" [attr.cx]="p.x" [attr.cy]="p.y" r="2" fill="white" stroke="var(--accent)" stroke-width="1" />
                       </svg>
                       <div class="line-labels">
                          <div *ngFor="let item of getChartItems(msg.chartData)" class="l-label">{{ getChartLabel(item) }}</div>
                       </div>
                    </div>
                 </div>

                 <!-- SQL Block -->
                 <div *ngIf="msg.sqlQuery && !msg.guardrail" class="sql-block">
                    <pre>{{ msg.sqlQuery }}</pre>
                 </div>

                 <!-- Guardrail Block -->
                 <div *ngIf="msg.guardrail" class="guardrail-block">
                    <div class="gr-header">
                       <span class="gr-badge">Guardrail Agent — ENGELLENDI</span>
                    </div>
                    <div class="gr-body">
                       <h4>⚠️ Yetki Dışı Erişim Girişimi / Güvenlik İhlali</h4>
                       <div class="gr-row"><span class="gr-label">Tespit türü</span><span class="gr-val">{{ msg.guardrail.type }}</span></div>
                       <div class="gr-row"><span class="gr-label">Tetikleyici</span><span class="gr-val">{{ msg.guardrail.trigger }}</span></div>
                       <div class="gr-row"><span class="gr-label">Eylem</span><span class="gr-val error-text">{{ msg.guardrail.action }}</span></div>
                    </div>
                    <p class="gr-footer">{{ msg.text }}</p>
                 </div>
               </div>
               <div class="time">{{ msg.timestamp | date:'shortTime' }}</div>
             </div>
          </div>

          <div class="typing-box" *ngIf="isLoading">
             <div class="dot"></div><div class="dot"></div><div class="dot"></div>
          </div>
        </div>

        <div class="input-container">
          <div class="input-bar">
            <input type="text" [(ngModel)]="inputText" (keyup.enter)="sendMessage()" placeholder="E.g. 'Show me a chart of sales by city' or 'List top 5 reviewed electronics'">
            <button (click)="sendMessage()" [disabled]="isLoading || !inputText.trim()" class="send-trigger">
              <span *ngIf="!isLoading">Analyze</span>
              <div class="spinner" *ngIf="isLoading"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .ai-dashboard-wrapper { display: grid; grid-template-columns: 320px 1fr; height: calc(100vh - var(--header-height)); background: var(--bg-base); }
    
    .sidebar-info { background: var(--bg-surface); border-right: 1px solid var(--border); padding: 40px 24px; display: flex; flex-direction: column; gap: 40px; }
    .brain-card { background: var(--bg-elevated); padding: 30px; border-radius: 24px; border: 1px solid var(--border); text-align: center; transition: all 0.3s; }
    .brain-card.active-think { border-color: var(--accent); box-shadow: 0 0 30px rgba(241,100,30,0.2); transform: scale(1.02); }
    .brain-icon { font-size: 64px; margin-bottom: 20px; }
    .brain-card h2 { font-size: 20px; font-weight: 800; margin: 0 0 10px 0; }
    .brain-card p { font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin: 0 0 20px 0; }
    .status-pill { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; color: #4ade80; background: rgba(74,222,128,0.1); padding: 6px 12px; border-radius: 99px; text-transform: uppercase; }
    .pulse { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 10px #4ade80; animation: p-anim 2s infinite; }
    @keyframes p-anim { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

    .suggestion-group { display: flex; flex-direction: column; gap: 12px; }
    .section-tag { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }
    .s-btn { background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-secondary); padding: 12px 16px; border-radius: 14px; text-align: left; cursor: pointer; font-size: 13px; transition: 0.2s; }
    .s-btn:hover { background: var(--accent-glow); color: var(--accent-light); border-color: var(--accent); }

    .chat-main-area { display: flex; flex-direction: column; height: 100%; position: relative; min-width: 0; }
    .messages-scroll { flex: 1; overflow-y: auto; padding: 60px; display: flex; flex-direction: column; gap: 40px; }
    
    .welcome-box { text-align: center; max-width: 600px; margin: 0 auto 60px; }
    .bot-ico { width: 80px; height: 80px; background: var(--accent); border-radius: 24px; display: flex; align-items: center; justify-content: center; font-size: 40px; margin: 0 auto 24px; box-shadow: 0 20px 40px rgba(241,100,30,0.3); }
    .welcome-box h1 { font-size: 32px; font-weight: 800; margin-bottom: 16px; min-width: 0; }
    .welcome-box p { color: var(--text-secondary); line-height: 1.6; }

    .message-row { display: flex; width: 100%; }
    .message-row.user { justify-content: flex-end; }
    .bubble-wrap { max-width: 70%; display: flex; flex-direction: column; gap: 8px; }
    .user .bubble-wrap { align-items: flex-end; }

    .bubble { background: var(--bg-surface); padding: 24px; border-radius: 24px; border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; }
    .user .bubble { background: var(--accent); color: white; border: none; box-shadow: 0 10px 30px rgba(241,100,30,0.3); }
    .text-content { font-size: 14px; line-height: 1.6; white-space: pre-line; word-break: break-word; }
    .time { font-size: 11px; color: var(--text-muted); }

    .dynamic-chart { margin-top: 30px; border-top: 1px solid var(--border); padding-top: 30px; display: flex; align-items: flex-end; gap: 12px; height: 200px; }
    .bar-chart { align-items: flex-end; }
    .bar-group { flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; gap: 10px; min-width: 0; }
    .bar-body { width: 100%; background: linear-gradient(180deg, var(--accent-light) 0%, var(--accent) 100%); border-radius: 6px; position: relative; min-height: 4px; transition: height 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .bar-val { font-size: 11px; font-weight: 800; }
    .bar-label { font-size: 10px; color: var(--text-muted); width: 100%; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .pie-chart-container { display: flex; align-items: center; justify-content: center; gap: 40px; height: auto; padding: 20px 0; }
    .pie-chart { width: 150px; height: 150px; border-radius: 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 4px solid var(--bg-surface); }
    .pie-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 10px; font-size: 12px; }
    .color-dot { width: 10px; height: 10px; border-radius: 2px; }
    .legend-item .label { color: var(--text-secondary); }

    .sql-block { background: #1a1a1a; padding: 12px; border-radius: 8px; margin-top: 16px; font-family: monospace; font-size: 11px; color: #a5b4fc; overflow-x: auto; border: 1px solid #333; }
    .guardrail-block { margin-top: 12px; border: 1px solid #ef4444; border-radius: 12px; overflow: hidden; background: rgba(239, 68, 68, 0.05); }
    .gr-header { padding: 12px 16px; border-bottom: 1px solid rgba(239, 68, 68, 0.2); }
    .gr-badge { background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 99px; text-transform: uppercase; }
    .gr-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
    .gr-body h4 { margin: 0 0 8px 0; color: #ef4444; font-size: 13px; font-weight: 700; }
    .gr-row { display: flex; font-size: 12px; }
    .gr-label { width: 100px; color: var(--text-muted); }
    .gr-val { flex: 1; color: var(--text-primary); font-weight: 600; }
    .error-text { color: #ef4444; }
    .gr-footer { margin: 0; padding: 12px 16px; background: rgba(239, 68, 68, 0.1); font-size: 12px; color: var(--text-primary); font-weight: 500; border-top: 1px solid rgba(239, 68, 68, 0.2); }

    .line-chart-container { position: relative; width: 100%; padding-bottom: 20px; }
    .line-svg { height: 120px; filter: drop-shadow(0 10px 15px rgba(241,100,30,0.2)); overflow: visible; }
    .line-labels { display: flex; justify-content: space-between; margin-top: 15px; }
    .l-label { font-size: 9px; color: var(--text-muted); transform: rotate(-30deg); transform-origin: top left; }
    .line-path { stroke-dasharray: 500; stroke-dashoffset: 500; animation: draw 2s forwards; }
    @keyframes draw { to { stroke-dashoffset: 0; } }

    .input-container { padding: 40px 60px; background: linear-gradient(0deg, var(--bg-base) 0%, transparent 100%); }
    .input-bar { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 20px; padding: 10px 10px 10px 24px; display: flex; align-items: center; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .input-bar input { flex: 1; background: transparent; border: none; color: var(--text-primary); font-size: 15px; outline: none; }
    .send-trigger { background: var(--accent); color: white; border: none; padding: 14px 28px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; }
    .send-trigger:hover:not(:disabled) { background: var(--accent-light); transform: translateY(-2px); }

    .typing-box { display: flex; gap: 6px; padding: 20px 40px; }
    .dot { width: 8px; height: 8px; background: var(--accent); border-radius: 50%; animation: t-anim 1.4s infinite; opacity: 0.4; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes t-anim { 0%,100%{transform:scale(1);opacity:0.4} 50%{transform:scale(1.3);opacity:1} }
  `]
})
export class AiAssistantComponent {
    inputText = '';
    isLoading = false;
    messages: ChatMessage[] = [];

    suggestions: string[] = [];

    sessionId = Math.random().toString(36).substring(7);
    @ViewChild('messagesArea') private messagesArea!: ElementRef;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.setRoleBasedSuggestions();
    }

    setRoleBasedSuggestions() {
        const role = this.authService.getUserRole();
        
        if (role === 'ROLE_INDIVIDUAL') {
            this.suggestions = [
                'Son verdiğim siparişi ve detaylarını göster',
                'Bu ay toplam ne kadar harcama yaptım?',
                'En çok hangi kategoriden ürün aldım?',
                'Bekleyen siparişlerimin durumu nedir?',
                'Aldığım ürünlere verdiğim puan ortalaması?',
                'Aylık harcama trendimi grafik olarak göster'
            ];
        } else if (role === 'ROLE_CORPORATE') {
            this.suggestions = [
                'En çok satan 5 ürünüm hangisi?',
                'Stoku 10\'un altına düşen ürünlerimi listele',
                'Bekleyen siparişlerimin toplam değeri nedir?',
                'Mağazamın aylık gelir trendini grafik göster',
                'Ürünlerime gelen negatif yorumlar neler?',
                'En sadık 5 müşterim kimler?'
            ];
        } else {
            // ADMIN
            this.suggestions = [
                'Tüm sistemin aylık ciro trendini göster',
                'En çok satış yapan ilk 3 mağaza hangisi?',
                'Şehirlere göre satış dağılımı nedir?',
                'Hangi kategoride iade oranı en yüksek?',
                'Sistemdeki toplam kullanıcı ve mağaza sayısı?',
                'Son 7 günde kazanılan yeni müşteri sayısı?'
            ];
        }
    }


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

        this.http.post<ChatResponse>('/api/ai/ask', { 
            message: text,
            userId: this.authService.getUserId(),
            role: this.authService.getUserRole(),
            sessionId: this.sessionId 
        }).subscribe({

            next: (res) => {
                this.isLoading = false;
                let grData = undefined;
                if (res.error && res.error.startsWith('{')) {
                    try { grData = JSON.parse(res.error); } catch(e) {}
                }

                this.messages.push({
                    role: 'bot',
                    text: res.answer || 'I processed your request.',
                    chartData: res.visualization_code || null,
                    chartType: res.chart_type || 'none',
                    sqlQuery: res.sql || '',
                    guardrail: grData,
                    timestamp: new Date()
                });
                this.scrollToBottom();
            },
            error: () => {
                this.isLoading = false;
                this.messages.push({
                    role: 'bot',
                    text: '⚠️ I had trouble connecting to the analysis engine.',
                    timestamp: new Date()
                });
                this.scrollToBottom();
            }
        });
        this.scrollToBottom();
    }

    getChartItems(chartData: any): any[] {
        if (!chartData) return [];
        if (typeof chartData === 'string') {
            try { return JSON.parse(chartData); } catch(e) { return []; }
        }
        return Array.isArray(chartData) ? chartData : [];
    }

    getChartValue(item: any): number {
        // Find the first key that has a numeric value or can be parsed as a number
        const key = Object.keys(item).find(k => {
            const val = item[k];
            return typeof val === 'number' || (!isNaN(parseFloat(val)) && isFinite(val));
        });
        if (!key) return 0;
        const val = item[key];
        return typeof val === 'number' ? val : parseFloat(val);
    }
    
    getChartLabel(item: any): string {
        // Find the first key that is NOT a number (likely a label/name)
        const key = Object.keys(item).find(k => {
            const val = item[k];
            return typeof val === 'string' && isNaN(parseFloat(val));
        });
        return key ? item[key] : 'Label';
    }

    getChartHeight(item: any, data: any): number {
        const items = this.getChartItems(data);
        const val = this.getChartValue(item);
        const max = Math.max(...items.map(d => this.getChartValue(d)), 1);
        return (val / max) * 100;
    }

    getChartColor(index: number): string {
        const colors = ['#f1641e', '#38bdf8', '#00c896', '#7c5cfc', '#ffb547', '#ff5c7a', '#a5b4fc', '#4ade80'];
        return colors[index % colors.length];
    }

    getPieGradient(data: any): string {
        const items = this.getChartItems(data);
        const total = items.reduce((sum, item) => sum + this.getChartValue(item), 0);
        let currentPct = 0;
        const slices = items.map((item, i) => {
            const pct = (this.getChartValue(item) / total) * 100;
            const start = currentPct;
            currentPct += pct;
            return `${this.getChartColor(i)} ${start}% ${currentPct}%`;
        });
        return `conic-gradient(${slices.join(', ')})`;
    }

    getLinePoints(data: any): {x: number, y: number}[] {
        const items = this.getChartItems(data);
        if (items.length === 0) return [];
        const max = Math.max(...items.map(d => this.getChartValue(d)), 1);
        const step = 100 / (items.length - 1 || 1);
        return items.map((d, i) => ({
            x: i * step,
            y: 100 - (this.getChartValue(d) / max) * 100
        }));
    }

    getLinePath(data: any): string {
        const points = this.getLinePoints(data);
        if (points.length === 0) return '';
        return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    }

    private scrollToBottom() {
        setTimeout(() => {
            if (this.messagesArea) {
                this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
            }
        }, 100);
    }
}
