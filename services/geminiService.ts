
import { GoogleGenAI, GenerateContentResponse, GroundingMetadata } from "@google/genai";
import { Inspection } from '../types';

// Ensure API_KEY is accessed via process.env as per guidelines
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("Gemini API Key is not set in environment variables (process.env.API_KEY)");
  // Depending on the app's needs, you might throw an error or have a fallback
  // For this example, we'll allow the app to run but Gemini features will fail.
}

const ai = new GoogleGenAI({ apiKey: API_KEY! }); // Non-null assertion, ensure API_KEY is set in your env

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const generateInspectionSummary = async (inspection: Inspection): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Summary generation unavailable.";
  
  const prompt = `
    Gere um parágrafo descritivo conciso para um laudo de vistoria de imóvel com as seguintes características:
    Endereço: ${inspection.address}
    Tipo de Imóvel: ${inspection.propertyType}
    Cliente: ${inspection.clientName}
    Data da Vistoria: ${inspection.scheduledDate.toLocaleDateString('pt-BR')}
    Observações Iniciais (se houver): ${inspection.reportNotes || "Nenhuma observação inicial fornecida."}

    O parágrafo deve ser formal e técnico, adequado para um laudo de engenharia/arquitetura.
    Foque nos fatos principais. Evite linguagem excessivamente floreada.
    Exemplo: "Trata-se de vistoria realizada no imóvel [tipo] sito à [endereço], em [data], para o cliente [cliente]. Foram constatadas as seguintes observações iniciais: [observações]."
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5, // Lower temperature for more factual, less creative output
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating inspection summary with Gemini:", error);
    return `Erro ao gerar resumo: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
  }
};

export const suggestPhotoCaption = async (imageDescription: string, propertyType: string): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Caption suggestion unavailable.";

  const prompt = `
    Sugira uma legenda curta e descritiva para uma foto de vistoria de imóvel.
    Descrição da imagem: ${imageDescription}
    Tipo do imóvel: ${propertyType}
    A legenda deve ser objetiva e útil para um laudo técnico. Máximo 15 palavras.
    Exemplos: "Fachada principal do imóvel tipo ${propertyType}.", "Detalhe de fissura na parede da sala.", "Quadro de distribuição de energia."
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7, 
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error suggesting photo caption with Gemini:", error);
    return `Erro ao sugerir legenda: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
  }
};

export const getInformationWithGoogleSearch = async (query: string): Promise<{ text: string, groundingMetadata?: GroundingMetadata }> => {
  if (!API_KEY) return { text: "API Key not configured. Search unavailable." };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL, // Ensure this model supports tools if specified. Flash should.
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        // DO NOT add responseMimeType: "application/json" when using googleSearch
      }
    });
    
    // Extract grounding metadata correctly
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { text: response.text, groundingMetadata };
  } catch (error) {
    console.error("Error performing Google Search with Gemini:", error);
    return { text: `Erro ao buscar informações: ${error instanceof Error ? error.message : "Erro desconhecido"}` };
  }
};
    