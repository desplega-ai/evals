"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

if (typeof window !== "undefined") {
  if (!customElements.get("demo-counter")) {
    class DemoCounter extends HTMLElement {
      private count = 0;
      private countEl: HTMLSpanElement | null = null;

      connectedCallback() {
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `
          <style>
            :host { display: inline-flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-family: system-ui, sans-serif; }
            button { background: #2563eb; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 14px; cursor: pointer; }
            button:hover { background: #1d4ed8; }
            .count { font-variant-numeric: tabular-nums; color: #111827; font-weight: 600; }
          </style>
          <button type="button">Click me</button>
          <span class="count">0</span>
        `;
        this.countEl = root.querySelector("span.count");
        root.querySelector("button")!.addEventListener("click", () => {
          this.count += 1;
          if (this.countEl) this.countEl.textContent = String(this.count);
          this.dispatchEvent(
            new CustomEvent("count-changed", { detail: { count: this.count }, bubbles: true, composed: true })
          );
        });
      }
    }
    customElements.define("demo-counter", DemoCounter);
  }

  if (!customElements.get("secret-reveal")) {
    class SecretReveal extends HTMLElement {
      connectedCallback() {
        const root = this.attachShadow({ mode: "closed" });
        root.innerHTML = `
          <style>
            :host { display: inline-block; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-family: system-ui, sans-serif; }
            button { background: #7c3aed; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 14px; cursor: pointer; }
            button:hover { background: #6d28d9; }
          </style>
          <button type="button">Reveal secret</button>
        `;
        root.querySelector("button")!.addEventListener("click", () => {
          this.dispatchEvent(
            new CustomEvent("revealed", {
              detail: { secret: "The cake is a lie." },
              bubbles: true,
              composed: true,
            })
          );
        });
      }
    }
    customElements.define("secret-reveal", SecretReveal);
  }

  if (!customElements.get("rating-widget")) {
    class RatingWidget extends HTMLElement {
      private current = 0;

      connectedCallback() {
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `
          <style>
            :host { display: inline-flex; gap: 4px; }
            button { background: none; border: none; font-size: 24px; cursor: pointer; padding: 2px 4px; color: #d1d5db; line-height: 1; }
            button[data-active="true"] { color: #f59e0b; }
            button:hover { color: #fbbf24; }
          </style>
          ${[1, 2, 3, 4, 5]
            .map((n) => `<button type="button" data-star="${n}" aria-label="${n} star${n > 1 ? "s" : ""}">★</button>`)
            .join("")}
        `;
        root.querySelectorAll("button").forEach((btn) => {
          btn.addEventListener("click", () => {
            const n = Number((btn as HTMLButtonElement).dataset.star);
            this.current = n;
            root.querySelectorAll("button").forEach((b) => {
              const i = Number((b as HTMLButtonElement).dataset.star);
              (b as HTMLButtonElement).dataset.active = String(i <= n);
            });
            this.dispatchEvent(
              new CustomEvent("rating-changed", { detail: { rating: n }, bubbles: true, composed: true })
            );
          });
        });
      }
    }
    customElements.define("rating-widget", RatingWidget);
  }

  if (!customElements.get("user-card")) {
    class UserCard extends HTMLElement {
      connectedCallback() {
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `
          <style>
            :host { display: block; padding: 20px; border: 1px solid #d1d5db; border-radius: 12px; max-width: 360px; font-family: system-ui, sans-serif; background: #f9fafb; }
            .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #6366f1, #ec4899); display: inline-block; margin-right: 12px; vertical-align: middle; }
            .header { margin-bottom: 12px; }
            .name { font-size: 18px; font-weight: 600; color: #111827; }
            .label { font-size: 12px; color: #6b7280; margin-right: 8px; }
          </style>
          <div class="header">
            <span class="avatar"></span>
            <span class="name"><slot name="name">Anonymous</slot></span>
          </div>
          <div>
            <span class="label">Rate this user:</span>
            <rating-widget></rating-widget>
          </div>
        `;
      }
    }
    customElements.define("user-card", UserCard);
  }
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "demo-counter": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "secret-reveal": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "rating-widget": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      "user-card": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export default function ShadowDomPage() {
  const [count, setCount] = useState(0);
  const [secret, setSecret] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  const counterHostRef = useRef<HTMLDivElement>(null);
  const secretHostRef = useRef<HTMLDivElement>(null);
  const cardHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counterHost = counterHostRef.current;
    const secretHost = secretHostRef.current;
    const cardHost = cardHostRef.current;
    if (!counterHost || !secretHost || !cardHost) return;

    const onCount = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail;
      setCount(detail.count);
    };
    const onReveal = (e: Event) => {
      const detail = (e as CustomEvent<{ secret: string }>).detail;
      setSecret(detail.secret);
    };
    const onRating = (e: Event) => {
      const detail = (e as CustomEvent<{ rating: number }>).detail;
      setRating(detail.rating);
    };

    counterHost.addEventListener("count-changed", onCount);
    secretHost.addEventListener("revealed", onReveal);
    cardHost.addEventListener("rating-changed", onRating);

    return () => {
      counterHost.removeEventListener("count-changed", onCount);
      secretHost.removeEventListener("revealed", onReveal);
      cardHost.removeEventListener("rating-changed", onRating);
    };
  }, []);

  return (
    <div className="font-sans min-h-screen p-8">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Shadow DOM Demo</h1>
        <p className="text-gray-600 mb-8">
          Three custom-element widgets exercising open shadow roots, closed shadow roots, and
          nested shadow + slotted content. Outcomes mirror into the light DOM via{" "}
          <code className="text-sm bg-gray-100 px-1 rounded">data-testid</code> hooks.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Open shadow root</h2>
            <p className="text-gray-600 mb-4">
              <code className="text-sm bg-gray-100 px-1 rounded">&lt;demo-counter&gt;</code> uses{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">attachShadow(&#123; mode: &quot;open&quot; &#125;)</code>.
              The shadow is traversable via <code className="text-sm bg-gray-100 px-1 rounded">el.shadowRoot</code>,
              but visual clicks work either way.
            </p>
            <div ref={counterHostRef} className="flex items-center gap-4 flex-wrap">
              <demo-counter />
              <span className="text-sm text-gray-700">
                Light-DOM mirror:{" "}
                <span
                  data-testid="counter-mirror"
                  className="font-mono font-semibold text-gray-900"
                >
                  Count: {count}
                </span>
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Closed shadow root</h2>
            <p className="text-gray-600 mb-4">
              <code className="text-sm bg-gray-100 px-1 rounded">&lt;secret-reveal&gt;</code> uses{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">attachShadow(&#123; mode: &quot;closed&quot; &#125;)</code>.
              <code className="text-sm bg-gray-100 px-1 rounded">el.shadowRoot</code> is{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">null</code>; click the button to
              learn the secret via a composed <code className="text-sm bg-gray-100 px-1 rounded">CustomEvent</code>.
            </p>
            <div ref={secretHostRef} className="flex items-center gap-4 flex-wrap">
              <secret-reveal />
              <span className="text-sm text-gray-700">
                Light-DOM mirror:{" "}
                <span
                  data-testid="secret-mirror"
                  className="font-mono font-semibold text-gray-900"
                >
                  {secret ?? "(secret hidden)"}
                </span>
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Nested shadow DOM + slot</h2>
            <p className="text-gray-600 mb-4">
              <code className="text-sm bg-gray-100 px-1 rounded">&lt;user-card&gt;</code> (open
              shadow) renders a <code className="text-sm bg-gray-100 px-1 rounded">&lt;slot
              name=&quot;name&quot;&gt;</code> for a projected user name and embeds a{" "}
              <code className="text-sm bg-gray-100 px-1 rounded">&lt;rating-widget&gt;</code> with
              its own open shadow root.
            </p>
            <div ref={cardHostRef} className="flex items-center gap-6 flex-wrap">
              <user-card>
                <span slot="name">Taras</span>
              </user-card>
              <span className="text-sm text-gray-700">
                Light-DOM mirror:{" "}
                <span
                  data-testid="rating-mirror"
                  className="font-mono font-semibold text-gray-900"
                >
                  {rating === null ? "Selected rating: none" : `Selected rating: ${rating}`}
                </span>
              </span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
