"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Bot, Sparkles, X } from 'lucide-react';
import { AICHAT } from './AICHAT';

interface AIDrawerProps {
  trigger?: React.ReactNode;
}

export function AIDrawer({ trigger }: AIDrawerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Show trigger only if closed */}
      {!open && (trigger || (
        <Button
          variant="outline"
          className="hidden md:inline-flex gap-2"
          onClick={() => setOpen(true)}
        >
          <Bot className="w-4 h-4" />
          Ask AI
          <Sparkles className="w-3 h-3 text-emerald-500" />
        </Button>
      ))}

      {/* Simple chat window - no overlay, no animations */}
      {open && (
        <div className="fixed top-0 right-0 h-screen w-[26rem] bg-gray-100 border-l border-gray-200 z-50">
          {/* Close button - positioned to not interfere */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Chat content */}
          <AICHAT />
        </div>
      )}
    </>
  );
}
