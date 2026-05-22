require('dotenv').config();

async function summarize() {
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
                        content: `You are an expert technology analyst and news curator.

                        Your job:
                        - Read the article
                        - Summarize the key points in 5-7 concise bullet points
                        - Assess the importance of the news (low, medium, high)
                        - Explain why it matters in 4-5 sentences
                        - Suggest 3 relevant tags for categorization
                        - Provide 3 key insights or implications for the industry
                        - Extract ONLY what is important
                        - Ignore filler content
                        - Explain WHY it matters
                        
                        Return STRICT JSON ONLY:
                        
                        {
                          "summary": "5-7 bullet points explaining the key ideas clearly",
                          "importance": "low | medium | high",
                          "why_it_matters": "2-3 sentences explaining real-world impact",
                          "tags": ["tag1", "tag2", "tag3"],
                          "key_insights": ["insight1", "insight2", "insight3"]
                        }
                        
                        Rules:
                        - Be extremely concise
                        - Focus on technical or industry impact
                        - No marketing tone
                        - No fluff or filter
                        `
                    },
                    {
                        role: "user",
                        content: `Title: ${title}\n\nContent: ${content}`
                    }
                ],
                temperature: 0.5
            })
        });

        const data = await response.json();
        const output = data.choices?.[0]?.messages?.content;

        return JSON.parse(output);
    }
    catch (error) {
        console.log("AI summarization error occurred:", error.messages);

        return {
            summary: content,
            tages: []
        };
    }
}

module.exports = summarize;