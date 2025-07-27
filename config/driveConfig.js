import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const refreshToken = process.env.REFRESH_TOKEN;
const redirectUri = process.env.REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  clientId,
  clientSecret,
  redirectUri
);

oauth2Client.setCredentials({ refresh_token: refreshToken });


const drive = google.drive({
    version: 'v3',
    auth: oauth2Client 
})

export { drive
 };
