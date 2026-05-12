export function generateMockResponse(message: string, enrollmentData?: string): string {
  const msg = message.toLowerCase();

  // Extract student name from enrollment record
  const nameMatch = enrollmentData?.match(/Name[:\s]+([^\n,]+)/i);
  const firstName = nameMatch
    ? nameMatch[1].trim().split(" ")[0]
    : "there";

  if (
    msg.includes("autumn") ||
    (msg.includes("subject") && (msg.includes("take") || msg.includes("should")))
  ) {
    return `Hi ${firstName}! Based on your enrolment record, here's my recommended study plan for the **Autumn session**:

**📚 Recommended Subjects (4 subjects · 20 Credit Points)**

1. **COMP3210 — Algorithms & Data Structures** *(Core — Required)*
   > Prerequisites met ✅ | Moderate difficulty · 4 hours/week contact

2. **MATH2050 — Linear Algebra** *(Mathematics requirement)*
   > Prerequisites met ✅ | Moderate workload · 3 hours/week contact

3. **COMP3340 — Software Engineering Fundamentals** *(Core — Required)*
   > Prerequisites met ✅ | Heavy assessment load · 4 hours/week contact

4. **COMP2890 — Human-Computer Interaction** *(Elective)*
   > No prerequisites needed | Light workload · 2 hours/week contact

**💡 Plan Notes:**
• Total weekly contact hours: ~13 hours
• Estimated self-study: ~25 hours/week
• COMP3450 (Computer Graphics) is also suitable but has a Week 10 deadline clash

Would you like me to explore alternative subject combinations or check your prerequisites for other courses?`;
  }

  if (msg.includes("game") || msg.includes("game development") || msg.includes("game dev")) {
    return `Great choice! Game development is an exciting career path. Here's a tailored study pathway based on your Computer Science degree:

**🎮 Game Development Pathway**

**Now (Year 2):**
• **COMP3450 — Computer Graphics** *(highly recommended — foundational)*
• **COMP2890 — Human-Computer Interaction** *(important for game UX)*

**Year 3:**
• **COMP4200 — Game Engine Architecture** *(needs COMP3210 first)*
• **COMP3360 — Real-time Rendering**
• **MATH3050 — Applied Mathematics for Games** *(elective)*

**Year 4:**
• **COMP4890 — Capstone: Game Development Project**
• **COMP4100 — Advanced Computer Graphics**

**📌 Extra Tips:**
• Join your university's Game Dev Society to build a portfolio
• Unity and Unreal Engine both offer free student licences
• Itch.io game jams are great for practical experience

Shall I work out a complete 4-year academic plan with prerequisite chains?`;
  }

  if (
    msg.includes("five") ||
    msg.includes("5 subject") ||
    msg.includes("overload") ||
    msg.includes("five subject")
  ) {
    return `I've reviewed your academic record to assess this request:

**📊 Workload Assessment**

• **Current GPA:** 5.8 / 7.0 ⭐ (strong performance)
• **Standard load:** 4 subjects (20 CP) per semester
• **Maximum allowed:** 5 subjects (25 CP) with overload approval
• **Overload eligibility:** ✅ You qualify (GPA > 5.0 required)

**⚠️ However, I'd caution against it because:**

1. Two of your planned subjects have major projects due in the **same week (Week 10)**
2. The average student taking 5 subjects experiences a **0.4 GPA drop**
3. Estimated weekly workload: ~50 study hours — quite demanding

**🎯 My Recommendation:**

Stick with **4 subjects this semester** and take the 5th in a Summer or Intensive session instead. Several core subjects run in Summer with lighter cohorts.

Would you like me to check which of your required subjects are available in Summer session?`;
  }

  if (msg.includes("prerequisite") || msg.includes("prereq")) {
    return `Let me check what you can enrol in right now based on your completed subjects:

**✅ Open to You Now:**
• **COMP3210** — Algorithms & Data Structures
• **COMP3340** — Software Engineering Fundamentals
• **COMP2890** — Human-Computer Interaction
• **MATH2050** — Linear Algebra
• **COMP3100** — Database Systems
• **COMP3450** — Computer Graphics

**🔒 Locked — More Prerequisites Needed:**
• **COMP4200** — Game Engine Architecture *(requires COMP3210 first)*
• **COMP4100** — Advanced Computer Graphics *(requires COMP3450)*
• **COMP4890** — Capstone Project *(requires 120 CP completed)*

**📋 Summary:**
You have **6 subjects** available to choose from right now across multiple specialisation streams.

Would you like a recommendation on which combination to prioritise this semester?`;
  }

  if (msg.includes("handbook") || msg.includes("rule") || msg.includes("policy") || msg.includes("allowed")) {
    return `Here are the key academic rules from your **Bachelor of Computer Science Handbook**:

**📋 Enrolment Rules**
• Standard load: **4 subjects per semester** (20 CP)
• Maximum load: **5 subjects** (requires GPA ≥ 5.0 and faculty approval)
• Minimum load for full-time status: **2 subjects**

**📝 Assessment Policies**
• Late submission penalty: **5% per calendar day** (automatic)
• Extensions must be requested **before the due date**
• Special Consideration available for medical or personal circumstances
• Academic misconduct: zero tolerance — automatic fail for the subject

**📈 Academic Progression**
• Must pass ≥ 50% of enrolled subjects per year
• GPA below 4.0 for two consecutive semesters → Academic Probation
• Three consecutive failures in the same subject → required withdrawal

**🎓 Graduation Requirements**
• Total: **240 credit points** (typically 8 semesters full-time)
• Must include all core subjects and at least one major specialisation

Is there a specific rule or policy you'd like more detail on?`;
  }

  if (msg.includes("gpa") || msg.includes("grade") || msg.includes("marks") || msg.includes("performance")) {
    return `Here's an overview of your **Academic Performance**:

**📊 Current GPA: 5.8 / 7.0** (Distinction average)

**Grade Scale:**
• 7.0 — High Distinction (HD) ≥ 85%
• 6.0 — Distinction (D) 75–84%
• **5.0 — Credit (CR) 65–74%** ← you're just above this band
• 4.0 — Pass (P) 50–64%
• < 4.0 — Fail

**Your completed subjects:**
• COMP1010 — Introduction to Programming: **HD (7.0)**
• COMP1020 — Data Structures: **D (6.0)**
• MATH1010 — Calculus I: **CR (5.0)**
• MATH1020 — Discrete Mathematics: **D (6.0)**

**💡 To reach a 6.0 GPA (Distinction average):**
You'd need to average approximately **6.5 across your next 4 subjects** — very achievable with your current trajectory!

Would you like study tips for any specific upcoming subjects?`;
  }

  // Default contextual response
  return `Thanks for your message! Let me pull up your academic profile...

**📋 Your Academic Summary**
• Degree: Bachelor of Computer Science (Year 2, Semester 1)
• Completed: 8 subjects (40 Credit Points)
• Remaining: ~16 subjects (80 CP) to graduation
• Current GPA: 5.8 / 7.0 ⭐

**I'm your personalised academic planning assistant.** Here's what I can help with:

• **📅 Subject selection** — Recommendations tailored to your goals
• **⚖️ Workload planning** — Balance your semester effectively
• **🗺️ Career pathways** — Align your subjects to your dream career
• **✅ Prerequisite checking** — See exactly what you can enrol in
• **📚 Handbook queries** — Rules, policies, and procedures explained
• **📊 GPA planning** — Strategies to hit your academic targets

Try asking me something like *"What subjects should I take this Autumn?"* or *"I want to get into game development — what should I study?"*`;
}
