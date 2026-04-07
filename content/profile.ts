import type {
  AchievementItem,
  ContactItem,
  ExperienceItem,
  ProjectItem,
  StackGroup
} from "@/types/site";

export const cvLinks = [
  {
    label: "English CV",
    href: "https://drive.google.com/file/d/1T5yUafZI9nRv1aVWeEKBHcU6apZOojP2/view?usp=drive_link",
    note: "View or download the current English PDF."
  },
  {
    label: "German CV",
    href: "https://drive.google.com/file/d/15_4pguyDYAYtoqYs_7rwCCzdHknfvZ6D/view?usp=drive_link",
    note: "View or download the current German PDF."
  }
] as const;

export const aboutParagraphs = [
  "Professional Summary\nSenior Software Quality Assurance Engineer with 15+ years of experience in test management, automation, and process optimization in enterprise environments.\nLed global testing initiatives and built scalable automation frameworks across complex systems.\nStrong expertise in Agile/SCRUM, CI/CD pipelines, and modern QA practices focused on efficiency and reliability.\nExtensive experience in coordinating FAT and SAT activities and aligning testing processes with business goals.\nProven ability to mentor teams, improve test strategies, and deliver high-quality, stable software solutions.",
  "Professional Strengths & Mindset\nExperienced in international and multicultural environments, with strong cross-functional communication skills.\nActive contributor to professional communities, promoting collaboration and knowledge sharing.\nContinuous learner, closely following new technologies, tools, and industry trends.\nStrong focus on building practical, user-oriented digital products and platforms.\nPragmatic, solution-oriented mindset with emphasis on long-term impact and sustainability.\nFounder and builder of community-driven initiatives connecting professionals across Germany and Turkey.\nHands-on approach to creating and scaling side projects into usable, real-world solutions.\nStrong understanding of the German job market and professional ecosystem.\nPassionate about simplifying complex topics and making knowledge accessible.\nCombines analytical thinking with creativity, bridging technology, community, and content.",
  "Personal Profile\nI am Umut Barış Terzioğlu — \"Barış\" in Turkey, \"Umut\" in Germany. Born in 1985.\nOriginally trained as a Mechanical Engineer, currently working in software and quality assurance.\nLiving in Dortmund since 2021 with my wife and our two cats.\nEnjoy learning, building, and creating value for others.\nPrefer practical, clear, and actionable knowledge in both professional and daily life.\nInterested in technology, but grounded in real-life usefulness and simplicity.\nIn my free time: computer games, movies/series, music, and traveling.\nAppreciate balance — sometimes best achieved through a \"quiet chaos\" at home with two cats."
];

export const achievementHighlights: AchievementItem[] = [
  {
    value: "5,000+",
    label: "test cases created",
    detail: "Built and maintained enterprise-scale test assets across HP ALM, Jira, and Polarion."
  },
  {
    value: "90%",
    label: "coverage reached",
    detail: "Raised Daimler coverage from 50% to 90% through systematic test design."
  },
  {
    value: "1,000+",
    label: "automated checks",
    detail: "Automated and optimized large suites with Ranorex, C#, Selenium, and CI pipelines."
  },
  {
    value: "50+",
    label: "customer sessions",
    detail: "Ran FAT, SAT, UAT, release, and support sessions in complex enterprise contexts."
  }
];

export const achievementBullets: AchievementItem[] = [
  {
    value: "3",
    label: "major systems automated",
    detail: "Implemented Ranorex automation for three major Daimler systems with Jenkins-based CI/CD support."
  },
  {
    value: "40%",
    label: "execution time reduced",
    detail: "Optimized 1,000+ automated checks for faster feedback loops."
  },
  {
    value: "2",
    label: "tool migrations led",
    detail: "HP ALM to Jira / Xray migration initiatives that lowered manual effort and operational cost."
  },
  {
    value: "30+",
    label: "QA colleagues mentored",
    detail: "Across Daimler and Swisslog engagements with hands-on guidance and knowledge transfer."
  },
  {
    value: "100s",
    label: "hours saved monthly",
    detail: "KPI-based reporting that improved visibility and saved hundreds of hours monthly."
  }
];

