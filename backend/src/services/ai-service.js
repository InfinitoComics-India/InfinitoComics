import AIConversationRepository from "../repository/aiConversation-repository.js";
import EmployeeRepository from "../repository/employee-repository.js";
import TaskRepository from "../repository/task-repository.js";
import ProjectRepository from "../repository/project-repository.js";
import AttendanceRepository from "../repository/attendance-repository.js";
import LeaveRepository from "../repository/leave-repository.js";
import SelfServiceRequestRepository from "../repository/selfServiceRequest-repository.js";
import WikiArticleRepository from "../repository/wikiArticle-repository.js";
import PerformanceRepository from "../repository/performance-repository.js";

// ── Groq integration (OpenAI-compatible API) ─────────────────
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL   = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are Infinito AI, the official AI assistant of InfinitoComics India — India's first and most ambitious original superhero comics universe.

## About InfinitoComics India
- **Company**: InfinitoComics India (infinitohq.com)
- **Mission**: Building India's most prominent character-based entertainment company with a library of more than 2000+ superheroes
- **Products**: Original Indian superhero comics, animation, games, research papers, Infinito Ultimate (premium subscription), merchandise, community platform
- **Key Platforms**: infinitohq.com (main), admin.infinitohq.com (admin), research.infinitohq.com, foundation.infinitohq.com
- **Business Hours**: Monday – Friday, 9:00AM – 6:00PM CT

## Personality & Scope
You are a brilliant, friendly, and versatile AI. You can answer ANYTHING — not just company topics. Think of yourself as a knowledgeable friend who also happens to work at InfinitoComics. You help with:
- 🦸 InfinitoComics universe, characters, storylines, comics
- 👥 HR data: employees, tasks, projects, attendance, leaves, performance
- 🛒 Shop, merchandise, Infinito Ultimate subscription
- 📚 Research, foundation, careers, internships
- 🍕 Food recommendations, recipes, what to eat
- 💡 General knowledge, life advice, productivity tips
- 🧠 Coding help, writing, brainstorming, creative ideas
- 🌍 Current events, science, history, culture
- 😄 Fun, jokes, casual conversation — anything!

## Response Rules
- Be warm, confident, and helpful — like a smart friend
- Use **bold** for emphasis, bullet points for lists, headers for long responses
- Use ₹ for Indian currency
- Keep responses concise but complete
- For HR/company data, use the real-time context provided below
- Never refuse a reasonable question — always try to help
- Add a touch of Infinito brand pride when relevant

Today's date: ${new Date().toDateString()}`;

class AIService {
  constructor() {
    this.convRepo         = new AIConversationRepository();
    this.employeeRepo     = new EmployeeRepository();
    this.taskRepo         = new TaskRepository();
    this.projectRepo      = new ProjectRepository();
    this.attendanceRepo   = new AttendanceRepository();
    this.leaveRepo        = new LeaveRepository();
    this.ssRepo           = new SelfServiceRequestRepository();
    this.wikiRepo         = new WikiArticleRepository();
    this.perfRepo         = new PerformanceRepository();
  }

