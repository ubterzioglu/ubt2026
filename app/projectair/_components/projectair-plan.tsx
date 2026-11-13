import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function nodeText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") return String(child);
      if (isValidElement<{ children?: ReactNode }>(child)) return nodeText(child.props.children);
      return "";
    })
    .join("");
}

function headingId(children: ReactNode): string {
  return nodeText(children)
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

const markdownComponents: Components = {
  h2: ({ children }) => (
    <h2
      id={headingId(children)}
      className="mt-2 scroll-mt-6 font-display text-[1.9rem] leading-tight tracking-[-0.02em] text-[#182724]"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={headingId(children)}
      className="mt-10 scroll-mt-6 border-t border-[#d1d8cf] pt-6 font-body text-xl font-semibold text-[#182724] sm:text-2xl"
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      id={headingId(children)}
      className="mt-7 scroll-mt-6 font-body text-base font-semibold text-[#182724]"
    >
      {children}
    </h4>
  ),
  p: ({ children }) => <p className="mt-3 break-words leading-7">{children}</p>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-1 pl-6">{children}</ol>,
  li: ({ children }) => <li className="break-words leading-7">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[#182724]">{children}</strong>,
  a: ({ href, children }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-[#205649] underline underline-offset-4 hover:text-[#102e28]"
      >
        {children}
      </a>
    );
  },
  table: ({ children }) => (
    <div className="mt-4 max-w-full overflow-x-auto rounded border border-[#d1d8cf]">
      <table className="w-full border-collapse bg-[#fffefa] text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="min-w-[110px] border border-[#d1d8cf] bg-[#e7eee4] px-3 py-2 text-left align-top font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="min-w-[110px] border border-[#d1d8cf] px-3 py-2 align-top">{children}</td>
  )
};

interface ProjectairPlanProps {
  markdown: string;
}

export function ProjectairPlan({ markdown }: Readonly<ProjectairPlanProps>) {
  return (
    <div className="text-[15px] text-[#2c3b36]">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
