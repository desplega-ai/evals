"use client";

import { useState, useEffect, useRef } from "react";
import { ChallengeCard } from "./challenge-card";
import type { ChallengeWrapperProps } from "./types";

export function IFrameChallengeWrapper({ challenge, onComplete }: ChallengeWrapperProps) {
  const [iframeClicked, setIframeClicked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!challenge.completed && iframeClicked) {
      onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeClicked, onComplete]);

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.action === "button-clicked") {
        setIframeClicked(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const iframeContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; margin: 0; }
        .content { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h2 { margin-top: 0; color: #333; }
        h3 { color: #444; margin-top: 24px; }
        p { color: #666; line-height: 1.6; }
        .section { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
        button { padding: 8px 16px; margin: 10px 5px 10px 0; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; background: #3b82f6; color: white; }
        button:hover { background: #2563eb; }
        .hint { background: #fef3c7; padding: 12px; border-radius: 6px; border-left: 3px solid #f59e0b; color: #92400e; font-size: 13px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="content">
        <h2>IFrame Content</h2>
        <div class="section">
          <h3>About This Challenge</h3>
          <p>This iframe contains scrollable content. The interactive button you need to click is located further down. You must scroll within this iframe to find it.</p>
        </div>
        <div class="section">
          <h3>Instructions</h3>
          <p>AI agents often struggle with content inside iframes, especially when the target element is not immediately visible and requires scrolling within the iframe's own scroll context.</p>
          <p>This tests the ability to: switch into an iframe context, scroll within it, locate an element below the fold, and interact with it.</p>
        </div>
        <div class="section">
          <h3>Additional Context</h3>
          <p>Iframes create a separate browsing context with their own document, scroll position, and DOM tree. Automation tools need to explicitly switch into this context before they can interact with elements inside it.</p>
          <p>Scrolling within an iframe is distinct from scrolling the parent page -- the iframe has its own viewport and scrollbar.</p>
        </div>
        <div class="hint">
          <strong>Scroll down</strong> within this iframe to find the button you need to click.
        </div>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p>Click the button below to complete this part of the challenge:</p>
          <button onclick="window.parent.postMessage({action: 'button-clicked'}, '*'); this.textContent = '✓ Clicked'; this.style.background = '#16a34a';">Click Me Inside</button>
        </div>
      </div>
    </body>
    </html>
  `;

  return (
    <ChallengeCard
      title={challenge.name}
      completed={challenge.completed}
      checklist={[
        { text: "Scroll down inside the iframe to find the button", completed: iframeClicked },
        { text: "Click the button inside the iframe", completed: iframeClicked },
      ]}
    >
      <div className="space-y-4">
        <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-gray-50">
          <iframe
            ref={iframeRef}
            srcDoc={iframeContent}
            title="Interactive IFrame"
            style={{ width: "100%", height: "150px", border: "none" }}
          />
        </div>

        <p className="text-xs text-gray-600 text-center">
          {!iframeClicked && "Scroll down inside the iframe to find and click the hidden button"}
          {iframeClicked && "✓ Challenge complete!"}
        </p>
      </div>
    </ChallengeCard>
  );
}