  // ── Pull relevant context from MongoDB based on the question ──
  async _buildContext(question) {
    const q = question.toLowerCase();
    let context = "";

    try {
      // Employees
      if (q.includes("employee") || q.includes("team") || q.includes("staff") || q.includes("who")) {
        const employees = await this.employeeRepo.getAllActive();
        context += `\n\n## Active Employees (${employees.length} total)\n`;
        employees.slice(0, 15).forEach(e => {
          context += `- ${e.firstName} ${e.lastName} | ${e.designation} | ${e.department} | ${e.employmentType} | ${e.hrRole}\n`;
        });
      }

      // Tasks / overdue
      if (q.includes("task") || q.includes("overdue") || q.includes("kanban") || q.includes("work")) {
        const overdue = await this.taskRepo.getOverdue();
        context += `\n\n## Overdue Tasks (${overdue.length})\n`;
        overdue.slice(0, 10).forEach(t => {
          context += `- [${t.taskId}] "${t.title}" | Assigned to: ${t.assignedTo?.firstName||"Unassigned"} | Deadline: ${t.deadline ? new Date(t.deadline).toDateString() : "None"}\n`;
        });
      }

      // Projects
      if (q.includes("project") || q.includes("status") || q.includes("health")) {
        const projects = await this.projectRepo.getAllActive();
        context += `\n\n## Active Projects (${projects.length})\n`;
        projects.slice(0, 10).forEach(p => {
          context += `- [${p.projectId}] "${p.name}" | Status: ${p.status} | Health: ${p.health} | Progress: ${p.progress}% | Manager: ${p.projectManager?.firstName||"N/A"}\n`;
        });
      }

      // Attendance (today)
      if (q.includes("attendance") || q.includes("present") || q.includes("absent") || q.includes("today")) {
        const today = await this.attendanceRepo.getByDate(new Date());
        const present = today.filter(r => ["present","late"].includes(r.status)).length;
        const absent  = today.filter(r => r.status === "absent").length;
        const onLeave = today.filter(r => r.status === "on_leave").length;
        context += `\n\n## Today's Attendance\n- Present: ${present}\n- Absent: ${absent}\n- On Leave: ${onLeave}\n- Total Tracked: ${today.length}\n`;
      }

      // Pending leaves
      if (q.includes("leave") || q.includes("pending") || q.includes("approval")) {
        const pending = await this.leaveRepo.getPending();
        context += `\n\n## Pending Leave Requests (${pending.length})\n`;
        pending.slice(0, 8).forEach(l => {
          context += `- ${l.employeeId?.firstName||"?"} ${l.employeeId?.lastName||"?"} | ${l.leaveType} | ${new Date(l.fromDate).toDateString()} to ${new Date(l.toDate).toDateString()} | ${l.totalDays} days\n`;
        });
      }

      // Open self-service requests
      if (q.includes("request") || q.includes("support") || q.includes("open")) {
        const open = await this.ssRepo.getOpen();
        context += `\n\n## Open Self Service Requests (${open.length})\n`;
        open.slice(0, 8).forEach(r => {
          context += `- ${r.employeeName} | ${r.type.replace(/_/g," ")} | "${r.subject}" | Priority: ${r.priority}\n`;
        });
      }

      // Wiki search
      if (q.includes("policy") || q.includes("how to") || q.includes("guide") || q.includes("process") || q.includes("wiki")) {
        const articles = await this.wikiRepo.getPublished();
        context += `\n\n## Knowledge Base Articles (${articles.length} published)\n`;
        articles.slice(0, 8).forEach(a => {
          context += `- "${a.title}" | Category: ${a.category} | Views: ${a.views}\n`;
        });
      }

    } catch (e) {
      console.error("AIService._buildContext error (non-fatal):", e.message);
    }

    return context;
  }

  // ── Main chat function ─────────────────────────────────────
  async chat(conversationId, userMessage, userId, userName) {
    const apiKey = process.env.GROQ_API_KEY;

    try {
      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await this.convRepo.getById(conversationId);
      }
      if (!conversation) {
        conversation = await this.convRepo.create({
          userId,
          userName,
          title: userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : ""),
          messages: [],
        });
      }

      // Add user message to DB
      await this.convRepo.addMessage(conversation._id, { role: "user", content: userMessage });

      // If no API key — return smart mock response
      if (!apiKey || apiKey === "your_groq_api_key") {
        const context = await this._buildContext(userMessage);
        const mockReply = await this._mockResponse(userMessage, context);
        await this.convRepo.addMessage(conversation._id, { role: "assistant", content: mockReply });
        return { conversationId: conversation._id, reply: mockReply, mock: true };
      }

      // Build context from live DB data
      const context = await this._buildContext(userMessage);

