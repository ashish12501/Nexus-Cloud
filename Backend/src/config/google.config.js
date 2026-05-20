// config/google.config.js
import { google } from "googleapis";
import "dotenv/config"; // Ensures your .env file is loaded here

// 1. Initialize the OAuth2 client using your specific app credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground",
);

// 2. Set the permanent refresh token so it never logs you out
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

// 3. Export the Drive instance powered by YOU, not a bot
export const drive = google.drive({ version: "v3", auth: oauth2Client });
