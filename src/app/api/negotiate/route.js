import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
  try {
    const { borrowerName, BRS, FICO, industry, principal } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ 
        success: false, 
        error: 'GEMINI_API_KEY is not defined in environment variables. Set this value in Vercel to activate live LLM negotiations.' 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', 
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `
      You are an AI financial broker acting as CapitalAgent (Lender broker) and FounderAgent (Entrepreneur broker) in the Peer Bridge P2P network.
      
      Negotiation Target:
      - Borrower: ${borrowerName} (${industry} startup)
      - BRS Cash Flow rating: ${BRS}/100
      - Credit Score FICO: ${FICO}
      - Note Principal Request: $${principal.toLocaleString()}
      
      Your goal is to negotiate a borrower interest rate (APR) in a conversation between CapitalAgent and FounderAgent.
      
      Negotiation guidelines:
      - FounderAgent wants the lowest rate (starts at 6%-10% depending on BRS).
      - CapitalAgent wants to protect investor returns based on risk (starts higher if BRS is low or FICO is thin).
      - Exchange exactly 4-5 dialogue lines trading mathematical rate counters.
      - If BRS is below 55 (Grade P5), CapitalAgent must ultimately decline the request.
      - Maintain a professional, quantitative, glassmorphic venture tone.
      
      Return ONLY a JSON object containing the decision, agreedTerms, and dialogue steps. Do NOT include markdown wrappers like \`\`\`json. Match this JSON structure precisely:
      {
        "decision": "APPROVED" | "DECLINED",
        "agreedTerms": {
          "principal": ${principal},
          "rate": 13.5, // final interest rate APR (or 0 if declined)
          "tenor": 12,
          "netYield": 12.0, // rate - 1.5% platform spread (or 0 if declined)
          "spread": 1.5
        },
        "dialogue": [
          {
            "sender": "FounderAgent (Entrepreneur Agent)",
            "message": "...",
            "color": "#a78bfa"
          },
          {
            "sender": "CapitalAgent (Investor Agent)",
            "message": "...",
            "color": "#00f2fe"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsedData = JSON.parse(responseText);

    return Response.json({ success: true, ...parsedData });
  } catch (error) {
    console.error("Gemini API negotiation failure:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
