export interface GeoLocation {
  slug: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  highlight: string;
  proofPoints: string[];
  serviceFit: string;
  ctaCopy: string;
  services: string[];
  faq: Array<{ question: string; answer: string }>;
}

export const geoLocations: GeoLocation[] = [
  {
    slug: "dortmund",
    city: "Dortmund",
    region: "North Rhine-Westphalia",
    country: "Germany",
    countryCode: "DE",
    latitude: 51.5136,
    longitude: 7.4653,
    title: "QA Engineer in Dortmund, Germany — Umut Barış Terzioğlu",
    description:
      "Senior QA Engineer based in Dortmund. Test strategy, automation, and quality leadership for software teams across NRW and Germany. 18+ years of enterprise testing experience.",
    keywords: [
      "QA Engineer Dortmund",
      "Software Testing Dortmund",
      "Test Automation Dortmund",
      "Senior QA Dortmund",
      "Quality Assurance Dortmund",
      "QA Consultant NRW",
      "Software Quality Dortmund Germany"
    ],
    intro:
      "Dortmund is the home base for UBT's QA work in Germany, making it the strongest location page for local consulting, on-site workshops, and NRW-based delivery.",
    highlight:
      "Based in Dortmund since 2021. Delivering test leadership and automation expertise for complex enterprise systems in the NRW region.",
    proofPoints: [
      "Local presence in Dortmund since 2021.",
      "Swisslog test leadership experience in North Rhine-Westphalia.",
      "Enterprise QA background across warehouse automation, automotive, and release validation."
    ],
    serviceFit:
      "Best fit for Dortmund and NRW teams that need hands-on test planning, automation review, FAT/SAT coordination, or structured QA mentoring close to their delivery site.",
    ctaCopy:
      "Book a free Dortmund QA consultation to review your current test process, automation coverage, or release risk.",
    services: [
      "Test Strategy & Planning",
      "Test Automation (Selenium, Ranorex)",
      "CI/CD Integration",
      "QA Process Consulting",
      "Team Mentoring & Training"
    ],
    faq: [
      {
        question: "Are you available for QA consulting in Dortmund?",
        answer:
          "Yes. I work with teams in Dortmund and across NRW for test strategy, automation setup, and quality process improvement."
      },
      {
        question: "What industries have you worked in near Dortmund?",
        answer:
          "Intralogistics (Swisslog), automotive (Daimler/Mercedes-Benz), and warehouse automation — including projects for EDEKA and Albert Heijn."
      },
      {
        question: "Do you offer on-site support in Dortmund?",
        answer:
          "Yes, on-site engagement is available in Dortmund and neighboring cities in North Rhine-Westphalia."
      }
    ]
  },
  {
    slug: "germany",
    city: "Germany",
    region: "Germany",
    country: "Germany",
    countryCode: "DE",
    latitude: 51.1657,
    longitude: 10.4515,
    title: "QA Engineer in Germany — Umut Barış Terzioğlu",
    description:
      "Senior Software QA Engineer operating in Germany. 18+ years delivering test strategy, automation, and quality engineering for enterprise clients. Available for consulting, remote, and on-site engagements.",
    keywords: [
      "QA Engineer Germany",
      "Software Testing Germany",
      "Senior Test Automation Germany",
      "Quality Assurance Germany",
      "Test Manager Germany",
      "Selenium Automation Germany",
      "QA Consultant Deutschland"
    ],
    intro:
      "This Germany-wide page summarizes UBT's remote and on-site QA consulting offer for teams that need senior test strategy without being tied to one city.",
    highlight:
      "Experienced QA professional based in Germany, serving clients across the country with test strategy, automation engineering, and release quality support.",
    proofPoints: [
      "Based in Germany with enterprise project experience for German and European clients.",
      "18+ years across mechanical engineering, test management, automation, and quality leadership.",
      "Professional communication in English, German, and Turkish business contexts."
    ],
    serviceFit:
      "Best fit for German companies that need a senior QA partner for test strategy reviews, automation framework decisions, release readiness, or cross-team QA process improvement.",
    ctaCopy:
      "Book a free Germany-wide QA consultation to discuss remote, hybrid, or on-site support options.",
    services: [
      "Enterprise Test Management",
      "Automation Framework Design",
      "CI/CD & DevOps Integration",
      "FAT & SAT Coordination",
      "QA Strategy Consulting"
    ],
    faq: [
      {
        question: "Do you work with German companies as a QA Engineer?",
        answer:
          "Yes. I have 4+ years of on-site experience in Germany at Swisslog and have worked on projects for Daimler, EDEKA, and Albert Heijn."
      },
      {
        question: "Can you conduct testing in German?",
        answer:
          "Yes, I communicate professionally in both German and English and have documented test cases, reports, and training materials in German."
      },
      {
        question: "Are you open to freelance or contract QA roles in Germany?",
        answer:
          "I am open to discussing project-based engagements. Feel free to book an appointment or send a message via the contact section."
      }
    ]
  },
  {
    slug: "frankfurt",
    city: "Frankfurt",
    region: "Hesse",
    country: "Germany",
    countryCode: "DE",
    latitude: 50.1109,
    longitude: 8.6821,
    title: "QA Engineer in Frankfurt, Germany — Umut Barış Terzioğlu",
    description:
      "Senior QA Engineer available for Frankfurt and Hesse region. Test automation, quality strategy, and enterprise delivery across fintech, logistics, and software sectors.",
    keywords: [
      "QA Engineer Frankfurt",
      "Software Testing Frankfurt",
      "Test Automation Frankfurt",
      "QA Consultant Frankfurt",
      "Quality Assurance Frankfurt",
      "Senior QA Frankfurt Germany"
    ],
    intro:
      "Frankfurt teams often need reliable testing around business-critical platforms, integrations, and distributed delivery; this page focuses on that enterprise QA fit.",
    highlight:
      "Available for QA consulting and testing engagements in Frankfurt and the Hesse region, with experience across enterprise software and logistics platforms.",
    proofPoints: [
      "Experience with enterprise systems where integrations, traceability, and release confidence matter.",
      "Automation toolkit covering Selenium, Ranorex, Java, C#, Jenkins, Postman, Jira, and Xray.",
      "Comfortable supporting remote-first Frankfurt teams with structured reporting and periodic on-site alignment."
    ],
    serviceFit:
      "Best fit for Frankfurt and Hesse teams working on fintech-adjacent, logistics, B2B, or internal software where defects carry operational cost.",
    ctaCopy:
      "Book a free Frankfurt QA consultation to review your automation coverage, defect flow, or release readiness.",
    services: [
      "Test Automation Setup",
      "Quality Process Consulting",
      "Selenium & Java Automation",
      "Agile QA Integration",
      "Remote & On-site Delivery"
    ],
    faq: [
      {
        question: "Can you work with Frankfurt-based teams remotely?",
        answer:
          "Yes. I regularly collaborate with distributed teams and can deliver fully remote QA services alongside periodic on-site visits."
      },
      {
        question: "What test tools do you use for Frankfurt clients?",
        answer:
          "Selenium, Ranorex, Jira, Xray, Jenkins, and Postman — tools well established in German enterprise environments."
      },
      {
        question: "Do you have experience in the finance or logistics sector?",
        answer:
          "Yes. My background includes large-scale warehouse automation and enterprise management systems typical of Frankfurt's logistics and tech cluster."
      }
    ]
  },
  {
    slug: "berlin",
    city: "Berlin",
    region: "Berlin",
    country: "Germany",
    countryCode: "DE",
    latitude: 52.52,
    longitude: 13.405,
    title: "QA Engineer in Berlin, Germany — Umut Barış Terzioğlu",
    description:
      "Senior QA Engineer available for Berlin startups and enterprise clients. Selenium, CI/CD, agile testing, and test strategy consulting for modern software teams.",
    keywords: [
      "QA Engineer Berlin",
      "Software Testing Berlin",
      "Test Automation Berlin",
      "Senior QA Engineer Berlin",
      "Quality Assurance Berlin",
      "QA Consulting Berlin",
      "Selenium Automation Berlin"
    ],
    intro:
      "Berlin product teams need QA that stays lean without becoming superficial; this page focuses on practical test strategy for fast-moving software teams.",
    highlight:
      "Experienced in fast-paced agile environments. Open to working with Berlin-based product companies and startups on test strategy and automation.",
    proofPoints: [
      "Hands-on automation framework experience for teams that need fast feedback loops.",
      "Agile QA background with sprint-level test planning, risk-based coverage, and transparent reporting.",
      "Practical product-builder mindset from UBT's own tools and community projects."
    ],
    serviceFit:
      "Best fit for Berlin startups and product companies that need to introduce QA discipline without slowing product iteration.",
    ctaCopy:
      "Book a free Berlin QA consultation to identify the smallest test process that can protect your next release.",
    services: [
      "Startup QA Setup",
      "Agile Test Integration",
      "CI/CD Pipeline Testing",
      "API & Integration Testing",
      "Test Strategy Reviews"
    ],
    faq: [
      {
        question: "Do you have experience working with startups in Berlin?",
        answer:
          "Yes. I understand agile environments where QA needs to be lean, fast, and reliable — exactly what Berlin-based product teams need."
      },
      {
        question: "Can you build a test automation framework from scratch in Berlin?",
        answer:
          "Absolutely. I have experience designing automation frameworks with Selenium, TestNG, Maven, and Jenkins across multiple projects."
      },
      {
        question: "How do you work with remote teams in Berlin?",
        answer:
          "Via structured sprint integration — clear test plans, daily communication, and transparent reporting aligned to the team's workflow."
      }
    ]
  },
  {
    slug: "hamburg",
    city: "Hamburg",
    region: "Hamburg",
    country: "Germany",
    countryCode: "DE",
    latitude: 53.5753,
    longitude: 10.0153,
    title: "QA Engineer in Hamburg, Germany — Umut Barış Terzioğlu",
    description:
      "Senior QA Engineer serving Hamburg and the logistics-strong northern Germany region. Test automation, warehouse management system testing, and enterprise quality delivery.",
    keywords: [
      "QA Engineer Hamburg",
      "Software Testing Hamburg",
      "Test Automation Hamburg",
      "QA Consultant Hamburg",
      "Quality Assurance Hamburg",
      "Logistics Software Testing Hamburg"
    ],
    intro:
      "Hamburg's logistics and commerce profile maps closely to UBT's recent warehouse automation work, where software quality directly affects physical operations.",
    highlight:
      "Strong match for Hamburg's logistics and e-commerce sector. Extensive background in warehouse automation testing with Swisslog-level complexity.",
    proofPoints: [
      "Recent WMS/WES and intralogistics testing experience at Swisslog.",
      "FAT, SAT, UAT, integration testing, and go-live support across automated warehouse environments.",
      "Project exposure to large retail and logistics contexts including EDEKA and Albert Heijn."
    ],
    serviceFit:
      "Best fit for Hamburg logistics, e-commerce, and operations-heavy software teams that need rigorous integration testing and stable go-live support.",
    ctaCopy:
      "Book a free Hamburg QA consultation to discuss logistics software testing, WMS/WES validation, or release stabilization.",
    services: [
      "Logistics Software QA",
      "WMS & WES Testing",
      "Process Automation Testing",
      "SAT & FAT Coordination",
      "Enterprise Integration Testing"
    ],
    faq: [
      {
        question: "Do you specialize in logistics software testing in Hamburg?",
        answer:
          "Yes. My most recent project (Swisslog) involved WMS/WES systems used by major retail chains including EDEKA and Albert Heijn."
      },
      {
        question: "Can you support Hamburg-based e-commerce QA needs?",
        answer:
          "Yes — API testing, UI automation, integration testing, and release QA are all within my scope and relevant to Hamburg's e-commerce ecosystem."
      },
      {
        question: "Are you open to Hamburg projects?",
        answer:
          "Yes. I'm available for both remote engagements and periodic on-site visits to Hamburg clients."
      }
    ]
  },
  {
    slug: "istanbul",
    city: "Istanbul",
    region: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    latitude: 41.0082,
    longitude: 28.9784,
    title: "QA Engineer Istanbul — Umut Barış Terzioğlu",
    description:
      "Senior Software QA Engineer with deep roots in Istanbul and Turkey. 10+ years of Daimler/Mercedes-Benz QA experience in Istanbul. Remote consulting and test strategy services available.",
    keywords: [
      "QA Engineer Istanbul",
      "Software Testing Istanbul",
      "Test Automation Istanbul",
      "Senior QA Turkey",
      "Quality Assurance Turkey",
      "QA Consultant Istanbul",
      "Yazılım Test Mühendisi İstanbul"
    ],
    intro:
      "Istanbul connects UBT's Daimler/Mercedes-Benz QA roots with current Germany-based consulting, making it a strong fit for Turkish teams and professionals targeting German quality standards.",
    highlight:
      "10+ years of Daimler QA experience in Istanbul. Deep knowledge of the Turkish tech ecosystem and professional standards in the German-Turkish business corridor.",
    proofPoints: [
      "10+ years of Daimler/Mercedes-Benz experience in Istanbul before relocating to Germany.",
      "Strong understanding of both Turkish and German software delivery expectations.",
      "CV and career support experience for QA professionals moving toward the German job market."
    ],
    serviceFit:
      "Best fit for Istanbul-based companies or QA professionals who need German-market quality expectations, test strategy guidance, or career-oriented QA advice.",
    ctaCopy:
      "Book a free Istanbul QA consultation to review your QA process, CV positioning, or Germany transition strategy.",
    services: [
      "Remote QA Consulting (TR)",
      "German-Turkish Tech Bridge",
      "Test Strategy Advisory",
      "CV & Career Support for QA",
      "Appointment-based Consultation"
    ],
    faq: [
      {
        question: "Can you provide QA services for Istanbul-based companies?",
        answer:
          "Yes. I offer remote consulting, test strategy reviews, and career advisory sessions for teams across Turkey including Istanbul."
      },
      {
        question: "Do you have experience in the Turkish software market?",
        answer:
          "Yes. I spent 10+ years working for Daimler/Mercedes-Benz in Istanbul before relocating to Germany, with deep familiarity in both markets."
      },
      {
        question: "Can you help Turkish developers transition to Germany?",
        answer:
          "Yes. I regularly support professionals seeking QA roles in Germany — from CV review to career strategy and market insights."
      }
    ]
  }
];
