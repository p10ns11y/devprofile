"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Send, Bot, User, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from "./ui/button";
import Link from 'next/link';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  displayedContent?: string;
  sections?: Array<{
    text: string;
    section: string;
    similarity: number;
  }>;
}

interface AICHATProps {
  submitAction: (question: string) => Promise<{ answer: string; details: any[] }>;
}

export default function AICHAT({ submitAction }: AICHATProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Streaming hook
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (streamingMessageId) {
      const streamingMessage = messages.find(m => m.id === streamingMessageId);
      if (!streamingMessage || !streamingMessage.content) {
        setStreamingMessageId(null);
        return;
      }

      const displayText = streamingMessage.content;
      setMessages(prev =>
        prev.map(msg =>
          msg.id === streamingMessageId
            ? { ...msg, displayedContent: '', isStreaming: true }
            : msg
        )
      );

      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex += 1;
        const currentText = displayText.slice(0, currentIndex);

        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === streamingMessageId
              ? {
                  ...msg,
                  displayedContent: currentText,
                  isStreaming: currentIndex < displayText.length
                }
              : msg
          )
        );

        if (currentIndex >= displayText.length) {
          clearInterval(interval);
          setStreamingMessageId(null);
        }
      }, 30); // Typing speed - slightly slower for visibility

      return () => clearInterval(interval);
    }
  }, [streamingMessageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentQuestion.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsLoading(true);

    try {
      const response = await submitAction(currentQuestion.trim());

      const aiMessageId = Date.now().toString() + '-ai';
      const aiMessage: Message = {
        id: aiMessageId,
        type: 'ai',
        content: response.answer,
        displayedContent: '',
        timestamp: new Date(),
        isStreaming: true,
        sections: response.details
      };

      setMessages(prev => [...prev, aiMessage]);
      setStreamingMessageId(aiMessageId);

      // Simulate streaming delay
      setTimeout(() => {
        setIsLoading(false);
      }, 100);

    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        type: 'ai',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const exampleQuestions = [
    "Tell me about yourself",
    "What is your experience with React?",
    "What are your biggest achievements?",
    "Give me a career overview",
    "Which projects are you working on?"
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Always at top */}
      <div className="flex items-center justify-between p-4 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                AI Assistant
              </h1>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Ask me anything about my background, experience, and skills
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Powered by Local AI</span>
        </div>
      </div>

      {/* Dynamic Layout */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          /* Welcome Screen - Centered */
          <div className="flex-1 flex flex-col justify-center items-center px-4 pb-16 pt-8">
            <div className="max-w-lg mx-auto text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome to my AI Assistant!
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  I have comprehensive knowledge about my professional background, including my career experience, skills, projects, and achievements.
                  Ask me anything and I'll provide detailed, personalized responses.
                </p>
              </motion.div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Try asking me about:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg">
                  {exampleQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(question)}
                      className="p-4 text-left bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                        {question}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Centered Input - Initial State */}
              <div className="flex-shrink-0 px-4 pt-6">
                <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                  <div className="relative">
                    <label htmlFor="question-input-initial" className="sr-only">Ask me anything about my professional background, skills, or experience</label>
                    <textarea
                      id="question-input-initial"
                      ref={inputRef}
                      value={currentQuestion}
                      onChange={(e) => setCurrentQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit(e);
                        }
                      }}
                      placeholder="Ask me anything about my professional background, skills, or experience..."
                      className="w-full px-4 py-4 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 resize-none min-h-[80px] max-h-40 overflow-hidden"
                      rows={1}
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !currentQuestion.trim()}
                      className="absolute right-2 top-2 p-2 rounded-lg bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-sm"
                      aria-label="Send message"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* Conversation View - Scrollable Messages */
          <>
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 max-w-2xl mx-auto min-h-0 flex flex-col justify-center space-y-6">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-md ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-rose-500 text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.type === 'ai' && message.isStreaming
                          ? (message.displayedContent || "") +
                            (Math.floor(Date.now() / 600) % 2 === 0 ? "|" : "")
                          : message.content
                        }
                      </p>
                      {(!message.isStreaming || message.displayedContent !== message.content) && (
                        <p className="text-xs mt-2 opacity-60">
                          {formatTime(message.timestamp)}
                        </p>
                      )}
                    </div>

                    {/* Show source sections for AI messages */}
                    {message.type === 'ai' && message.sections && message.sections.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {message.sections.slice(0, 3).map((section, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-500"
                          >
                            {section.section}
                            <span className="ml-1 text-xs opacity-60">
                              {(section.similarity * 100).toFixed(0)}%
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="max-w-md mr-12">
                    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form - Fixed at Bottom */}
            <div className="flex-shrink-0 border-t border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 backdrop-blur-md p-4">
              <div className="max-w-lg mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                  <textarea
                    ref={inputRef}
                    value={currentQuestion}
                    onChange={(e) => setCurrentQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask me anything about my professional background, skills, or experience..."
                    className="w-full px-4 py-4 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-gray-500 dark:focus:border-gray-400 resize-none min-h-[80px] max-h-40 overflow-hidden"
                    rows={1}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !currentQuestion.trim()}
                    className="absolute right-2 top-2 p-2 rounded-lg bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Press Enter to send, Shift+Enter for new line</span>
                  <span>Built with local AI models</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
