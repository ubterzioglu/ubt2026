"use client";

import { useEffect } from "react";

interface SkillReadmeLangToggleProps {
  containerId: string;
}

/**
 * The embedded README is raw HTML injected via `dangerouslySetInnerHTML`,
 * so its own inline <script> (the EN/TR toggle) never executes — browsers
 * don't run <script> tags added that way. This re-implements the same
 * toggle behavior after hydration, driven by the README's existing
 * `data-lang` / `data-lang-btn` markup so the two stay in sync.
 */
export function SkillReadmeLangToggle({ containerId }: SkillReadmeLangToggleProps) {
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>("[data-lang-btn]")
    );

    function setLang(lang: string) {
      container?.querySelectorAll<HTMLElement>("[data-lang]").forEach((el) => {
        el.hidden = el.getAttribute("data-lang") !== lang;
      });
      buttons.forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.getAttribute("data-lang-btn") === lang));
      });
    }

    function handleClick(this: HTMLButtonElement) {
      const lang = this.getAttribute("data-lang-btn");
      if (lang) setLang(lang);
    }

    buttons.forEach((btn) => btn.addEventListener("click", handleClick));
    return () => {
      buttons.forEach((btn) => btn.removeEventListener("click", handleClick));
    };
  }, [containerId]);

  return null;
}
