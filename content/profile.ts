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
  {
    title: "Professional Summary",
    content: "Senior Software Quality Assurance Engineer with 15+ years of experience in test management, automation, and process optimization in enterprise environments. Led global testing initiatives and built scalable automation frameworks across complex systems. Strong expertise in Agile/SCRUM, CI/CD pipelines, and modern QA practices focused on efficiency and reliability. Extensive experience in coordinating FAT and SAT activities and aligning testing processes with business goals. Proven ability to mentor teams, improve test strategies, and deliver high-quality, stable software solutions."
  },
  {
    title: "Professional Strengths & Mindset",
    content: "Experienced in international and multicultural environments, with strong cross-functional communication skills. Active contributor to professional communities, promoting collaboration and knowledge sharing. Continuous learner, closely following new technologies, tools, and industry trends. Strong focus on building practical, user-oriented digital products and platforms. Pragmatic, solution-oriented mindset with emphasis on long-term impact and sustainability. Founder and builder of community-driven initiatives connecting professionals across Germany and Turkey. Hands-on approach to creating and scaling side projects into usable, real-world solutions. Strong understanding of the German job market and professional ecosystem. Passionate about simplifying complex topics and making knowledge accessible. Combines analytical thinking with creativity, bridging technology, community, and content."
  },
  {
    title: "Personal Profile",
    content: "I am Umut Barış Terzioğlu — \"Baris\" in Turkey, \"Umut\" in Germany. Born in 1985. Originally trained as a Mechanical Engineer, currently working in software and quality assurance. Living in Dortmund since 2021 with my wife and our two cats. Enjoy learning, building, and creating value for others. Prefer practical, clear, and actionable knowledge in both professional and daily life. Interested in technology, but grounded in real-life usefulness and simplicity. In my free time: computer games, movies/series, music, and traveling. Appreciate balance — sometimes best achieved through a \"quiet chaos\" at home with two cats."
  }
];

export const keyAchievements: string[] = [
  "Led global testing initiatives and built scalable automation frameworks across complex enterprise systems.",
  "Global test responsibility for Daimler's PDM system Smaragd, serving 30,000+ users.",
  "Test Lead for large-scale warehouse automation and robotics integration projects at Swisslog.",
  "Built and maintained enterprise-scale test assets (5,000+ test cases) across HP ALM, Jira, and Polarion.",
  "Raised Daimler test coverage from 50% to 90% through systematic test design and execution.",
  "Automated and optimized 1,000+ checks using Ranorex, C#, Selenium, and CI/CD pipelines.",
  "Coordinated and presented 50+ FAT, SAT, UAT, and release sessions in factory and site environments.",
  "Implemented Ranorex GUI test automation for three major Daimler systems with Jenkins integration.",
  "Led CRM system migration and built new test architecture for Daimler's DARRS remote support system.",
  "Successfully led tool migration initiatives from HP ALM to Jira/Xray, lowering manual effort and operational costs.",
  "Global owner of Daimler's Part Management System SRM infrastructure, designing process and test automation.",
  "Mentored 30+ QA colleagues across Daimler and Swisslog, providing hands-on guidance and knowledge transfer.",
  "Optimized test execution time by 40% and saved hundreds of hours monthly through KPI-based reporting."
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
      "A global Product Data Management system used by thousands of engineers across Mercedes-Benz. Test strategy, quality processes, and release management were established and executed throughout the project lifecycle. The system supported highly complex engineering workflows and integrations.",
    image: "logosmaragd.png"
  },
  {
    title: "SRM",
    label: "Daimler / Mercedes-Benz",
    summary:
      "A critical Supply & Parts Management platform serving tens of thousands of internal users. End-to-end testing, test automation processes, and global rollout support were delivered. The project played a key role in ensuring stability across global supply chain operations.",
    image: "logosrm.png"
  },
  {
    title: "DARRS",
    label: "Daimler / Mercedes-Benz",
    summary:
      "An internal communication and reporting system used for operational and management-level decision processes. Functional, integration, and user acceptance testing activities were carried out. The system directly supported data-driven corporate operations.",
    image: "logodarrs.png"
  },
  {
    title: "TKL",
    label: "Swisslog",
    summary:
      "A warehouse automation and robotics integration project for logistics operations. Software and hardware synchronization tests were executed across robotic and conveyor systems. The project required high reliability under real-time operational conditions.",
    image: "logotkl.png"
  },
  {
    title: "Kruitbosch",
    label: "Swisslog",
    summary:
      "A warehouse management system supporting retail distribution operations. Order picking, stock management, and shipment processes were tested across automated workflows. Close interaction between physical automation and software systems was a key success factor.",
    image: "logokruitbosch.png"
  },
  {
    title: "Albert Heijn",
    label: "Swisslog",
    summary:
      "A high-volume warehouse automation project for one of Europe's largest retail chains. System validation, go-live support, and data integrity testing were delivered under heavy operational load. The project operated in a high-availability production environment.",
    image: "logoalbert.png"
  },
  {
    title: "EDEKA",
    label: "Swisslog",
    summary:
      "A large-scale automation project for Germany's leading supermarket group. Pre-go-live validation, integration testing, and operational stability checks were conducted. The system ensured uninterrupted warehouse operations during transition phases.",
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
