# Write once, post everywhere: automate cross-posting to Twitter, LinkedIn & Facebook with n8n (free JSON)

Category: development

Published: Fri, 22 May 2026 08:51:02 +0000

Source: https://dev.to/flowkithq/write-once-post-everywhere-automate-cross-posting-to-twitter-linkedin-facebook-with-n8n-free-n46

---

## Summary

Every time I finished writing a post, I had the same 10-minute ritual:
Open Twitter â€• paste, trim to 280 chars, add hashtags
Open LinkedIn â€• paste, add professional hashtags, reformat
Open Facebook â€• paste, adjust tone
Repeat until my soul left my body
For a 3-platform strategy, that's 30 minutes of copy-pasting per day. 3.5 hours a week. Completely mechanical work.
So I automated it with n8n. Here's the exact workflow I use â€” full JSON you can import right now.
Web form â€” you fill in your content and pick platforms (twitter, linkedin, facebook)
Format per platform â€” trims Twitter to 280 chars, adds LinkedIn hashtags, keeps Facebook full
Route & post â€” splits into parallel branches, hits each platform's API simultaneously
Done â€” all 3 platforms posted in under 2 seconds
No more switching tabs. No more character count anxiety. Just write once.
Copy this, open n8n â†’ Import from JSON:
{
  "name": "Social Media Cross-Poster",
  "nodes": [
    {
      "parameters": {
        "formTitle": "Create Social Post",
        "formFields": { "values": [
          { "fieldLabel": "Content", "fieldType": "textarea", "requiredField": true },
          { "fieldLabel": "Platforms", "fieldType": "text", "placeholder": "twitter,linkedin,facebook" }
        ]}
      },
      "id": "s1", "name": "Post Form", "type": "n8n-nodes-base.formTrigger", "typeVersion": 2.2, "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "const content = $input.first().json.Content;\nconst platforms = ($input.first().json.Platforms || 'twitter,linkedin').split(',').map(p => p.trim().toLowerCase());\nconst posts = [];\nif (platforms.includes('twitter')) {\n  const t = content.length > 280 ? content.substring(0, 277) + '...' : content;\n  posts.push({ platform: 'twitter', text: t, charCount: t.length, maxChars: 280 });\n}\nif (platforms.includes('linkedin')) {\n  posts.push({ platform: 'linkedin', text: content + '\\n\\n#business #automation #productivity', charCount: content.length, maxChars: 3000 });\n}\nif (platforms.includes('facebook')) {\n  posts.push({ platform: 'facebook', text: content, charCount: content.length, maxChars: 63206 });\n}\nreturn posts.map(p => ({ json: p }));"
      },
      "id": "s2", "name": "Format Per Platform", "type": "n8n-nodes-base.code", "typeVersion": 2, "position": [480, 300]
    },
    {
      "parameters": {
        "conditions": { "conditions": [
          { "leftValue": "={{ $json.platform }}", "rightValue": "twitter", "operator": { "type": "string", "operation": "equals" } }
        ]}
      },
      "id": "s3", "name": "Route by Platform", "type": "n8n-nodes-base.switch", "typeVersion": 3.2, "position": [700, 300]
    },
    {
      "parameters": { "method": "POST", "url": "https://api.twitter.com/2/tweets", "sendBody": true, "bodyParameters": { "parameters": [{ "name": "text", "value": "={{ $json.text }}" }] } },
      "id": "s4", "name": "Post Twitter", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [920, 160]
    },
    {
      "parameters": { "method": "POST", "url": "https://api.linkedin.com/v2/ugcPosts", "sendBody": true, "bodyParameters": { "parameters": [{ "name": "text", "value": "={{ $json.text }}" }] } },
      "id": "s5", "name": "Post LinkedIn", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [920, 340]
    },
    {
      "parameters": { "method": "POST", "url": "https://graph.facebook.com/v18.0/me/feed", "sendBody": true, "bodyParameters": { "parameters": [{ "name": "message", "value": "={{ $json.text }}" }] } },
      "id": "s6", "name": "Post Facebook", "type": "n8n-nodes-base.httpRequest", "typeVersion": 4.2, "position": [920, 520]
    }
  ],
  "connections": {
    "Post Form": { "main": [[{ "node": "Format Per Platform", "type": "main", "index": 0 }]] },
    "Format Per Platform": { "main": [[{ "node": "Route by Platform", "type": "main", "index": 0 }]] },
    "Route by Platform": { "main": [[{ "node": "Post Twitter", "type": "main", "index": 0 }], [{ "node": "Post LinkedIn", "type": "main", "index": 0 }], [{ "node": "Post Facebook", "type": "main", "index": 0 }]] }
  },
  "settings": { "executionOrder": "v1" },
  "tags": [{ "name": "social-media" }]
}

Step 1: Get your API credentials
Twitter/X: Create an app at developer.twitter.com. You need OAuth 1.0a credentials (Consumer Key, Consumer Secret, Access Token, Access Secret). Add them as n8n credentials under "Twitter OAuth1 API".
LinkedIn: Go to linkedin.com/developers, create an app, request "Share on LinkedIn" permission. You'll get a Client ID and Secret for OAuth2. Add as n8n "LinkedIn OAuth2 API" credentials.
Facebook: Create a Facebook App, get a Page Access Token with pages_manage_posts permission. Swap the URL in the Facebook node to https://graph.facebook.com/v18.0/{YOUR_PAGE_ID}/feed.
Step 2: Connect credentials to nodes
In n8n, click each HTTP Request node (Post Twitter, Post LinkedIn, Post Facebook) and set the "Authentication" dropdown to your stored credentials.
Step 3: Activate and test
Click "Activate" to enable the form trigger
Visit the form URL (n8n shows it after activation)
Type "This is a test post" â€” select twitter, linkedin
Submit and check your profiles
1. Add scheduling support
Replace the Form Trigger with a Schedule Trigger + a Google Sheets node to read pre-written posts from a spreadsheet. Set the cron to run every day at 9am. One spreadsheet column per platform.
2. Customize hashtags per topic
Add a second Code node before the formatter. Read the post content, extract keywords, look up a hashtag map object in the code. Auto-inject topic-specific hashtags.
3. Engagement tracking
After each platform post, add a Google Sheets append row. Store: post text, platform, timestamp, and the post ID returned by the API. Later you can fetch engagement metrics by ID.
4. Add Instagram
Instagram requires a Facebook Business account and uses the Graph API differently (need to create a media container first, then publish). I left it out of the base version to keep setup simple â€” but the extra 2 nodes are well-documented in Meta's API docs.
5. Handle rate limits
Add a Wait node (1-2 seconds) between platform posts if you're posting at volume. Twitter's free tier is 1,300 tweets/month â€” more than enough for one account.
This workflow is part of a bigger collection I've been building: 15 ready-to-use n8nÂ workflow templates covering email automation, CRM integration, invoice generation, AI support bots, and more.
If you want all 15 workflows pre-built and ready to import (plus setup guides for each), they're at straipeai.gumrawd.com â€” each template also sold individually if you only need one.
The cross-poster is $19 standalone. Or grab the complete bundle and get all 15 for $97.
Questions? Drop a comment â€” happy to help with API setup or customizing the formatter.

---

## Notes
- Add insightful notes here
