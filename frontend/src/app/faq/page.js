"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";
import NextAction from "@/components/NextAction";
import styles from "./page.module.css";

const suggestions = [
  "Who can vote in Indian elections?",
  "How do I register to vote?",
  "What is NOTA?",
  "What documents do I need?",
  "What happens on election day?",
  "What is an EVM?",
];

export default function FAQPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [nextAction, setNextAction] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const ask = async (question) => {
    if (!question.trim()) return;
    const userMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await api.askFAQ(question);
      const botMsg = {
        role: "bot",
        content: data.answer,
        source: data.source,
        matched: data.matched_question,
      };
      setMessages((prev) => [...prev, botMsg]);
      // Capture next action from API
      if (data.next_action) {
        setNextAction({
          icon: data.next_action_icon,
          action: data.next_action,
          detail: data.next_action_detail,
          url: data.next_action_url,
        });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", content: "Sorry, couldn\u2019t get an answer. Is the backend running?", source: "error" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <div className="page-header">
          <span className="badge badge-green">Tool #4</span>
          <h1 className="heading-lg">FAQ <span className="text-gradient-green">Assistant</span></h1>
          <p>Type a question → get a clear answer instantly.</p>
        </div>

        {/* Next Action — shown after first answer */}
        {nextAction && (
          <NextAction
            icon={nextAction.icon}
            action={nextAction.action}
            detail={nextAction.detail}
            url={nextAction.url}
          />
        )}

        <div className={styles.chatContainer}>
          <div className={styles.chat} ref={chatRef} id="faq-chat">
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <span className={styles.welcomeIcon}>💬</span>
                <h3>Ask me anything about elections</h3>
                <p>Try one of these:</p>
                <div className={styles.suggestions}>
                  {suggestions.map((s) => (
                    <button key={s} className={styles.suggestion} onClick={() => ask(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`${styles.message} ${styles[msg.role]}`}>
                <div className={styles.msgBubble}>
                  <p>{msg.content}</p>
                  {msg.source && msg.source !== "error" && (
                    <span className={styles.msgSource}>
                      Source: {msg.source === "ai_explained" ? "AI-simplified" : msg.source === "stored" ? "Official data" : "Fallback"}
                      {msg.matched && ` • Matched: "${msg.matched}"`}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.bot}`}>
                <div className={styles.msgBubble}>
                  <div className={styles.typing}><span></span><span></span><span></span></div>
                </div>
              </div>
            )}
          </div>

          <form className={styles.inputBar} onSubmit={handleSubmit} id="faq-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about elections..."
              className={styles.input}
              disabled={loading}
              id="faq-input"
            />
            <button type="submit" className="btn btn-primary" disabled={!input.trim() || loading} id="faq-submit">
              Ask →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

