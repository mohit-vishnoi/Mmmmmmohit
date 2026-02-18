import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatConfig } from "../types";

// Initialize the client outside the component to avoid recreation, 
// but the specific chat session will be created per user session.
const getClient = () => {
  // Accessing environment variable as per guidelines
  const apiKey = process.env.API_KEY; 
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
  }
  // Using the constructor pattern required by the guidelines
  return new GoogleGenAI({ apiKey: apiKey });
};

export class GeminiService {
  private chatSession: Chat | null = null;
  private client: GoogleGenAI;

  constructor() {
    this.client = getClient();
  }

  /**
   * Initializes a new chat session with specific system instructions based on context.
   */
  public initChat(config: ChatConfig) {
    const systemInstruction = `
      You are Nexus, an advanced AI support specialist for a tech platform.
      
      User Context:
      - Name: ${config.userName}
      - Current Topic: ${config.topic}
      
      Guidelines:
      1. Be professional, concise, and helpful.
      2. Use formatting (bullet points, bold text) to make answers readable.
      3. If you don't know an answer, admit it and suggest contacting human support.
      4. Always maintain a polite and patient tone.
      5. Your goal is to resolve the user's issue in the current context.
    `;

    // Using gemini-3-flash-preview as per guidelines for basic text/chat tasks
    this.chatSession = this.client.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction.trim(),
        temperature: 0.7, // Balanced creativity and accuracy
      },
    });
  }

  /**
   * Sends a message and yields chunks of the response as they stream in.
   */
  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.chatSession) {
      throw new Error("Chat session not initialized");
    }

    try {
      const resultStream = await this.chatSession.sendMessageStream({ message });

      for await (const chunk of resultStream) {
        // Safe casting as per guidelines
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
}