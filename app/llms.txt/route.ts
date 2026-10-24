import { BASE_URL, SITE_LAST_UPDATED, SITE_NAME } from "@/lib/seo";

export const revalidate = 86400;

const LLMS_TXT = `# ${SITE_NAME}

> Personal portfolio of ${SITE_NAME} (UBT) — Senior Software Quality Assurance Engineer
> with 18+ years of experience in test strategy, test automation, CI/CD, and enterprise
> delivery. Based in Dortmund, Germany.

Last updated: ${SITE_LAST_UPDATED}

## About

- Senior QA Engineer / Test Lead, currently at Swisslog GmbH (intralogistics automation).
- Previously Senior Test Manager and R&D Engineer at Daimler / Mercedes-Benz (2007–2021).
- Expertise: Selenium, Ranorex, TestNG, JUnit, Cucumber, Java, C#, Python, TypeScript,
  Jenkins, Docker, Jira/Xray, HP ALM, Polarion.
- Offers free appointment booking for QA consultations.

## Key pages

- [Home / Portfolio](${BASE_URL}/): CV, about, key achievements, tech stack, experience, projects, FAQ, contact.
- [Blog](${BASE_URL}/blog): Articles on software testing, quality engineering, and career topics.
- [QA services by city](${BASE_URL}/geo): Location pages for QA engineering services in German and international cities.
- [Book an appointment](${BASE_URL}/#book-appointment): Free booking flow for consultation slots.
- [RSS feed](${BASE_URL}/rss.xml): Blog and news updates.
- [Sitemap](${BASE_URL}/sitemap.xml): Full list of indexed pages.

## Contact

- Email: ubterzioglu@gmail.com
- Phone: +49 173 956 9429
- LinkedIn: https://www.linkedin.com/in/ubterzioglu/
- Instagram: https://www.instagram.com/ubterzioglu/
- Medium: https://medium.com/@ubterzioglu
- Location: Dortmund, North Rhine-Westphalia, Germany
`;

export function GET() {
  return new Response(LLMS_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400"
    }
  });
}
