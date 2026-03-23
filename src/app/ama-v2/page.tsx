'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Send, Bot, User, Sparkles, ArrowLeft, MessageSquare, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Shimmer } from '@/components/ai-elements/shimmer';

export default function AMAv2() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat();
  const isLoading = status === 'streaming';

  const exampleQuestions = [
    "Tell me about yourself",
    "What is your experience with React?",
    "What are your biggest achievements?",
    "Give me a career overview",
    "Which projects are you working on?"
  ];

  return (
    <div className="min-h-screen bg-surface1 text-text1">
      <div className="pt-20"></div> {/* Spacer for fixed header */}
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-surface1/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2 hover:bg-surface2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-accent-primary-text" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-accent-secondary border-2 border-surface1"></div>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-text1">
                    AI Assistant v2
                  </h1>
                  <p className="text-sm text-text2">
                    Powered by AI SDK v6 + Workflow DevKit
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs">
                <Zap className="w-3 h-3" />
                Online
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-4">
        {messages.length === 0 ? (
          /* Welcome Screen - AI Elements Style */
          <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center">
            <div className="max-w-2xl mx-auto text-center space-y-8">
              {/* Hero Section */}
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-accent-primary flex items-center justify-center shadow-2xl">
                    <MessageSquare className="w-10 h-10 text-accent-primary-text" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-secondary flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-accent-secondary-text" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <Shimmer as="h1" className="text-4xl font-bold text-text1 mb-2">
                      Welcome to AI Assistant v2
                    </Shimmer>
                    <p className="text-lg text-text2 max-w-lg mx-auto leading-relaxed">
                      Ask me anything about professional background, skills, experience, and projects. I use advanced AI with semantic search for accurate, contextual responses.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="group bg-surface1 rounded-xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent-primary transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-3 group-hover:bg-accent-primary/20 transition-colors">
                    <Bot className="w-5 h-5 text-accent-primary" />
                  </div>
                  <h3 className="font-semibold text-text1 mb-2">Smart Responses</h3>
                  <p className="text-sm text-text2">Context-aware answers using Claude's advanced reasoning and conversation memory</p>
                </div>

                <div className="group bg-surface1 rounded-xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent-primary transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-3 group-hover:bg-accent-primary/20 transition-colors">
                    <Zap className="w-5 h-5 text-accent-primary" />
                  </div>
                  <h3 className="font-semibold text-text1 mb-2">Real-time Streaming</h3>
                  <p className="text-sm text-text2">Live response streaming with Workflow DevKit durability and error recovery</p>
                </div>

                <div className="group bg-surface1 rounded-xl p-6 shadow-lg border border-border hover:shadow-xl hover:border-accent-primary transition-all duration-300 hover:-translate-y-1">
                  <div className="w-10 h-10 rounded-lg bg-accent-primary/10 flex items-center justify-center mb-3 group-hover:bg-accent-primary/20 transition-colors">
                    <MessageSquare className="w-5 h-5 text-accent-primary" />
                  </div>
                  <h3 className="font-semibold text-text1 mb-2">Rich Formatting</h3>
                  <p className="text-sm text-text2">Markdown rendering with code blocks, lists, and professional formatting</p>
                </div>
              </div>

              {/* Quick Start Questions */}
              <div className="space-y-6">
                <div className="text-center">
                  <Shimmer as="h2" className="text-xl font-semibold text-text1 mb-2">
                    Try asking me about:
                  </Shimmer>
                  <p className="text-text2">
                    Click any question below to get started
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage({ text: question })}
                      className="group p-4 bg-surface1 rounded-xl border border-border hover:border-accent-primary hover:shadow-lg transition-all duration-200 text-left"
                    >
                      <p className="text-sm text-text2 group-hover:text-text1 font-medium">
                        {question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Section */}
              <div className="max-w-xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({ text: input });
                      setInput('');
                    }
                  }}
                  className="relative"
                >
                  <div className="relative bg-surface1 rounded-2xl border border-border shadow-lg focus-within:border-accent-primary focus-within:ring-4 focus-within:ring-accent-primary/10 transition-all hover:shadow-xl">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                          }
                        }
                      }}
                      placeholder="Ask me about my experience, skills, projects, or career journey..."
                      className="w-full px-4 py-4 pr-14 bg-transparent text-text1 placeholder-text3 focus:outline-none resize-none min-h-[60px] max-h-32 leading-relaxed"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="absolute right-3 top-3 p-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 disabled:bg-surface3 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4 text-accent-primary-text" />
                    </button>
                  </div>
                  <p className="text-xs text-text3 mt-2 text-center">
                    Press Enter to send • Built with AI Elements design patterns
                  </p>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Interface - AI Elements Style */
          <div className="space-y-6">
            {/* Messages */}
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center shadow-md">
                        <Bot className="w-4 h-4 text-accent-primary-text" />
                      </div>
                    </div>
                  )}

                  <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-accent-primary text-accent-primary-text'
                          : 'bg-surface1 border border-border text-text1'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => (
                                <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="mb-2 ml-4 list-disc space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="mb-2 ml-4 list-decimal space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="text-sm">{children}</li>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-text1">
                                  {children}
                                </strong>
                              ),
                              code: ({ children }) => (
                                <code className="bg-surface2 px-1.5 py-0.5 rounded text-xs font-mono text-text1">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-surface2 p-3 rounded-lg overflow-x-auto text-xs font-mono mb-2 text-text1">
                                  {children}
                                </pre>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-lg font-bold mb-3 text-text1 leading-tight">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-base font-bold mb-2 text-text1 leading-tight">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-sm font-bold mb-2 text-text1 leading-snug">
                                  {children}
                                </h3>
                              ),
                            }}
                          >
                            {message.parts.map((part, i) => {
                              switch (part.type) {
                                case 'text':
                                  return part.text;
                                default:
                                  return '';
                              }
                            }).join('')}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.parts.map((part, i) => {
                            switch (part.type) {
                              case 'text':
                                return <span key={i}>{part.text}</span>;
                              default:
                                return null;
                            }
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-text3 mt-2 px-1">
                      {new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-surface3 flex items-center justify-center shadow-md">
                        <User className="w-4 h-4 text-text1" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center shadow-md">
                      <Bot className="w-4 h-4 text-accent-primary-text" />
                    </div>
                  </div>
                  <div className="bg-surface1 border border-border rounded-2xl px-4 py-3 shadow-sm">
                    <Shimmer as="span" className="text-sm text-text2">
                      AI is analyzing your question and preparing a thoughtful response...
                    </Shimmer>
                  </div>
                </div>
              )}
            </div>

            {/* Input - Fixed at Bottom */}
            <div className="sticky bottom-0 bg-surface1/80 backdrop-blur-xl border-t border-border -mx-4 px-4 py-4">
              <div className="max-w-3xl mx-auto">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim()) {
                      sendMessage({ text: input });
                      setInput('');
                    }
                  }}
                  className="relative"
                >
                  <div className="relative bg-surface1 rounded-2xl border border-border shadow-lg focus-within:border-accent-primary focus-within:ring-4 focus-within:ring-accent-primary/10 transition-all hover:shadow-xl">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                          }
                        }
                      }}
                      placeholder="Ask me about my experience, skills, projects, or career journey..."
                      className="w-full px-4 py-4 pr-14 bg-transparent text-text1 placeholder-text3 focus:outline-none resize-none min-h-[60px] max-h-32 leading-relaxed"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="absolute right-3 top-3 p-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 disabled:bg-surface3 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                      <Send className="w-4 h-4 text-accent-primary-text" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-text3">
                    <span>Press Enter to send, Shift+Enter for new line</span>
                    <span>Built with AI Elements design patterns</span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
