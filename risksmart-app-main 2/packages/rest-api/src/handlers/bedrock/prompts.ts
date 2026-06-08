import { PromptId } from '@risksmart-app/shared/ai/PromptId';

// create an interface for the prompts return object with the return prompt as well as the temperature, top_p and max returned tokens
interface PromptReturn {
  prompt: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
}

// Convert prompts to a function that takes in a prompt and returns a string
const promptsText: { [key in PromptId]: (prompt: string) => string } = {
  ImproveWriting: (prompt: string) =>
    `Improve the writing, do not create new narratives and keep the scope of the prompt. Directly provide the information without introductory phrases. Keep the response concise and to the point. Only include the improved writing. Favor British english. Do not title the response or comment, raw response only. Prompt: ${prompt} : Improved writing :`,
  FixSpellingAndGrammar: (prompt: string) =>
    `Fix spelling and grammar.Favor British english.  Do not annotate the response. Prompt: ${prompt}`,
  UseSimplerLanguage: (prompt: string) =>
    `Rewrite the following text using simpler language. Use British English. Provide only the rewritten text without any titles, comments, or conversational language. This is to be used in a text box as replacement for the original text. Do not annotate the response. Prompt: ${prompt} : Rewritten text :`,
  GenerateARiskDescription: (prompt: string) =>
    `Writing in the style of a corporate Risk Manager that is recording detail in a GRC platform. Generate me a risk description for the following risk title, but do not include advice or suggested mitigation, only include the description of the risk. Favor British english. : Title : ${prompt} : Risk description :`,
  GenerateAControlDescription: (prompt: string) =>
    `Writing in the style of a corporate Risk Manager that is recording detail in a GRC platform. Generate me a control description for the following control title for mitigating a risk, but do not include advice or suggested mitigation, only include the description. Favor British english. Respond with a single paragraph : Title : ${prompt} : Control description :`,
  MakeMoreConcise: (prompt: string) =>
    `Rewrite the following text to make a short more concise statement. Favor British english.  Respond with paragraph text only and should be shorter than the prompt text and return full text with no annotations. Do not title the response or comment, raw response only. Prompt: ${prompt} : Concise text :`,
  MakeLonger: (prompt: string) =>
    `Writing in the style of a corporate Risk Manager that is recording detail in a GRC platform. Favor British english. Edit the following text to make a longer statement, expanding on the contents of the text. Respond with paragraph text only. Do not title the response or comment, raw response only. Prompt: ${prompt} : Longer text :`,
  TranslateToEnglish: (prompt: string) =>
    `Rewrite the following text in to English without annotations. Prompt: ${prompt} : English text :`,
  TranslateToFrench: (prompt: string) =>
    `Rewrite the following text in to French without annotations. Prompt: ${prompt} : French text :`,
  TranslateToGerman: (prompt: string) =>
    `Rewrite the following text in to German without annotations. Prompt: ${prompt} : German text :`,
  TranslateToSpanish: (prompt: string) =>
    `Rewrite the following text in to Spanish without annotations. Prompt: ${prompt} : Spanish text :`,
  TranslateToItalian: (prompt: string) =>
    `Rewrite the following text in to Italian without annotations. Prompt: ${prompt} : Italian text :`,
  TranslateToPortuguese: (prompt: string) =>
    `Rewrite the following text in to Portuguese without annotations. Prompt: ${prompt} : Portuguese text :`,
  TranslateToBrazilianPortuguese: (prompt: string) =>
    `Rewrite the following text in to Brazilian Portuguese without annotations. Prompt: ${prompt} : Brazilian Portuguese text :`,
};

// convert promptsText to a function that takes in a prompt and returns a promptReturn object
export const prompts: { [key in PromptId]: (prompt: string) => PromptReturn } =
  {
    ImproveWriting: (prompt: string) => ({
      prompt: promptsText[PromptId.ImproveWriting](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    FixSpellingAndGrammar: (prompt: string) => ({
      prompt: promptsText[PromptId.FixSpellingAndGrammar](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    UseSimplerLanguage: (prompt: string) => ({
      prompt: promptsText[PromptId.UseSimplerLanguage](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    GenerateARiskDescription: (prompt: string) => ({
      prompt: promptsText[PromptId.GenerateARiskDescription](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 2000,
    }),
    GenerateAControlDescription: (prompt: string) => ({
      prompt: promptsText[PromptId.GenerateAControlDescription](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    MakeMoreConcise: (prompt: string) => ({
      prompt: promptsText[PromptId.MakeMoreConcise](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    MakeLonger: (prompt: string) => ({
      prompt: promptsText[PromptId.MakeLonger](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToEnglish: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToEnglish](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToFrench: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToFrench](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToGerman: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToGerman](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToSpanish: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToSpanish](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToItalian: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToItalian](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToPortuguese: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToPortuguese](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
    TranslateToBrazilianPortuguese: (prompt: string) => ({
      prompt: promptsText[PromptId.TranslateToBrazilianPortuguese](prompt),
      temperature: 0.0,
      top_p: 0.1,
      max_tokens: 8000,
    }),
  };
