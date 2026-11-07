# Audit Report: https://ubterzioglu.de

**16 pages**
Generated: 2026-10-24T14:56:56.428Z
_This published report is a summary: each issue lists up to 10 example pages and 5 items beside its true counts. The complete list is not stored with this report: audit the site with the squirrel CLI and run `squirrel report --format json` for every page._

## Editor's Summary

_Auto-generated editor's summary — informational, not scored._

Bottom line: the site is reachable across all 16 pages crawled, but its overall health is held back by accessibility and image problems. Accessibility is the weak spot: 12 checks fail, including broken ARIA relationships, unnamed or inconsistently labelled form fields, and invalid definition-list markup. There are also oversized images and extensive performance warnings.

There are solid foundations in crawlability, mobile, site integrity, internationalization and local SEO. The main follow-up is to fix the accessibility errors and image delivery, then address repeated metadata and schema issues. This is the first audit, so there is no change to report.

**Verdict:** The site has strong crawlability and mobile foundations, but accessibility failures and image and performance issues need attention.

## Priorities

1. **Fix the accessibility errors** (Moderate)
   These issues account for 12 failing accessibility checks and can make page content and forms difficult to use with assistive technology.  
   In the React components, correct duplicate ARIA IDs, make label text match accessible names, give every input a clear label, and repair the definition-list structure.