export const stackGroups: StackGroup[] = [
  {
    title: "Automation & Frameworks",
    items: ["Selenium", "Ranorex", "Maven", "TestNG", "JUnit", "Cucumber", "Gherkin"]
  },
  {
    title: "Programming Languages",
    items: ["Java", "C#", "Python", "TypeScript"]
  },
  {
    title: "API & Integration Testing",
    items: ["REST", "SOAP", "Postman", "SoapUI", "API mocking"]
  },
  {
    title: "CI/CD & Tooling",
    items: ["Jenkins", "Docker", "Git", "GitHub", "Jira", "Xray", "HP ALM", "Polarion"]
  },
  {
    title: "Methods",
    items: ["Agile", "SCRUM", "Risk-based testing", "Release coordination", "UAT", "FAT", "SAT"]
  }
];

export const experienceItems: ExperienceItem[] = [
  {
    company: "Swisslog GmbH",
    role: "Senior QA Engineer / Test Lead",
    period: "2021 - 2025",
    location: "Dortmund, Germany",
    summary:
      "Test Lead for large-scale automation projects in the intralogistics domain, coordinating FAT & SAT phases and leading on-site customer support.",
    highlights: [
      "Led test planning and execution for high-complexity warehouse automation projects (WMS, WES, SynQ).",
      "Created and reviewed test cases based on specs using Polarion and Git repository tools.",
      "Coordinated and presented FAT & SAT test phases in factory and site environments.",
      "On-site Test Lead assigning team roles in critical test areas by expertise.",
      "Supported customers on-site and resolved issues during system integration.",
      "Prioritized defects and improved product quality through root cause analysis.",
      "Created manuals, guides, and customer training materials for software and processes.",
      "Mentored new team members and supported onboarding processes effectively."
    ]
  },
  {
    company: "Daimler / Mercedes-Benz",
    role: "Senior Process Manager & Test Manager",
    period: "2020 - 2021",
    location: "Istanbul, Turkey",
    summary:
      "Global owner of Daimler's Part Management System SRM infrastructure, responsible for test architecture, tool selection, and CRM system migration.",
    highlights: [
      "Selected test automation tools by scoring against system requirements.",
      "Global owner of Daimler's Part Management System SRM infrastructure.",
      "Designed process and test automation for SRM infrastructure.",
      "Built new test architecture for Daimler's DARRS remote support system.",
      "Led CRM system migration for the Part Management System SRM.",
      "Delivered global support for SRM platform across all regions."
    ]
  },
  {
    company: "Daimler / Mercedes-Benz",
    role: "Senior Test Manager",
    period: "2016 - 2020",
    location: "Istanbul, Turkey",
    summary:
      "Global test responsibility for Daimler's PDM system Smaragd serving 30K+ users, leading agile test management with SCRUM methodology.",
    highlights: [
      "Global test responsibility for PDM system Smaragd with 30,000+ users.",
      "Led global agile test management strategy with SCRUM for PDM system.",
      "Led test case migration from HP ALM to JIRA for improved test management.",
      "Created and maintained test cases using Jira and Xray tools.",
      "Executed both manual and automated tests with comprehensive test planning.",
      "GUI test automation scripting in C# with Ranorex framework.",
      "Assessed software maturity and aligned with requirement management.",
      "Tracked open defects and verified resolved issues through retesting."
    ]
  },
  {
    company: "Daimler / Mercedes-Benz",
    role: "R&D Engineer",
    period: "2007 - 2016",
    location: "Germany & Turkey",
    summary:
      "Vehicle development and integration engineer focusing on bus interior systems, supporting NCI Euro6 assembly and cross-border coordination.",
    highlights: [
      "Built interiors, flaps, floor frames & luggage areas for several bus models.",
      "Supported NCI Euro6 assembly & custom requests on-site in Germany (Ulm & Mannheim).",
      "Joined DE-TR NCR & Conecto projects, focusing on integration and coordination.",
      "Delivered factory and prototype support for special-order vehicles."
    ]
  }
];

