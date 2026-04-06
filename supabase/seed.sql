insert into public.featured_items (slug, category, title, summary, href, badge, sort_order, is_published)
values
  (
    'smellable',
    'tools',
    'Smellable',
    'A playful experiment about how images can trigger smell memory and imagination.',
    'https://ubterzioglu.de/smellable/index.html',
    'Experiment',
    10,
    true
  ),
  (
    'buyorbye',
    'tools',
    'BUYORBYE',
    'An English purchase decision tool for reducing regret and clarifying intent before buying.',
    'https://ubterzioglu.de/buyorbye/buyorbye.html',
    'Decision Tool',
    20,
    true
  ),
  (
    'zats',
    'tools',
    'ZATS',
    'An ATS-readability checker that highlights CV structure and wording issues.',
    'https://ubterzioglu.de/zats/zats.html',
    'Career Tool',
    30,
    true
  ),
  (
    'gen-z-understand-gen-y',
    'articles',
    'A Guide for Gen Z to Understand Gen Y',
    'A practical empathy-first article about how generations think, communicate, and collaborate at work.',
    'https://www.linkedin.com/pulse/guide-gen-z-understand-y-umut-bar%C4%B1%C5%9F-terzioglu-cxb8e',
    'LinkedIn',
    10,
    true
  ),
  (
    'perfect-order-flawed-free',
    'articles',
    'Perfect Order, or Flawed but Free Individuals?',
    'A reflective essay connecting science fiction ideas, freedom, and the tension between order and humanity.',
    'https://medium.com/@ubterzioglu/perfect-order-or-flawed-but-free-individuals-40aa3ae082cb',
    'Medium',
    20,
    true
  ),
  (
    'testing-in-the-age-of-ai',
    'articles',
    'Testing in the Age of AI',
    'Why software testing becomes even more critical when AI-generated code expands faster than quality ownership.',
    'https://www.linkedin.com/pulse/testing-age-ai-why-has-become-more-critical-umut-bar%C4%B1%C5%9F-terzioglu-ukqfe',
    'LinkedIn',
    30,
    true
  ),
  (
    'roadmap-sh',
    'bookmarks',
    'Roadmap.sh',
    'Clear learning roadmaps for engineering roles and technologies.',
    'https://roadmap.sh/',
    'Learning',
    10,
    true
  ),
  (
    'mdn-web-docs',
    'bookmarks',
    'MDN Web Docs',
    'Reliable documentation for HTML, CSS, JavaScript, and web standards.',
    'https://developer.mozilla.org/',
    'Docs',
    20,
    true
  ),
  (
    'hoppscotch',
    'bookmarks',
    'Hoppscotch',
    'Lightweight API exploration and debugging without the overhead of a desktop client.',
    'https://hoppscotch.io/',
    'API',
    30,
    true
  ),
  (
    'ghost-mouse',
    'apps',
    'Ghost Mouse',
    'A small utility that keeps your system active by moving the mouse automatically.',
    'https://drive.google.com/file/d/1jkWZcovcBWqn08p585dpsN2Rpv7HBOGW/view?usp=drive_link',
    'Desktop Utility',
    10,
    true
  ),
  (
    'ubt-testing',
    'private-projects',
    'UBT Testing',
    'A personal QA platform for sharing practical testing experience, tools, and quality thinking.',
    null,
    'Personal brand',
    10,
    true
  )
on conflict (slug) do update
set
  category = excluded.category,
  title = excluded.title,
  summary = excluded.summary,
  href = excluded.href,
  badge = excluded.badge,
  sort_order = excluded.sort_order,
  is_published = excluded.is_published;
