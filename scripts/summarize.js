require("dotenv").config();

function sanitize(text = "") {
    return text
        .replace(/<[^>]*>/g, "")             
        .replace(/&nbsp;|&amp;|&quot;/g, " ")
        .replace(/[\u0000-\u001F\u007F]/g, "")
        .replace(/\s+/g, " ")                 
        .trim()
        .slice(0, 3000);                      
}

async function summarize(articleContent, title) {
    try {
        const safeTitle = sanitize(title);
        const safeContent = sanitize(articleContent);

        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [
                        {
                            role: "system",
                            content: `
                                You are a senior technology analyst and research intelligence system.

                                Your job is NOT just to summarize.

                                You must:
                                - Extract core technical meaning
                                - Remove fluff, marketing, and repetition
                                - Identify real-world impact
                                - Detect why developers/engineers should care
                                - Understand industry implications
                                - Act as a strict signal-vs-noise filter for tech news

                                Return STRICT JSON ONLY:

                                {
                                  "summary": "5-7 bullet points explaining the core ideas clearly",
                                  "importance": "low | medium | high",
                                  "why_it_matters": "2-4 sentences explaining real-world technical impact",
                                  "tags": ["tag1", "tag2", "tag3"],
                                  "key_insights": ["insight1", "insight2", "insight3"]
                                }

                                Rules:
                                - No markdown
                                - No explanations
                                - No extra text
                                - Be precise and technical
                                - If content is weak, mark importance as "low"
                            `
                        },
                        {
                            role: "user",
                            content: `
                                TITLE:
                                ${safeTitle}

                                ARTICLE:
                                ${(safeContent || "No content available").slice(0, 2000)}
                            `
                        }
                    ],
                    temperature: 0.3
                })
            }
        );

        const data = await response.json();

                                        // console.log(JSON.stringify(data, null, 2));

        if (data?.error) {
            throw new Error(data.error.message || "Groq API error");
        }

        const raw = data?.choices?.[0]?.message?.content;

        if (!raw) {
            return {
                summary: ["No AI output"],
                importance: "low",
                why_it_matters: "Skipped due to API limit or empty response.",
                tags: [],
                key_insights: []
            };
        }

        const cleaned = raw
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        return JSON.parse(cleaned);

    } catch (error) {
        console.log("AI summarization error occurred:", error.message);

        return {
            summary: ["Summary unavailable"],
            importance: "low",
            why_it_matters: "Unable to analyze due to API or parsing error.",
            tags: [],
            key_insights: []
        };
    }
}

module.exports = summarize;