import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize Gemini API client with the modern @google/genai SDK
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Email inquiry parsing endpoint
  app.post("/api/parse", async (req, res) => {
    const { emailBody } = req.body;

    if (!emailBody || typeof emailBody !== "string") {
      return res.status(400).json({ error: "Missing or invalid emailBody parameter." });
    }

    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY environment variable is not configured.",
        details: "Please configure your Gemini API key in the Secrets / Settings menu."
      });
    }

    try {
      // Use standard gemini-3.5-flash for basic text extraction tasks
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Extract detailed business inquiry and customer contact information from the following email.

Email Body:
${emailBody}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              client_name: { 
                type: Type.STRING, 
                description: "The full name of the client/sender. E.g., 'John Doe'." 
              },
              company: { 
                type: Type.STRING, 
                description: "The name of the client's company. If not mentioned or cannot be inferred, return 'Not Specified'." 
              },
              email_address: {
                type: Type.STRING,
                description: "Extract the sender's email address if visible in the signature or email body, otherwise 'Not Specified'."
              },
              phone_number: {
                type: Type.STRING,
                description: "Extract any telephone or contact number, otherwise 'Not Specified'."
              },
              service_requested: { 
                type: Type.STRING, 
                description: "Briefly explain the service, project, or products they are inquiring about. Focus on the core request." 
              },
              budget: { 
                type: Type.STRING, 
                description: "Extract any stated budget. Include the currency symbol or text if specified. If not mentioned, return 'Not Specified'." 
              },
              deadline: { 
                type: Type.STRING, 
                description: "Timeline, deadline, or desired target completion date, otherwise 'Not Specified'." 
              },
              priority: { 
                type: Type.STRING, 
                description: "Urgency of the request. Must be one of: 'High', 'Medium', or 'Low'." 
              },
              summary: { 
                type: Type.STRING, 
                description: "A professional 1-2 sentence executive summary of this inquiry." 
              },
              key_points: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of 2-4 key features, technical requirements, or specific requests extracted from the body."
              },
              sentiment: {
                type: Type.STRING,
                description: "The tone or mood of the email (e.g. Formal, Urgent, Friendly, Professional, Frustrated)."
              }
            },
            required: [
              "client_name", 
              "company", 
              "email_address", 
              "phone_number", 
              "service_requested", 
              "budget", 
              "deadline", 
              "priority", 
              "summary", 
              "key_points", 
              "sentiment"
            ]
          }
        }
      });

      const jsonText = response.text;
      if (!jsonText) {
        throw new Error("Empty response received from the Gemini model.");
      }

      const data = JSON.parse(jsonText);
      return res.status(200).json(data);
    } catch (error: any) {
      console.error("Gemini Parsing error:", error);
      return res.status(500).json({
        error: "Failed to parse email inquiry",
        details: error.message || "An unexpected error occurred during analysis."
      });
    }
  });

  // Setup static file serving and Vite dev server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