export const corporateProjects: ProjectItem[] = [
  {
    title: "Smaragd",
    label: "Daimler / Mercedes-Benz",
    summary:
      "Global Product Data Management system for thousands of engineers, where I supported strategy, quality processes, and release management.",
    image: "logosmaragd.png"
  },
  {
    title: "SRM",
    label: "Daimler / Mercedes-Benz",
    summary:
      "Supply and parts management platform serving tens of thousands of internal users, covering E2E testing, automation, and rollout support.",
    image: "logosrm.png"
  },
  {
    title: "DARRS",
    label: "Daimler / Mercedes-Benz",
    summary:
      "Internal communication and reporting system that required functional, integration, and user acceptance testing.",
    image: "logodarrs.png"
  },
  {
    title: "TKL",
    label: "Swisslog",
    summary:
      "Warehouse automation and robotics integration project demanding high reliability in real-time logistics operations.",
    image: "logotkl.png"
  },
  {
    title: "Kruitbosch",
    label: "Swisslog",
    summary:
      "Warehouse management system initiative focused on automated retail distribution workflows.",
    image: "logokruitbosch.png"
  },
  {
    title: "Albert Heijn",
    label: "Swisslog",
    summary:
      "High-volume automation project with system validation, go-live support, and data integrity checks under heavy load.",
    image: "logoalbert.png"
  },
  {
    title: "EDEKA",
    label: "Swisslog",
    summary:
      "Large-scale grocery automation program covering pre-go-live validation and operational stability checks.",
    image: "logoedeka.png"
  }
];

export const privateProjects: ProjectItem[] = [
  {
    title: "UBT Testing",
    label: "Personal brand",
    summary:
      "A personal QA platform for sharing practical testing experience, tools, and quality thinking.",
    image: "logoubtest.png"
  },
  {
    title: "All in 2 Minutes",
    label: "Short-form content",
    summary:
      "A format for explaining complex topics quickly with clarity, speed, and entertainment value.",
    image: "logoallin2min.png"
  },
  {
    title: "Press Enter to Code",
    label: "Tech content channel",
    summary:
      "A personal coding and productivity channel focused on development, testing, and learning.",
    image: "logopressenter.png"
  },
  {
    title: "Software Tester Network",
    label: "Community initiative",
    summary:
      "A QA community concept built around knowledge sharing, discussion, and career support.",
    image: "logostn.png"
  },
  {
    title: "CAL Community",
    label: "Digital community",
    summary:
      "A social and alumni-style platform focused on sustained connection, engagement, and collective interaction.",
    image: "logocalcom.png"
  },
  {
    title: "Picked Scenes",
    label: "Editorial project",
    summary:
      "Curated storytelling moments from films and series, presented as short-form editorial content.",
    image: "logopicked.png"
  }
];

export const contactItems: ContactItem[] = [
  { label: "WhatsApp", value: "+49 173 956 9429", href: "https://wa.me/491739569429" },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/ubterzioglu",
    href: "https://www.linkedin.com/in/ubterzioglu/"
  },
  {
    label: "Instagram",
    value: "@ubterzioglu",
    href: "https://www.instagram.com/ubterzioglu/"
  },
  { label: "Email", value: "ubterzioglu@gmail.com", href: "mailto:ubterzioglu@gmail.com" },
  { label: "Phone", value: "+49 173 956 9429", href: "tel:+491739569429" },
  {
    label: "Location",
    value: "Dortmund, Germany",
    href: "https://maps.google.com/?q=Dortmund,Germany"
  }
];
