require("dotenv").config();

async function summarize(articleContent, title) {
    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama3-70b-8192",
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
                                                    
                            Return STRICT JSON ONLY (no markdown, no commentary):
                                                    
                            {
                              "summary": "5-7 bullet points explaining the core ideas clearly",
                              "importance": "low | medium | high",
                              "why_it_matters": "2-4 sentences explaining real-world technical impact",
                              "tags": ["tag1", "tag2", "tag3"],
                              "key_insights": ["insight1", "insight2", "insight3"]
                            }
                                                    
                            Rules:
                            - Be extremely precise
                            - Prefer technical meaning over storytelling
                            - No fluff, no marketing tone
                            - If content is weak or repetitive, mark importance as "low"
                            `
                        },
                        {
                            role: "user",
                            content: `
                            TITLE:
                            ${title}
                                                    
                            ARTICLE:
                            ${articleContent || "No content available"}
                            `
                        }
                    ],
                    temperature: 0.5
                })
            }
        );

        const data = await response.json();

        const raw = data?.choices?.[0]?.message?.content;

        if (!raw) {
            throw new Error("Empty AI response");
        }

        const cleaned = raw.trim();

        return JSON.parse(cleaned);

    } catch (error) {
        console.log("AI summarization error occurred:", error.message);

        return {
            summary: ["Summary unavailable"],
            importance: "low",
            why_it_matters: "Unable to analyze due to API error.",
            tags: [],
            key_insights: []
        };
    }
}

module.exports = summarize;