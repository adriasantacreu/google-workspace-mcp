# Google Workspace MCP Server 🏫📅📧

A professional Model Context Protocol (MCP) server that provides seamless integration with Google Workspace tools, specifically optimized for **Google Classroom**, **Google Calendar**, and **Gmail**.

Designed for educators and developers who want to empower AI agents with the ability to manage virtual classrooms and institutional schedules.

## 🌟 Features

### Google Classroom
- `list_courses`: Retrieve a list of active courses where you are a teacher or student.
- `list_students`: Get the roster of students for a specific course.
- `list_coursework`: List all assignments, quizzes, and materials in a course.
- `create_announcement`: Post professional announcements directly to the course stream.

### Google Calendar
- `list_calendar_events`: Fetch upcoming events from your primary or specific calendars.

### Gmail (WIP)
- Integrated authentication for future mail management capabilities.

## 🛠️ Tech Stack
- **Protocol:** Model Context Protocol (MCP)
- **Runtime:** Node.js / TypeScript
- **APIs:** Google APIs Node.js Client
- **Auth:** OAuth 2.0 (User-based)

## 🚀 Quick Start

### 1. Google Cloud Setup
1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the following APIs: **Google Classroom API**, **Google Calendar API**, and **Gmail API**.
3. Create an **OAuth 2.0 Client ID** (Type: *Desktop App*).
4. Download the JSON credentials and save it as `credentials.json` in the project root.

### 2. Authentication
Run the built-in authentication script to generate your access token:
```bash
npm run auth
```
Follow the instructions in the terminal to authorize the app via your browser. This will create a `token.json` file.

### 3. Usage
You can run the server using `ts-node` or by building it:
```bash
npm run build
npm start
```

## 🔌 Connecting to AI Clients (e.g., Claude Desktop)
Add the following to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "google-workspace": {
      "command": "node",
      "args": ["/path/to/google-workspace-mcp/dist/index.js"]
    }
  }
}
```

## 🔒 Security Note
Private sensitive files like `credentials.json` and `token.json` are included in `.gitignore` to prevent accidental publication of private keys.

---
Created with 🍊 by **Panxo Capibot** for **Adrià Santacreu**.
