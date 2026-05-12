// ===================================
// CORONEL CHATBOX - IA POWERED
// Usa Claude API via Anthropic
// ===================================

class CoronelChatbox {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        this.createChatboxHTML();
        this.setupEventListeners();
        this.loadFromStorage();
    }

    getSystemPrompt() {
        return `Eres CORONEL BOT, el asistente virtual inteligente del portafolio académico del curso de Arquitectura de Software del profesor Jack Yhems Coronel Guevara de la Universidad UPLA (Universidad Peruana Los Andes), Huancayo, Perú.

Tu rol es ayudar a los estudiantes con:
- Información sobre las 4 unidades del curso:
  • Unidad 1 (Semanas 1-4): Fundamentos de Arquitectura de Software - conceptos base, estándares internacionales (ISO/IEC 25010), diseño arquitectónico, evaluación
  • Unidad 2 (Semanas 5-8): Creación de Arquitectura mediante POO - principios POO, modelado UML, implementación, evaluación
  • Unidad 3 (Semanas 9-12): Patrones Arquitectónicos - patrones de diseño, arquitectura en capas, microservicios, evaluación
  • Unidad 4 (Semanas 13-16): Evaluación y Optimización - métricas de calidad, optimización, documentación final
- Cómo subir archivos y trabajos en cada semana
- Cómo marcar semanas como completadas
- Navegación por el portafolio
- Dudas generales sobre arquitectura de software
- Contacto: q03478j@upla.edu.pe | +51 927125942

Responde siempre en español, de forma amable, directa y académica. Sé conciso (máximo 3-4 oraciones por respuesta). Si te preguntan sobre un PDF o documento subido, indica que puedes orientarles sobre el contenido del curso pero no tienes acceso directo a los archivos subidos por los estudiantes.`;
    }

    async sendToClaudeAPI(userMessage) {
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        });

        try {
            const response = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "claude-sonnet-4-20250514",
                    max_tokens: 1000,
                    system: this.getSystemPrompt(),
                    messages: this.conversationHistory
                })
            });

            const data = await response.json();
            const botReply = data.content?.[0]?.text || "Lo siento, no pude procesar tu mensaje. Intenta de nuevo.";

            this.conversationHistory.push({
                role: "assistant",
                content: botReply
            });

            // Keep history to last 10 messages to avoid token overflow
            if (this.conversationHistory.length > 10) {
                this.conversationHistory = this.conversationHistory.slice(-10);
            }

            return botReply;
        } catch (error) {
            console.error("Error API:", error);
            return "Estoy teniendo problemas de conexión. Por cualquier consulta escribe a q03478j@upla.edu.pe";
        }
    }

    createChatboxHTML() {
        const chatboxHTML = `
            <div class="coronel-chatbox" id="coronelChatbox">
                <div class="chat-toggle" id="chatToggle">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M21 11.5C21 16.75 16.75 21 11.5 21C10.39 21 9.33 20.81 8.34 20.46L3 22L4.54 16.66C4.19 15.67 4 14.61 4 13.5C4 8.25 8.25 4 13.5 4C16.73 4 19.55 5.68 21 8.23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <circle cx="10" cy="12" r="1" fill="currentColor"/>
                        <circle cx="14" cy="12" r="1" fill="currentColor"/>
                        <circle cx="18" cy="12" r="1" fill="currentColor"/>
                    </svg>
                    <span class="chat-badge">IA</span>
                </div>

                <div class="chat-window" id="chatWindow">
                    <div class="chat-header">
                        <div class="chat-header-info">
                            <div class="chat-avatar">
                                <img src="https://ui-avatars.com/api/?name=Coronel+Bot&background=0D8ABC&color=fff&size=128"
                                     alt="CORONEL BOT"
                                     style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                            </div>
                            <div>
                                <h4>CORONEL BOT</h4>
                                <span class="chat-status">✨ Potenciado con IA</span>
                            </div>
                        </div>
                        <button class="chat-close" id="chatClose">×</button>
                    </div>

                    <div class="chat-messages" id="chatMessages">
                        <div class="chat-message bot-message">
                            <div class="message-content">
                                👋 ¡Hola! Soy <strong>CORONEL BOT</strong>, tu asistente de IA para el curso de Arquitectura de Software. Puedo responder tus preguntas sobre el curso, las unidades, cómo subir archivos y más. ¿En qué te ayudo?
                                <div class="quick-replies">
                                    <button class="quick-reply" data-message="¿Qué contiene la Unidad 1?">📚 Unidad 1</button>
                                    <button class="quick-reply" data-message="¿Cómo subo mis archivos?">📤 Subir archivos</button>
                                    <button class="quick-reply" data-message="¿Cuáles son los temas de POO en arquitectura?">🏗️ POO</button>
                                    <button class="quick-reply" data-message="¿Cómo contacto al profesor?">📧 Contacto</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="chat-input-container">
                        <input type="text" id="chatInput" class="chat-input" placeholder="Escribe tu consulta...">
                        <button class="chat-send" id="chatSend">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', chatboxHTML);
    }

    setupEventListeners() {
        const toggle = document.getElementById('chatToggle');
        const close = document.getElementById('chatClose');
        const input = document.getElementById('chatInput');
        const send = document.getElementById('chatSend');

        toggle?.addEventListener('click', () => this.toggleChat());
        close?.addEventListener('click', () => this.closeChat());

        send?.addEventListener('click', () => this.handleSend());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-reply')) {
                const msg = e.target.dataset.message;
                if (msg) this.sendMessage(msg);
            }
        });
    }

    toggleChat() {
        this.isOpen ? this.closeChat() : this.openChat();
    }

    openChat() {
        this.isOpen = true;
        const window = document.getElementById('chatWindow');
        const toggle = document.getElementById('chatToggle');
        window?.classList.add('active');
        toggle?.classList.add('active');
        setTimeout(() => document.getElementById('chatInput')?.focus(), 300);
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('chatWindow')?.classList.remove('active');
        document.getElementById('chatToggle')?.classList.remove('active');
    }

    async handleSend() {
        const input = document.getElementById('chatInput');
        const message = input?.value.trim();
        if (!message || this.isTyping) return;
        input.value = '';
        await this.sendMessage(message);
    }

    async sendMessage(message) {
        this.addMessage(message, 'user');
        this.showTyping();
        this.isTyping = true;

        const reply = await this.sendToClaudeAPI(message);

        this.hideTyping();
        this.isTyping = false;
        this.addMessage(reply, 'bot');
        this.saveToStorage();
    }

    addMessage(text, sender) {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const div = document.createElement('div');
        div.className = `chat-message ${sender}-message`;
        div.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;

        this.messages.push({ sender, text, time: Date.now() });
    }

    showTyping() {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'chat-message bot-message typing-indicator';
        div.id = 'typingIndicator';
        div.innerHTML = `<div class="message-content"><span></span><span></span><span></span></div>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
    }

    hideTyping() {
        document.getElementById('typingIndicator')?.remove();
    }

    saveToStorage() {
        try {
            localStorage.setItem('coronel_chat', JSON.stringify(this.messages.slice(-20)));
        } catch(e) {}
    }

    loadFromStorage() {
        // Start fresh each session for a clean experience
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.coronelChatbox = new CoronelChatbox();
});
