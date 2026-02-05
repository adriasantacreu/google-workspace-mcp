import { google } from 'googleapis';
import * as path from 'path';
import * as fs from 'fs/promises';
import { fileURLToPath } from 'url';
import * as readline from 'readline/promises';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_FILE = path.join(__dirname, '../credentials.json');
const TOKEN_FILE = path.join(__dirname, '../token.json');
const SCOPES = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.announcements',
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/gmail.send'
];
async function authorize() {
    const content = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    const keys = JSON.parse(content);
    const key = keys.web || keys.installed;
    const oAuth2Client = new google.auth.OAuth2(key.client_id, key.client_secret, 'http://localhost' // Redirect URI
    );
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('--- AUTORITZACIÓ DE GOOGLE ---');
    console.log('1. Visita aquesta URL al teu navegador:');
    console.log(authUrl);
    console.log('\n2. Després d\'acceptar, seràs redirigit a una pàgina que fallarà (localhost).');
    console.log('3. COPIA el valor del paràmetre "code" de la URL del navegador.');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await rl.question('\nEnganxa el codi aquí: ');
    rl.close();
    const { tokens } = await oAuth2Client.getToken(code);
    await fs.writeFile(TOKEN_FILE, JSON.stringify(tokens));
    console.log('\n✅ Token guardat correctament a token.json');
}
authorize().catch(console.error);