2. **Route images through Next.js image tooling** (Moderate)
   The audit found an oversized image, while image delivery and loading also contribute to the site's performance risks.  
   Use Next.js \`next/image\` for images so they receive responsive sizes, modern formats and lazy loading by default; set \`fetchpriority="high"\` on the LCP image and never lazy-load it.

3. **Correct page metadata and business identity** (Moderate)
   Repeated title and description warnings, missing Open Graph tags, and entity-identity and LocalBusiness schema findings weaken how pages are presented and identified.  
   Update the page metadata and structured data in the Next.js page or layout metadata and schema output: write distinct titles and descriptions, add Open Graph tags, and provide consistent entity identity and LocalBusiness details.

4. **Add a deliberate AI crawler policy** (Quick win)
   Publishing a clear list of key pages and making an explicit crawler-access decision gives AI systems a defined way to discover the site's content.  
   Publish \`/llms.txt\` listing key pages, serve Markdown versions of content pages where the platform allows, and choose which AI crawlers may read the site.

5. **Use Turnstile on public forms** (Moderate)
   The site has form-label findings, so public forms should also use a CAPTCHA that avoids sending visitor data to Google.  
   Use Cloudflare Turnstile as the only CAPTCHA on every public form and remove other CAPTCHA providers.

## Health Score: 54/100 (F)

| Category | Score |
| --- | --- |
| Accessibility | 48% |
| Images | 44% |
| Structured Data | 83% |
| Performance | 51% |
| Core SEO | 47% |
| Content | 54% |
| Agent Experience | 45% |
| Security | 81% |
| Links | 86% |
| E-E-A-T | 70% |
| Crawlability | 97% |
| Legal Compliance | 44% |
| Blocking | 83% |
| Mobile | 94% |
| Analytics | 100% |
| Internationalization | 100% |
| Site Integrity | 100% |
| Local SEO | 100% |
| Reliability | 100% |
| Social Media | 100% |
| URL Structure | 100% |

## Summary

| Metric | Value |
| --- | --- |
| Pages | 16 |
| Passed | 1694 |
| Warnings | 172 |
| Failed | 14 |

## Issues

### Structured Data

#### Entity Identity
> Finds an Organization, LocalBusiness, Person or WebSite declared on many pages with no @id to tie the declarations together
- [X] **entity-identity**: 1 entity is declared on several pages with no @id
  (5 pages)
  - /
  - ... +4 more pages

#### LocalBusiness Schema
> Validates LocalBusiness schema for local SEO
- [!] **local-business-address**: Address incomplete (+5 more pages)
  (6 pages)
  - /geo/berlin
  - /geo/dortmund
  - /geo/frankfurt
  - /geo/germany
  - /geo/hamburg
  - ... +1 more pages

#### Structured Data Coverage Outlier
> Finds pages missing the structured data the rest of their page type carries
- [!] **coverage-outlier**: 2 of 16 page(s) are missing structured data their same-type siblings have (faq BreadcrumbList+FAQPage+Person+ProfessionalService+ProfilePage+WebSite, profile Person+ProfilePage+WebSite)
  (2 pages)
  - /
  - ... +1 more pages

### Images

#### Image File Size Too Large
> Checks for image files that exceed recommended size limits
- [X] **image-file-size**: 2 image(s) exceed 1.0 MB
  (5 pages)
  - /buyorbye
  - ... +4 more pages

#### Image Dimensions
> Checks for width/height attributes (prevents CLS)
- [!] **image-dimensions**: 6 image(s) missing width/height (causes CLS) (+7 more pages)
  (8 pages)
  - /
  - /book-appointment
  - /buyorbye
  - /buyorbyetr
  - /holiday
  - ... +3 more pages

### Accessibility

#### Duplicate ID ARIA
> Checks that IDs used in ARIA attributes are unique
- [X] **duplicate-id-aria**: 1 problematic ID(s) in ARIA attributes (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### ARIA Input Field Name
> Checks that input fields have accessible names
- [X] **aria-input-field-name**: 1 input field(s) without accessible names
  (1 pages)
  - /zats

#### Definition List Structure
> Checks that definition lists contain only dt and dd elements
- [X] **definition-list**: 1 definition list(s) with invalid structure (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### Definition List Item
> Checks that dt and dd elements are inside a dl
- [X] **dlitem**: 10 dt/dd element(s) not inside a dl (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### Label Content Name Mismatch
> Checks that visible label text is part of accessible name
- [X] **label-content-name-mismatch**: 1 element(s) where visible text doesn't match accessible name (+2 more pages)
  (3 pages)
  - /
  - /book-appointment
  - /smellable

#### Form Labels
> Checks that form inputs have associated labels
- [X] **form-labels**: 1 form input(s) without labels (+1 more pages)
  (2 pages)
  - /smellable
  - /zats

#### Autocomplete Tokens
> Checks that name, email, phone, address and payment fields carry the correct autocomplete token
- [!] **autocomplete-tokens**: 3 identified field(s) missing an autocomplete token (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### Multiple Labels
> Checks that form fields don't have multiple labels
- [!] **form-field-multiple-labels**: 6 input(s) with multiple labels
  (1 pages)
  - /buyorbyetr

#### Redundant Image Alt
> Checks that image alt text is not redundant with surrounding text
- [!] **image-redundant-alt**: 6 image(s) with redundant alt text (+2 more pages)
  (3 pages)
  - /
  - /book-appointment
  - /zats

#### Input Types
> Checks that fields use the right input type and keyboard hint, and that forms keep native validation
- [!] **enterkeyhint**: 2 multi-field form(s) set no enterkeyhint (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### Link Text
> Checks for descriptive link text
- [!] **link-text-generic**: 1 link(s) with generic text (+1 more pages)
  (2 pages)
  - /zats
  - /zpath

#### Skip Link
> Checks for bypass mechanisms for keyboard navigation
- [!] **skip-link**: No bypass mechanism for repetitive content (+6 more pages)
  (7 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /holiday
  - /smellable
  - ... +2 more pages

### Core SEO

#### Twitter Cards
> Validates Twitter Card meta tags
- [!] **twitter-card**: summary_large_image card requires an image (+13 more pages)
  (14 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /geo
  - /geo/berlin
  - ... +9 more pages

#### Meta Title
> Validates page title presence and length
- [!] **meta-title**: Title too short (+4 more pages)
  (5 pages)
  - /blog
  - /geo/berlin
  - /geo/dortmund
  - /geo/frankfurt
  - /geo/hamburg

#### Meta Description
> Validates meta description presence and length
- [!] **meta-description**: Description too short (+8 more pages)
  (9 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /geo/dortmund
  - /geo/frankfurt
  - ... +4 more pages

#### Open Graph Tags
> Validates Open Graph meta tags for social sharing
- [!] **og-image**: Missing og:image - social shares will lack imagery (+13 more pages)
  (14 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /geo
  - /geo/berlin
  - ... +9 more pages

#### Title Uniqueness
> Checks that page titles are unique across the site
- [!] **title-unique**: 1 duplicate title(s) affecting 2 pages
  (2 pages)
  - /
  - ... +1 more pages

### Security

#### Third-Party Cookies
> Detects third-party resources that may set cookies
- [!] **tracking-domains**: 1 known tracking domain(s) detected (+1 more pages)
  (2 pages)
  - /geo/berlin
  - /zpath

#### Content Security Policy
> Checks for Content-Security-Policy header and validates directives
- [!] **csp-missing**: No Content-Security-Policy header

#### HSTS Header
> Checks for HTTP Strict Transport Security header
- [!] **hsts**: Missing Strict-Transport-Security header

#### Subresource Integrity
> Checks that cross-origin scripts and stylesheets use Subresource Integrity (SRI)
- [!] **sri**: 2 cross-origin resource(s) without Subresource Integrity (+1 more pages)
  (2 pages)
  - /geo/berlin
  - /zpath

#### X-Frame-Options
> Checks for clickjacking protection header
- [!] **x-frame-options**: No clickjacking protection

#### Form CAPTCHA
> Checks for CAPTCHA protection on public forms
- [!] **form-captcha**: 1 public form(s) without CAPTCHA (+2 more pages)
  (3 pages)
  - /
  - /book-appointment
  - /smellable

#### security.txt
> Checks for a valid RFC 9116 security.txt so security researchers know how to report a vulnerability
- [!] **security-txt**: No security.txt at /.well-known/security.txt (RFC 9116 vulnerability-disclosure contact)

### Internationalization

#### Hreflang Tags
> Checks for hreflang link elements
- [!] **hreflang-self**: No self-referencing hreflang found
  (1 pages)
  - /book-appointment

### Agent Experience

#### llms.txt
> Detects /llms.txt (and /llms-full.txt) at the domain root and checks its basic Markdown format — an emerging standard giving AI agents a curated, machine-readable map of your site
- [!] **llms-txt-present**: No /llms.txt found — consider adding one so AI agents can discover your key content

#### Markdown Response
> Checks whether the site serves text/markdown via content negotiation (Accept: text/markdown) or exposes a .md variant of the homepage — agents increasingly prefer clean Markdown over rendered HTML
- [!] **markdown-response**: No Markdown response — consider honoring Accept: text/markdown or publishing a .md variant so agents get clean content

#### Token Weight
> Estimates the LLM token cost of a page's raw HTML and reports the text-to-HTML ratio — how much of that cost is actual content versus markup, scripts, and styles
- [!] **token-weight-budget**: Raw HTML exceeds a generous 100,000-token budget for a single page fetch — too heavy for an agent's context window (+1 more pages)
  (2 pages)
  - /
  - /book-appointment
- [!] **token-weight-ratio**: Visible text is under 15% of the page HTML — agents pay token cost mostly for markup, scripts, and styles (+15 more pages)
  (16 pages)
  - /
  - /blog
  - /book-appointment
  - /buyorbye
  - /buyorbyetr
  - ... +11 more pages

#### Archive Indexing
> Checks whether the site is present in the Wayback Machine and the Common Crawl index — the archives that feed AI training corpora and agent discovery pipelines
- [!] **common-crawl-indexed**: Site is not in the Common Crawl index — Common Crawl feeds the training corpora of the major AI labs, so the site is invisible to models trained on it
- [!] **wayback-archived**: Site has no Wayback Machine snapshot — the Internet Archive has never captured it, a strong signal the archive crawlers can't reach or discover it

### Crawlability

#### Canonical Chain
> Checks for redirect chains on canonical URLs
- [!] **page-redirect-chain**: Page redirects before content is served
  (1 pages)
  - /book-appointment

#### Sitemap Coverage
> Checks for indexable pages that are not in the sitemap
- [!] **sitemap-coverage**: 6 indexable page(s) not in sitemap (38%)
  (6 pages)
  - /buyorbye
  - /buyorbyetr
  - /holiday
  - /smellable
  - /zats
  - ... +1 more pages

### Links

#### Orphan Pages
> Detects pages with no internal links pointing to them
- [!] **orphan-pages**: 2 orphan page(s) with <2 incoming links
  (2 pages)
  - /blog
  - /book-appointment

#### Internal Links
> Validates internal link count
- [!] **internal-links**: Too few internal links (0, min 1)
  (1 pages)
  - /smellable

#### No Contextual Inbound Links
> Detects pages whose only internal inbound links come from sitewide chrome (nav, header, footer, sidebar)
- [!] **no-contextual-inbound**: 1 page(s) are linked only from sitewide chrome
  (1 pages)
  - /geo

#### Redirect Chains
> Detects URLs that redirect and links pointing to redirects
- [!] **redirect-pages**: 1 page(s) redirect to another URL
  (1 pages)
  - /book-appointment

#### Dead-End Pages
> Pages with no outgoing internal links, potentially trapping users
- [!] **dead-end**: Page has no outgoing internal links (dead-end)
  (1 pages)
  - /smellable

### Content

#### Duplicate Title
> Checks for duplicate title tags across the site
- [!] **duplicate-title**: 1 duplicate title(s) found across 2 pages
  (2 pages)
  - /
  - ... +1 more pages

#### Duplicate Description
> Checks for duplicate meta descriptions across the site
- [!] **duplicate-description**: 1 duplicate description(s) found across 2 pages
  (2 pages)
  - /
  - ... +1 more pages

#### Keyword Stuffing
> Detects excessive keyword repetition in content
- [!] **keyword-stuffing**: 5 word(s) may be overused (+7 more pages)
  (8 pages)
  - /geo
  - /geo/berlin
  - /geo/dortmund
  - /geo/frankfurt
  - /geo/germany
  - ... +3 more pages

#### Word Count
> Checks content length for thin content issues
- [!] **word-count**: Thin content: 21 words (min 300) (+13 more pages)
  (14 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /geo
  - /geo/berlin
  - ... +9 more pages

#### Title Template Consistency
> Finds pages whose title breaks the template the rest of the site follows
- [!] **title-pattern-outlier**: 1 of 16 titled page(s) break the site's own title template (brand "Umut Barış Terzioğlu" last 88%, separator "|" 88%)
  (1 pages)
  - /book-appointment

### Performance

#### CLS Optimization Hints
> Checks for Cumulative Layout Shift prevention
- [!] **cls-images**: 3 image(s) without width/height (CLS risk) (+5 more pages)
  (6 pages)
  - /buyorbye
  - /buyorbyetr
  - /holiday
  - /smellable
  - /zats
  - ... +1 more pages

#### DOM Size
> Detects excessive DOM complexity that impacts performance
- [!] **dom-max-children**: Element with 157 children found (+1 more pages)
  (2 pages)
  - /
  - /book-appointment
- [!] **dom-total-nodes**: Large DOM (1954 nodes) (+1 more pages)
  (2 pages)
  - /
  - /book-appointment

#### Total Page Weight
> Checks the byte weight of each page
- [!] **total-byte-weight**: Heaviest page: https://ubterzioglu.de/buyorbye 3737KB (5 over 1600KB, 0 over 5000KB) (heavy page). Not scored: site total 5623KB across 16 pages, shared files counted once; average page 1700KB

#### Critical Request Chains
> Identifies chains of dependent resources that delay rendering
- [!] **critical-request-chains**: 1 critical request chain(s) found (+15 more pages)
  (16 pages)
  - /
  - /blog
  - /book-appointment
  - /buyorbye
  - /buyorbyetr
  - ... +11 more pages

#### Lazy Loading Above Fold
> Detects lazy loading on likely above-fold images
- [!] **lazy-above-fold**: 2 above-fold image(s) with lazy loading (+2 more pages)
  (3 pages)
  - /
  - /book-appointment
  - /smellable

#### Cache Headers
> Checks Cache-Control header configuration
- [!] **cache-control**: Cache-Control without max-age (+13 more pages)
  (14 pages)
  - /blog
  - /buyorbye
  - /buyorbyetr
  - /geo
  - /geo/berlin
  - ... +9 more pages

### Mobile

#### Web App Manifest
> Checks the web app manifest the pages link: that it loads and parses, its name, start_url and display, its 192px and 512px PNG icons, and that its theme_color matches the pages' theme-color
- [!] **web-app-manifest**: Web app manifest https://ubterzioglu.de/manifest.webmanifest has 3 issue(s) (linked from https://ubterzioglu.de/, https://ubterzioglu.de/blog, https://ubterzioglu.de/book-appointment, https://ubterzioglu.de/buyorbye, https://ubterzioglu.de/buyorbyetr and 11 more)
  (16 pages)
  - /
  - /blog
  - /book-appointment
  - /buyorbye
  - /buyorbyetr
  - ... +11 more pages

### E-E-A-T

#### About Page
> Checks for an about/company page with content
- [!] **about-page**: No About page found

#### Contact Page
> Checks for contact page with multiple contact methods
- [!] **contact-page**: No Contact page found

#### Privacy Policy
> Checks for privacy policy page linked from footer
- [!] **privacy-policy**: No Privacy Policy page found

### Legal Compliance

#### Privacy Policy
> Checks for privacy policy link presence
- [!] **privacy-policy**: No privacy policy link found across site

### Blocking

#### Privacy Filter Matches
> Checks for trackers and analytics that privacy filter lists (EasyPrivacy) would block
- [!] **privacy-blocked**: 1 resource(s) would be blocked by privacy filters (EasyPrivacy)
  (2 pages)
  - /geo/berlin
  - ... +1 more pages


**1694** passed, **172** warnings, **14** failed

*Generated by [squirrelscan](https://squirrelscan.com)*