window.BUYORBYE_DATA = {
  ui: {
    heroTitle: "BuyOrBye",
    heroSubtitle: "Answer 15 quick questions. Get a clear BUY / WAIT / BYE recommendation.",

    pillReady: "Ready.",
    pillStep: (n, total) => `Step ${n}/${total}`,
    pillResult: "Result ready.",

    buttons: {
      next: "Next",
      back: "Back",
      startOver: "Start over"
    },

    yes: "Yes",
    no: "No",
    optional: "Optional",

    errors: {
      required: "This field is required.",
      numberInvalid: "Please enter a valid number.",
      budgetMustBeGte0: "Budget must be 0 or greater.",
      priceMustBeGte0: "Price must be 0 or greater."
    },

    stepTitles: {
      s1: "1) Basics",
      s2: "2) Usage & priorities",
      s3: "3) Reality check",
      result: "4) Your result"
    },
    stepSubs: {
      s1: "Numbers first, then we decide calmly.",
      s2: "This is where the decision becomes obvious.",
      s3: "A few questions to protect you from impulse buys."
    },

    result: {
      why: "Why",
      tradeoffs: "Trade-offs",
      nextSteps: "Suggestion",
      nudge: "This tool is on your side. We want you to enjoy your money, not regret spending it."
    }
  },

  steps: [
    { id: "s1", color: "card-blue",  qids: ["item", "price", "budget", "incomePct", "urgency"] },
    { id: "s2", color: "card-green", qids: ["frequency", "needwant", "priorities", "alt80", "returnPolicy"] },
    { id: "s3", color: "card-purple", qids: ["regret2y", "priceDrop15", "reliability", "socialPressure", "impulse", "canWait72"] }
  ],

  questions: {
    item: {
      id: "item",
      type: "text",
      required: false,
      label: "What are you buying?",
      sub: "A short name is enough.",
      placeholder: "e.g., headphones, monitor, course"
    },
    price: {
      id: "price",
      type: "number",
      required: true,
      label: "Price (EUR)",
      sub: "The full price you would pay today.",
      placeholder: "e.g., 199"
    },
    budget: {
      id: "budget",
      type: "number",
      required: true,
      label: "Your max budget (EUR)",
      sub: "The maximum you feel comfortable spending.",
      placeholder: "e.g., 250"
    },

    incomePct: {
      id: "incomePct",
      type: "single",
      required: true,
      label: "Roughly: this purchase equals what % of your monthly income?",
      sub: "No need to share your salary. Just pick a range.",
      options: [
        { v: "p10",  t: "≈ 10%" },
        { v: "p20",  t: "≈ 20%" },
        { v: "p30",  t: "≈ 30%" },
        { v: "p40",  t: "≈ 40%" },
        { v: "p50",  t: "50% or more" },
        { v: "unk",  t: "Not sure" }
      ]
    },

    urgency: {
      id: "urgency",
      type: "single",
      required: true,
      label: "How urgent is it?",
      sub: "Urgency changes the best strategy.",
      options: [
        { v: "today",  t: "Today" },
        { v: "week",   t: "Within 7 days" },
        { v: "month",  t: "Within 30 days" },
        { v: "none",   t: "Not urgent" }
      ]
    },

    frequency: {
      id: "frequency",
      type: "single",
      required: true,
      label: "How often will you use it?",
      sub: "Frequency is one of the strongest predictors of regret.",
      options: [
        { v: "daily",  t: "Daily" },
        { v: "weekly", t: "Weekly" },
        { v: "monthly",t: "Monthly" },
        { v: "rare",   t: "Rarely" }
      ]
    },
    needwant: {
      id: "needwant",
      type: "single",
      required: true,
      label: "Is this mainly a need or a want?",
      sub: "No judgment. Just clarity.",
      options: [
        { v: "need", t: "Need" },
        { v: "want", t: "Want" }
      ]
    },
    priorities: {
      id: "priorities",
      type: "multi",
      required: true,
      max: 3,
      label: "Pick up to 3 priorities",
      sub: "This helps us understand what ‘good’ means to you.",
      options: [
        { v: "price",       t: "Price" },
        { v: "quality",     t: "Quality" },
        { v: "durability",  t: "Durability" },
        { v: "warranty",    t: "Warranty" },
        { v: "performance", t: "Performance" },
        { v: "ease",        t: "Ease of use" },
        { v: "design",      t: "Design" },
        { v: "brand",       t: "Brand" }
      ]
    },
    alt80: {
      id: "alt80",
      type: "yesno",
      required: true,
      label: "Do you already have an alternative that works “well enough” (≈80%)?",
      sub: "If yes, waiting often becomes the smarter move."
    },
    returnPolicy: {
      id: "returnPolicy",
      type: "yesno",
      required: true,
      label: "Return policy available?",
      sub: "Returns reduce risk, especially for expensive items."
    },

    regret2y: {
      id: "regret2y",
      type: "yesno",
      required: true,
      label: "If it breaks in 2 years, would you still buy it today?",
      sub: "This is the strongest regret test."
    },
    priceDrop15: {
      id: "priceDrop15",
      type: "yesno",
      required: true,
      label: "If the price drops by 15% next month, would you regret buying now?",
      sub: "This detects ‘buy too early’ pain."
    },
    reliability: {
      id: "reliability",
      type: "single",
      required: true,
      label: "How important is reliability / warranty for you?",
      sub: "Higher importance means we should avoid high-risk purchases.",
      options: [
        { v: "low",  t: "Low" },
        { v: "med",  t: "Medium" },
        { v: "high", t: "High" }
      ]
    },
    socialPressure: {
      id: "socialPressure",
      type: "yesno",
      required: true,
      label: "Are you buying this mainly because of trend / social influence?",
      sub: "This often leads to fast regret."
    },
    impulse: {
      id: "impulse",
      type: "yesno",
      required: true,
      label: "Are you shopping right now to fix stress / boredom?",
      sub: "Impulse buys are rarely worth it."
    },
    canWait72: {
      id: "canWait72",
      type: "yesno",
      required: true,
      label: "Can you wait 72 hours before buying without losing anything important?",
      sub: "If yes, waiting is usually a win."
    }
  },

  scoring: {
    hard: {
      overBudgetOutcome: "bye",
      overBudgetReasonKey: "overBudget"
    },
    thresholds: {
      buyMin: 3,
      byeMax: -3
    },

    pctBands: [
      { maxPct: 10, score: +1, key: "pctLow" },
      { maxPct: 20, score:  0, key: "pctMedium" },
      { maxPct: 30, score: -1, key: "pctHigh" },
      { maxPct: 40, score: -2, key: "pctVeryHigh" },
      { maxPct: 100,score: -3, key: "pctExtreme" }
    ],

    weights: {
      urgency: { today: +2, week: +1, month: 0, none: -1 },
      frequency: { daily: +2, weekly: +1, monthly: 0, rare: -1 },
      needwant: { need: +1, want: -1 },
      alt80: { yes: -2, no: +1 },
      returnPolicy: { yes: +1, no: -1 },
      regret2y: { yes: +2, no: -2 },
      priceDrop15: { yes: -1, no: +1 },
      reliability: { low: 0, med: -1, high: -2 },
      socialPressure: { yes: -2, no: 0 },
      impulse: { yes: -2, no: 0 },
      canWait72: { yes: -1, no: +1 }
    }
  },

  reasons: {
    overBudget: {
      why: [
        "It exceeds your budget.",
        "That’s the fastest path to buyer’s regret."
      ],
      tradeoffs: [
        "You keep financial breathing room.",
        "You can revisit if the price drops or your situation changes."
      ],
      next: [
        "If you still want it, set a target price and wait.",
        "Consider a cheaper alternative that matches your top priority."
      ]
    },

    pctLow: {
      why: ["Money ratio looks healthy."],
      tradeoffs: ["Still: compare quickly and avoid endless tab-hopping."],
      next: ["If other answers look good, buying can be reasonable."]
    },
    pctMedium: {
      why: ["Money ratio looks manageable."],
      tradeoffs: ["Waiting for a deal can be a smart upgrade."],
      next: ["If you’re not urgent, consider a price alert."]
    },
    pctHigh: {
      why: ["This is a noticeable chunk of your month."],
      tradeoffs: ["Waiting reduces regret risk."],
      next: ["If you can wait 72h, do it — then re-check your answers."]
    },
    pctVeryHigh: {
      why: ["This is a big hit to your monthly income."],
      tradeoffs: ["A discount or cheaper option could protect you."],
      next: ["Try WAIT with a clear target price. Don’t rush."]
    },
    pctExtreme: {
      why: ["This is extremely expensive relative to your month."],
      tradeoffs: ["This is where impulse hurts the most."],
      next: ["Strong suggestion: pause, compare alternatives, and wait for a much better deal."]
    }
  },

  outcomes: {
    buy:  { label: "BUY",  headline: "Buy looks reasonable.", tone: "No major red flags. Enjoy it — thoughtfully." },
    wait: { label: "WAIT", headline: "Wait a bit.",           tone: "Your decision isn’t bad, but time can save money and regret." },
    bye:  { label: "BYE",  headline: "Skip it for now.",      tone: "We’re on your side — this looks risky for your wallet or future self." }
  }
};
