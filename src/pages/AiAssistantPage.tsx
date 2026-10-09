import React, { useState, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Loader2,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AssistantMessage, BankingIntentResponse } from '../types';

function createWelcomeMessage(name?: string): AssistantMessage {
  const displayName = name ? name : 'there';
  return {
    id: 'msg_welcome',
    sender: 'assistant',
    text: `Hello ${displayName}! I am the FinTracker Banking & Personal Finance Assistant.\n\nEvery question is first classified through our custom-trained **BANKING77 Model** (TF-IDF + Linear SVM across 77 banking intent classes), and then enhanced by our private backend AI layer to deliver exact, technically precise answers tailored to Indian banking regulations and your active financial ledger.`,
    timestamp: 'Just now',
  };
}

const SUGGESTED_QUERIES = [
  'Why has my transfer not reached the recipient?',
  'Why was my debit card transaction declined?',
  'What is the cooling period after adding a beneficiary?',
  'How much did I spend this month?',
  'What is the daily UPI transfer limit?',
  'How do I report an unauthorized charge?',
  'How much should I save from my income?',
  'What is my investment risk profile?',
];

function formatInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono bg-slate-200/70 text-slate-900 px-1 py-0.5 rounded text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

const FormattedMessage: React.FC<{ content: string; isUser: boolean }> = ({ content, isUser }) => {
  if (isUser) {
    return <p className="whitespace-pre-wrap">{content}</p>;
  }

  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-0.5" />;

        // Horizontal divider *** or ---
        if (/^(\*{3,}|-{3,})$/.test(trimmed)) {
          return <hr key={idx} className="border-slate-200/80 my-2" />;
        }

        // Header ###
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-xs mt-3 mb-1 flex items-center gap-1.5 tracking-tight">
              {formatInlineText(trimmed.replace(/^###\s+/, ''))}
            </h4>
          );
        }

        // Header ##
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-slate-900 text-sm mt-3.5 mb-1.5 tracking-tight">
              {formatInlineText(trimmed.replace(/^##\s+/, ''))}
            </h3>
          );
        }

        // Bullet points (* or -)
        if (/^[\*\-]\s+/.test(trimmed)) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1">
              <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
              <span className="flex-1 text-slate-700">
                {formatInlineText(trimmed.replace(/^[\*\-]\s+/, ''))}
              </span>
            </div>
          );
        }

        // Numbered list items (1. 2. etc.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-1.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-mono font-bold text-white mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1 text-slate-700">
                {formatInlineText(numMatch[2])}
              </span>
            </div>
          );
        }

        return (
          <p key={idx} className="text-slate-800">
            {formatInlineText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const userName = user?.name ? user.name : 'there';

  const [messages, setMessages] = useState<AssistantMessage[]>(() => [createWelcomeMessage(user?.name)]);

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'msg_welcome') {
        return [createWelcomeMessage(user?.name)];
      }
      return prev;
    });
  }, [user?.name]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedIntents, setExpandedIntents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedIntents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Step 1: BANKING77 Intent Model (TF-IDF + Linear SVM) + Private Backend Gemini Enhancement
      const intentRes: BankingIntentResponse = await api.detectBankingIntent({
        query: userMsg.text,
      });

      // Step 2: Use enhanced Gemini explanation as primary exact answer
      let replyText =
        intentRes.explanation ||
        intentRes.contextual_answer ||
        intentRes.suggested_action ||
        `We have categorized your inquiry under ${intentRes.readable_intent}.`;

      // If intent didn't generate an explanation and query touches spending/trends, fallback to pipeline
      if (!intentRes.explanation) {
        const lower = userMsg.text.toLowerCase();
        if (lower.includes('increase') || lower.includes('spend') || lower.includes('expense') || lower.includes('save') || lower.includes('trend')) {
          try {
            const pipelineRes = await api.runUnifiedAiPipeline({
              query: userMsg.text,
              detected_intent: intentRes,
            });
            if (pipelineRes.answer) {
              replyText = pipelineRes.answer;
            }
          } catch {
            // Gracefully keep intent explanation
          }
        }
      }

      // Step 3: Present cohesive response with authoritative model metadata
      const assistantMsg: AssistantMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intentData: intentRes,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error resolving query intent';
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Query processing encountered an issue: ${msg}. Please try another query.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Banking Query Assistant
          </h2>
          <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            Model 4: BANKING77 SVM
          </span>
          <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 flex items-center gap-1">
            <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
            AI Enhanced
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Exact, definitive banking answers powered by custom TF-IDF + Linear SVM classifier (BANKING77) and private backend Gemini enhancement layer
        </p>
      </div>

      {/* Main Chat View */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col h-[640px]">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const isExpanded = expandedIntents[m.id];

            return (
              <div
                key={m.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[88%] sm:max-w-[80%] space-y-2 ${isUser ? 'items-end' : ''}`}>
                  {/* Bubble */}
                  <div
                    className={`rounded-xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-xs'
                        : 'bg-slate-50 text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <FormattedMessage content={m.text} isUser={isUser} />
                    <span
                      className={`block text-[10px] mt-2 font-mono ${
                        isUser ? 'text-slate-400 text-right' : 'text-slate-400'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>

                  {/* AI Understanding Badge & Accordion for Assistant message */}
                  {m.intentData && (
                    <div className="rounded-lg border border-slate-200 bg-white p-2.5 text-xs shadow-2xs space-y-2">
                      <button
                        onClick={() => toggleExpand(m.id)}
                        className="flex w-full items-center justify-between text-left text-slate-700 hover:text-slate-900 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <BrainCircuit className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-semibold text-slate-800">AI Understanding:</span>
                          <span className="text-slate-600 truncate max-w-[180px] sm:max-w-xs font-sans">
                            {m.intentData.readable_intent}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
                          {m.intentData.enhanced_by_ai !== false && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-sans">
                              <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                              Exact AI
                            </span>
                          )}
                          <span>{(m.intentData.confidence * 100).toFixed(0)}% Conf</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700">Underlying Model:</span>{' '}
                            <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[10px]">{m.intentData.model}</code>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Raw BANKING77 Intent:</span>{' '}
                            <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded text-[10px]">{m.intentData.intent}</code>
                          </div>
                          {m.intentData.suggested_action && (
                            <div className="rounded bg-slate-50 p-2 border border-slate-100 text-slate-700 mt-1">
                              <strong>Baseline Recommended Action:</strong> {m.intentData.suggested_action}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Enhanced with private backend Gemini reasoning layer & ledger facts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="rounded-lg bg-slate-100 px-3.5 py-2.5 border border-slate-200/60 shadow-2xs">
                Classifying intent via BANKING77 SVM and generating exact AI answer...
              </div>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/70 overflow-x-auto whitespace-nowrap">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-2">
            Suggested:
          </span>
          <div className="inline-flex gap-1.5">
            {SUGGESTED_QUERIES.map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-md border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask any banking or personal finance question (e.g. transfer delay, declined card, limits)..."
              className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-slate-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