      // Build messages array for Groq
      // Use messages BEFORE the current user message was added (slice -12 excluding last)
      const systemWithContext = SYSTEM_PROMPT + (context ? `\n\n## Current Company Data${context}` : "");
      const history = conversation.messages.slice(-13, -1); // exclude the just-added user message
      const messages = [
        { role: "system", content: systemWithContext },
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: "user", content: userMessage }, // add current message explicitly
      ];

      // Call Groq API (OpenAI-compatible)
      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || "Groq API error");
      }

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";

      // Save assistant reply
      await this.convRepo.addMessage(conversation._id, { role: "assistant", content: reply });

      // Auto-update title after first exchange
      if (conversation.messages.length <= 2) {
        const shortTitle = userMessage.substring(0, 50) + (userMessage.length > 50 ? "..." : "");
        await this.convRepo.updateTitle(conversation._id, shortTitle);
      }

      return { conversationId: conversation._id, reply };

    } catch (e) {
      console.error("AIService.chat:", e);
      throw e;
    }
  }

  // ── Mock response when no API key ─────────────────────────
  async _mockResponse(question, context) {
    const q = question.toLowerCase();

    if (q.includes("employee") || q.includes("team") || q.includes("staff")) {
      const count = (context.match(/^- /gm) || []).length;
      return `Based on current data, here's what I found about your team:\n\n${context.includes("Active Employees") ? context.split("##")[1]?.split("##")[0] || "No employee data available." : "No employee data found."}\n\n*Note: Connect an OpenAI API key in backend/.env for full AI responses.*`;
    }
    if (q.includes("overdue") || q.includes("task")) {
      return `Here are the current overdue tasks:\n\n${context.includes("Overdue Tasks") ? context.split("## Overdue")[1]?.split("##")[0] || "No overdue tasks." : "No overdue tasks found."}\n\n*Note: Add OPENAI_API_KEY to backend/.env for intelligent AI responses.*`;
    }
    if (q.includes("project")) {
      return `Current project status:\n\n${context.includes("Active Projects") ? context.split("## Active Projects")[1]?.split("##")[0] || "No projects found." : "No active projects."}\n\n*Note: Add OPENAI_API_KEY to backend/.env for full AI analysis.*`;
    }
    if (q.includes("attendance") || q.includes("today")) {
      return `Today's attendance summary:\n\n${context.includes("Today's Attendance") ? context.split("## Today's Attendance")[1]?.split("##")[0] || "" : "No attendance data for today."}\n\n*Note: Add OPENAI_API_KEY to backend/.env for AI-powered insights.*`;
    }
    if (q.includes("leave") || q.includes("pending")) {
      return `Pending leave requests:\n\n${context.includes("Pending Leave") ? context.split("## Pending Leave")[1]?.split("##")[0] || "No pending leaves." : "No pending leave requests."}\n\n*Note: Add OPENAI_API_KEY to backend/.env.*`;
    }
    if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      return `Hello! I'm **Infinito AI** — the official assistant of InfinitoComics India. 🌟\n\nI know everything about Infinito:\n- 🦸 Characters, comics, storylines & the universe\n- 🎮 Games, animation & Infinito Ultimate\n- 👥 Team, employees & HR operations\n- ✅ Tasks, projects & work assignments\n- 📅 Attendance, leaves & payroll\n- 🛒 Shop, merchandise & products\n- 📚 Research papers & foundation\n- 🎓 Careers & internships\n\nWhat would you like to explore?`;
    }

    return `I received your question: *"${question}"*\n\nI found the following relevant data:\n${context || "No specific data matched your query."}\n\n**To enable full AI responses:** Add your OpenAI API key to \`backend/.env\`:\n\`\`\`\nOPENAI_API_KEY=sk-...\n\`\`\``;
  }

  async getConversations(userId) {
    try { return await this.convRepo.getForUser(userId); }
    catch (e) { console.error("AIService.getConversations:", e); throw e; }
  }

  async getConversation(id) {
    try { return await this.convRepo.getById(id); }
    catch (e) { console.error("AIService.getConversation:", e); throw e; }
  }

  async deleteConversation(id) {
    try { return await this.convRepo.archive(id); }
    catch (e) { console.error("AIService.deleteConversation:", e); throw e; }
  }

  async clearAll(userId) {
    try { return await this.convRepo.clearAll(userId); }
    catch (e) { console.error("AIService.clearAll:", e); throw e; }
  }
}

export default AIService;
