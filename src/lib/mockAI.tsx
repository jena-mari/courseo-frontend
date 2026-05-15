export function generateMockResponse(
  message: string,
  enrollmentData?: string
): string {
  const msg = message.toLowerCase();

  // Extract student name
  const nameMatch = enrollmentData?.match(/Name[:\s]+([^\n,]+)/i);

  const firstName = nameMatch
    ? nameMatch[1].trim().split(" ")[0]
    : "there";

  // AUTUMN SUBJECT PLANNING
  if (
    msg.includes("autumn") ||
    (msg.includes("subject") &&
      (msg.includes("take") || msg.includes("should")))
  ) {
    return `Hi ${firstName}! Based on your current progression in the Bachelor of Computer Science, here’s a recommended study plan for your next Autumn session.

## 📚 Recommended Autumn Study Plan
**20 Credit Points · Standard Full-Time Load**

### Core Subjects
1. **CSCI203 — Algorithms and Data Structures**
   → Essential core subject for software engineering, AI, and game development pathways.

2. **CSCI251 — Advanced Programming**
   → Builds practical software development and object-oriented design skills.

3. **CSIT214 — Database Management Systems**
   → Covers relational databases, SQL, and backend system design.

4. **CSCI235 — Database Systems Development**
   → Strong complement to CSIT214 with practical application focus.

## 📊 Estimated Workload
• Weekly contact hours: ~12–14 hours  
• Recommended independent study: ~20–25 hours/week  
• Assessment intensity: Moderate to High

## 💡 Planning Notes
• This combination keeps you aligned with most UOW Computer Science majors.
• Algorithms + Advanced Programming together create a heavier coding workload, but they are commonly paired.
• You remain on track for specialisations like:
  - Software Engineering
  - Cyber Security
  - Game & Mobile Development
  - Artificial Intelligence & Big Data

Would you like me to:
• build a lighter workload version,
• generate a 3-year study roadmap,
• or recommend subjects for a specific career path?`;
  }

  // GAME DEVELOPMENT
  if (
    msg.includes("game") ||
    msg.includes("game development") ||
    msg.includes("game dev")
  ) {
    return `Great choice, ${firstName}! The Game & Mobile Development pathway in the Bachelor of Computer Science is one of the most creative specialisations at UOW.

## 🎮 Suggested Game Development Pathway

### Year 1–2 Foundations
• **CSCI203 — Algorithms and Data Structures**  
• **CSCI251 — Advanced Programming**  
• **CSIT111 — Programming Fundamentals**  
• **CSIT121 — Object Oriented Design and Programming**

These subjects build the programming foundation needed for graphics and engine development.

### Year 2–3 Focus Areas
• Computer Graphics  
• Human-Computer Interaction  
• Mobile Application Development  
• Real-Time Systems  
• Software Engineering Practices

## 🕹️ Skills You Should Build Alongside Uni
• Unity or Unreal Engine
• Git/GitHub collaboration
• 3D math and vectors
• Game physics basics
• Portfolio projects and game jams

## 🚀 Career Outcomes
Graduates commonly move into:
• Gameplay Programming
• Technical Design
• Mobile App Development
• Graphics Programming
• Backend Game Services
• Software Engineering

## 💡 Industry Advice
A strong portfolio matters just as much as grades in game development. Small polished projects usually stand out more than large unfinished ones.

Would you like me to generate:
• a semester-by-semester game dev roadmap,
• recommended electives,
• or a portfolio plan for internships?`;
  }

  // OVERLOAD
  if (
    msg.includes("five") ||
    msg.includes("5 subject") ||
    msg.includes("overload")
  ) {
    return `I've reviewed your request for a 5-subject overload semester.

## 📊 Academic Load Analysis

### Current Position
• Degree: Bachelor of Computer Science  
• Current GPA: 5.8 / 7.0  
• Standard full-time load: 20 Credit Points  
• Overload study: Requires faculty approval

## ⚠️ Important Considerations
Taking 5 technical subjects simultaneously in Computer Science can become extremely demanding because many subjects include:
• weekly labs,
• coding assignments,
• group projects,
• and practical assessments.

A typical overload semester can reach:
• ~16–18 contact hours/week
• ~35–50 total study hours/week

## 💡 My Recommendation
Based on your current performance, you could likely manage an overload if:
• you are not working many hours externally,
• you maintain strong time management,
• and your subjects are balanced carefully.

However, I would avoid pairing too many programming-heavy subjects together in the same session.

## ✅ Better Alternative
Many students instead:
• take Summer subjects,
• spread difficult coding subjects across sessions,
• or use Spring/Summer to accelerate progression with less burnout.

Would you like me to build:
• a realistic 5-subject timetable,
• a balanced 4-subject alternative,
• or a fast-track graduation plan?`;
  }

  // PREREQUISITES
  if (msg.includes("prerequisite") || msg.includes("prereq")) {
    return `Based on your completed subjects, here’s a snapshot of what you’re likely eligible to enrol in next.

## ✅ Available Subjects
• **CSCI203 — Algorithms and Data Structures**  
• **CSCI251 — Advanced Programming**  
• **CSIT214 — Database Management Systems**  
• **CSCI235 — Database Systems Development**  
• **ISIT219 — Network Design and Management**

## 🔒 Subjects Likely Still Locked
These usually require additional prerequisites or higher-level progression:

• Advanced capstone/project subjects  
• Certain cybersecurity specialisations  
• Some third-year AI and graphics subjects

## 📌 Important Notes
At UOW:
• 100-level subjects are typically first-year,
• 200-level subjects are second-year,
• 300-level subjects are advanced/specialisation subjects.

Eligibility depends primarily on:
• completed prerequisites,
• total credit points,
• and degree progression requirements.

Would you like me to:
• map your prerequisite chains,
• identify missing requirements,
• or show the fastest pathway to a specialisation?`;
  }

  // HANDBOOK / POLICY
  if (
    msg.includes("handbook") ||
    msg.includes("rule") ||
    msg.includes("policy") ||
    msg.includes("allowed")
  ) {
    return `Here are some key academic rules and degree details from the UOW Bachelor of Computer Science handbook.

## 📘 Degree Overview
• Course: Bachelor of Computer Science  
• Duration: 3 years full-time  
• Total Requirement: 144 Credit Points  
• Intake Sessions: Autumn and Spring

## 🧩 Available Majors
• Artificial Intelligence & Big Data  
• Cyber Security  
• Digital Systems Security  
• Game & Mobile Development  
• Software Engineering

## 📋 General Study Rules
• Standard full-time load: 20 CP per session  
• Most subjects are worth 6 CP  
• Overloads require approval  
• Prerequisites must be satisfied before enrolment

## ⚠️ Academic Progression
Students may face academic progression monitoring if they:
• repeatedly fail subjects,
• fall below progression requirements,
• or fail prerequisite/core subjects multiple times.

## 💡 Good Planning Strategy
UOW Computer Science students generally benefit from:
• spreading coding-heavy subjects,
• completing prerequisites early,
• and building portfolio projects alongside coursework.

Would you like help understanding:
• majors,
• graduation requirements,
• subject sequencing,
• or handbook terminology?`;
  }

  // GPA
  if (
    msg.includes("gpa") ||
    msg.includes("grade") ||
    msg.includes("marks") ||
    msg.includes("performance")
  ) {
    return `Here’s a snapshot of your current academic performance.

## 📊 Academic Performance Overview

### Current GPA
**5.8 / 7.0**  
→ Equivalent to a strong Credit / low Distinction average.

## 🎓 UOW GPA Scale
• 7.0 → High Distinction (85–100)  
• 6.0 → Distinction (75–84)  
• 5.0 → Credit (65–74)  
• 4.0 → Pass (50–64)

## 💡 Performance Insights
Your current results suggest:
• strong progression,
• solid technical understanding,
• and good standing for most Computer Science specialisations.

## 📈 GPA Projection
If you maintain mostly:
• Distinctions (6s),
• with occasional Credits or HDs,

you could realistically graduate with:
• a Distinction average,
• competitive internship eligibility,
• and strong postgraduate options.

## 🚀 Recommended Focus Areas
To improve GPA efficiently:
• prioritise consistent assignment marks,
• avoid overloading difficult coding subjects,
• and begin major projects early.

Would you like:
• GPA target calculations,
• WAM estimates,
• or subject-specific study strategies?`;
  }

  // DEFAULT
  return `Hi ${firstName}! I’m your AI academic planning assistant for the Bachelor of Computer Science at UOW.

## 🎓 Your Academic Snapshot
• Degree: Bachelor of Computer Science  
• Estimated progression: Year 2  
• Current GPA: 5.8 / 7.0  
• Remaining study: ~2 years full-time

## 💡 I Can Help With
• 📅 Subject recommendations  
• 🧩 Prerequisite checking  
• 🎮 Career pathway planning  
• 📊 GPA and workload analysis  
• 📘 Handbook and policy questions  
• 🗺️ Long-term study roadmaps

## 🚀 Popular Pathways
• Software Engineering  
• Cyber Security  
• Artificial Intelligence & Big Data  
• Game & Mobile Development

Try asking something like:
• “What subjects should I take next Autumn?”
• “Can I overload next semester?”
• “I want to become a game developer.”
• “What prerequisites am I missing?”
• “Help me plan my degree roadmap.”`;
}