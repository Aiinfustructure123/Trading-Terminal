"use client";

import { useId, useMemo, useState } from "react";
import { X } from "lucide-react";

import type { CompositeScore, ScoreComponent } from "@/lib/datasources/types";
import { clamp, cn } from "@/lib/utils";

type ConvictionRingProps = {
  score: CompositeScore;
  size?: number;
  strokeWidth?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
};

const toneStroke: Record<ScoreComponent["tone"], string> = {
  signal: "var(--signal)",
  profit: "var(--profit)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  neutral: "var(--muted)",
};

export function ConvictionRing({
  score,
  size = 72,
  strokeWidth,
  interactive = true,
  className,
  label = "Conviction score",
}: ConvictionRingProps) {
  const titleId = useId();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const actualStroke = strokeWidth ?? Math.max(2, Math.round(size * 0.09));
  const radius = (size - actualStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const gap = size < 28 ? 1.5 : 4;
  const center = size / 2;
  const showText = size >= 48;
  const showLabel = size >= 96;

  const segments = useMemo(() => {
    const totalWeight = score.components.reduce((sum, component) => sum + component.weight, 0) || 1;
    let cursor = 0;

    return score.components.map((component) => {
      const share = component.weight / totalWeight;
      const length = Math.max(0, circumference * share - gap);
      const start = cursor + gap / 2;
      cursor += circumference * share;
      return { component, length, start };
    });
  }, [circumference, gap, score.components]);

  const activeComponent =
    score.components.find((component) => component.key === activeKey) ?? score.components[0];

  return (
    <>
      <div className={cn("relative inline-grid place-items-center", className)}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby={titleId}
          className="overflow-visible"
        >
          <title id={titleId}>
            {label}: {score.value} out of 100
          </title>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={actualStroke}
          />
          <g transform={`rotate(-90 ${center} ${center})`}>
            {segments.map(({ component, length, start }) => {
              const isActive = activeKey === component.key;
              const normalizedScore = clamp(component.score / 100, 0.08, 1);
              const dimmed = activeKey && !isActive;

              return (
                <circle
                  key={component.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={toneStroke[component.tone]}
                  strokeWidth={isActive ? actualStroke + 1.5 : actualStroke}
                  strokeDasharray={`${length * normalizedScore} ${circumference}`}
                  strokeDashoffset={-start}
                  strokeLinecap="round"
                  opacity={dimmed ? 0.28 : 0.95}
                  className={cn(
                    "transition-all duration-150",
                    interactive ? "cursor-pointer" : "pointer-events-none",
                  )}
                  tabIndex={interactive ? 0 : -1}
                  role={interactive ? "button" : undefined}
                  aria-label={`${component.label}: ${component.score} score, ${Math.round(
                    component.weight * 100,
                  )}% weight`}
                  onMouseEnter={() => setActiveKey(component.key)}
                  onMouseLeave={() => setActiveKey(null)}
                  onFocus={() => setActiveKey(component.key)}
                  onBlur={() => setActiveKey(null)}
                  onClick={() => interactive && setIsOpen(true)}
                  onKeyDown={(event) => {
                    if (!interactive) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setIsOpen(true);
                    }
                  }}
                />
              );
            })}
          </g>
        </svg>
        {showText ? (
          <button
            type="button"
            className={cn(
              "absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-center",
              interactive ? "cursor-pointer" : "pointer-events-none",
            )}
            style={{ width: size * 0.48, height: size * 0.48 }}
            aria-label={`Open score breakdown for ${label}`}
            onClick={() => interactive && setIsOpen(true)}
          >
            <span className="number text-[0.95rem] font-bold leading-none text-ink">{score.value}</span>
            {showLabel ? <span className="eyebrow mt-1 block text-[8px]">Score</span> : null}
          </button>
        ) : null}
        {interactive && size >= 72 && activeComponent ? (
          <div className="pointer-events-none absolute top-full z-10 mt-2 w-48 rounded-xl border border-line bg-bg/95 p-3 text-left shadow-panel">
            <p className="eyebrow mb-1">{activeComponent.label}</p>
            <p className="text-xs text-muted">{activeComponent.reasoning}</p>
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-bg/72 p-4 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Score breakdown"
        >
          <div className="max-h-[86vh] w-full max-w-2xl overflow-auto rounded-3xl border border-line bg-panel/95 shadow-panel">
            <header className="flex items-start justify-between gap-4 border-b border-line p-5">
              <div>
                <p className="eyebrow mb-2">Explainable score</p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em]">Conviction breakdown</h2>
                <p className="mt-2 max-w-xl text-sm text-muted">{score.explanation}</p>
              </div>
              <button
                type="button"
                className="rounded-full border border-line p-2 text-muted transition hover:border-signal/50 hover:text-signal"
                onClick={() => setIsOpen(false)}
                aria-label="Close score breakdown"
              >
                <X size={18} />
              </button>
            </header>
            <div className="grid gap-3 p-5">
              {score.components.map((component) => (
                <article key={component.key} className="rounded-2xl border border-line bg-white/[0.025] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow mb-2">{component.label}</p>
                      <p className="text-sm text-muted">{component.reasoning}</p>
                    </div>
                    <div className="number text-right text-sm">
                      <p className="text-ink">{component.score}/100</p>
                      <p className="text-muted">{Math.round(component.weight * 100)}% weight</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {component.inputs.map((input) => (
                      <div key={input.label} className="rounded-xl border border-line bg-bg/50 p-3">
                        <p className="eyebrow mb-2">{input.label}</p>
                        <p className="number text-sm text-ink">{input.value}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
