/**
 * Public hiring invite for `/`. CV fields in cvdata.json stay employment-safe;
 * this module is the landing-page register only.
 */
export const landingInvite = {
  role: "AI-native product / agent engineer",
  place: "Available now",
  seat: "For product, agent, or customer-embedded applied AI.",
  thesis:
    "React and Node are common. What is scarce is shipping an agentic workflow in production with product taste, evals, and the judgment to keep a demo from becoming a liability.",
  summary:
    "At Oneflow I owned public API, CRM clients, permissions, and FlowType/TypeScript on a living SaaS, and I led a team. After that I shipped my own systems: kanithanj.ai, this site, and a local tuning lab. That work is personal, not lab employment. The named systems are the March to August 2026 slice of that stretch, not a tourist sabbatical.",
  independentSlice:
    "Listed projects are the March to August 2026 slice, not the whole interval from December 2024, and not a tourist sabbatical.",
  experienceLead:
    "Nine years in product companies, including team lead at Oneflow. Independent work after December 2024 is family care plus shipped products, not a sabbatical.",
  assets: [
    {
      title: "I have landed a product in other companies' tools",
      line: "At Oneflow I built CRM clients and a public API so the product worked inside HubSpot, SuperOffice, Salesforce, and Microsoft Dynamics, with their permission models, not a demo embed.",
    },
    {
      title: "An agent is a control loop, not a chat box",
      line: "On kanithanj.ai the work is gates. Cost, fit, rate limits, and a human promote before anything becomes permanent. The prompt is the cheap part.",
    },
    {
      title: "I design for when not to call the model",
      line: "If a signal is not worth the spend, the loop stops. Refusal is cheaper than a clever completion that should never have run.",
    },
    {
      title: "One data source, so tools cannot drift",
      line: "This site and the apply PDFs read one cvdata file. Role-fit packs do not silently fork the master record.",
    },
    {
      title: "I modernize a living codebase in place",
      line: "At Oneflow I moved a FlowType and JavaScript SaaS toward TypeScript with a history-preserving script. Type errors dropped about 70 percent. That saved more than 200 hours versus a rewrite.",
    },
    {
      title: "I go below the web stack when that is where it breaks",
      line: "Tamil metre analysis is a Rust parser compiled to WASM so it runs in the browser. kanithanj.ai is a local Tauri app with SQLite, not a hosted chat UI.",
    },
  ],
  credentialsIntro:
    "Courses I used at work and on my own systems. I still take them when the structure beats skimming with an agent.",
  credentialsQuote:
    "Grok and coding agents are becoming mostly sufficient even for advanced work. A well-made course still earns its keep. It compresses research, gives structure, and shows ways of thinking I would spend weeks finding alone. Curiosity does the rest. The courses worth paying for are ones I can apply now, without wasting money.",
  contactLead:
    "Hiring for product, agent, or customer-embedded AI work? Send the role and why you are writing.",
  contactAside: "Stockholm. Permanent senior IC. Product, agent, or customer-embedded work.",
  formPlaceholder: "Role, company, and why you are writing.",
} as const;
