# Admin Panel — Role-Based Access Control

## Roles Reference

| Role | Description |
|------|-------------|
| `superadmin` | Full access to everything |
| `comics_admin` | Manages comics and chapters only |
| `character_admin` | Manages characters only |
| `research_admin` | Manages research papers only |
| `blog_admin` | Manages blogs, FAQs, and timeline only |
| `career_admin` | Manages job postings only |
| `hr_manager` | Full HR system access + audit log |
| `manager` | HR system access (no audit log) |
| `team_lead` | HR system access (no audit log) |

---

## What Each Role Can See

### `superadmin`
- Home, Comics, Characters, Research, Blogs, FAQs, Timeline, Career
- Users, Admin Mgmt, Contact Queries, Wiki, Infinito AI
- Full HR System (all items including Audit Log)

### `comics_admin`
- Home
- Comics (manage comics + chapters)

### `character_admin`
- Home
- Characters

### `research_admin`
- Home
- Research

### `blog_admin`
- Home
- Blogs, FAQs, Timeline

### `career_admin`
- Home
- Career

### `hr_manager`
- HR System: Employees, Notifications, **Audit Log**, Attendance, Leaves,
  Calendar, Task Board, Work Assignment, Projects, Performance, Goals,
  Recognition, Payroll, Onboarding, Documents, Recruitment, Chat, Self Service

### `manager`
- HR System: Employees, Notifications, Attendance, Leaves, Calendar,
  Task Board, Work Assignment, Projects, Performance, Goals,
  Recognition, Payroll, Onboarding, Documents, Recruitment, Chat, Self Service
- *(No Audit Log)*

### `team_lead`
- Same as `manager`

---

## Rules

1. **Content admins** (`comics_admin`, `character_admin`, `research_admin`, `blog_admin`, `career_admin`)
   have **zero access** to the HR system. Assigning a content role does not grant HR visibility.

2. **HR roles** (`hr_manager`, `manager`, `team_lead`) have **zero access** to content
   sections (Comics, Characters, Research, Blogs, etc.).

3. Only `superadmin` can access: Users, Admin Mgmt, Contact Queries, Wiki, Infinito AI.

4. A person can hold **multiple roles** (e.g. `research_admin` + `hr_manager`) if they
   need access to both systems — assign both roles via Admin Mgmt.

---

## Current Bug (Fixed)

`HR_ALL` previously included content admin roles, meaning a `research_admin`
could see the entire HR system. Fixed by restricting HR items to only
`superadmin`, `hr_manager`, `manager`, and `team_lead`.
