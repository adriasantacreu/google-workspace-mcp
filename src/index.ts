import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURACIÓ ---
const CREDENTIALS_FILE = path.join(__dirname, '../credentials.json');
const TOKEN_FILE = path.join(__dirname, '../token.json');
const SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.announcements',
    'https://www.googleapis.com/auth/classroom.rosters.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me',
    'https://www.googleapis.com/auth/classroom.coursework.students',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.send'
];

async function getOAuth2Client() {
    try {
        const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
        const keys = JSON.parse(content);
        const key = keys.installed || keys.web;
        const oAuth2Client = new google.auth.OAuth2(
            key.client_id,
            key.client_secret,
            'http://localhost'
        );

        try {
            const token = await fs.readFile(TOKEN_FILE, 'utf-8');
            oAuth2Client.setCredentials(JSON.parse(token));
        } catch (e) {
            return { client: oAuth2Client, needsAuth: true };
        }

        return { client: oAuth2Client, needsAuth: false };
    } catch (error) {
        throw new Error(`Error carregant credencials: ${error}`);
    }
}

const server = new Server(
    { name: "google-workspace-mcp", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_courses",
                description: "Llista els cursos de Google Classroom.",
                inputSchema: { type: "object", properties: {} },
            },
            {
                name: "list_students",
                description: "Llista els alumnes d'un curs concret.",
                inputSchema: {
                    type: "object",
                    properties: {
                        courseId: { type: "string", description: "ID del curs" },
                    },
                    required: ["courseId"],
                },
            },
            {
                name: "list_coursework",
                description: "Llista les tasques (deures) d'un curs.",
                inputSchema: {
                    type: "object",
                    properties: {
                        courseId: { type: "string", description: "ID del curs" },
                    },
                    required: ["courseId"],
                },
            },
            {
                name: "create_announcement",
                description: "Publica un anunci al tauler del curs.",
                inputSchema: {
                    type: "object",
                    properties: {
                        courseId: { type: "string", description: "ID del curs" },
                        text: { type: "string", description: "Text de l'anunci" },
                    },
                    required: ["courseId", "text"],
                },
            },
            {
                name: "list_calendar_events",
                description: "Llista els pròxims esdeveniments del calendari.",
                inputSchema: {
                    type: "object",
                    properties: {
                        calendarId: { type: "string", description: "ID del calendari (default: primary)" },
                    },
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { client, needsAuth } = await getOAuth2Client();
    if (needsAuth) {
        return { content: [{ type: "text", text: "ERROR: Cal autorització OAuth2." }], isError: true };
    }

    const classroom = google.classroom({ version: 'v1', auth: client });
    const calendar = google.calendar({ version: 'v3', auth: client });

    try {
        const name = request.params.name;
        const args = (request.params.arguments as any) || {};

        if (name === "list_courses") {
            const res = await classroom.courses.list({ pageSize: 20 });
            return { content: [{ type: "text", text: JSON.stringify(res.data.courses?.map(c => ({ name: c.name, id: c.id })), null, 2) }] };
        }

        if (name === "list_students") {
            const res = await classroom.courses.students.list({ courseId: args.courseId });
            return { content: [{ type: "text", text: JSON.stringify(res.data.students?.map(s => s.profile?.name?.fullName), null, 2) }] };
        }

        if (name === "list_coursework") {
            const res = await classroom.courses.courseWork.list({ courseId: args.courseId });
            return { content: [{ type: "text", text: JSON.stringify(res.data.courseWork?.map(cw => ({ title: cw.title, id: cw.id })), null, 2) }] };
        }

        if (name === "create_announcement") {
            const res = await classroom.courses.announcements.create({
                courseId: args.courseId,
                requestBody: { text: args.text, state: 'PUBLISHED' },
            });
            return { content: [{ type: "text", text: `Anunci creat: ${res.data.alternateLink}` }] };
        }

        if (name === "list_calendar_events") {
            const res = await calendar.events.list({
                calendarId: args.calendarId || 'primary',
                timeMin: (new Date()).toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime',
            });
            return { content: [{ type: "text", text: res.data.items?.map(e => `${e.start?.dateTime || e.start?.date}: ${e.summary}`).join('\n') || "No hi ha esdeveniments." }] };
        }

        throw new Error(`Tool ${name} no trobada.`);
    } catch (error: any) {
        return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch(console.error);
