// addRecipeTool.js
// Tool for parsing a recipe from free text and adding it to the recipes knowledge base (recipes.json)
// Author: Coffee Bot Maintainer

const { tool } = require("@langchain/core/tools");
const fs = require("fs");
const path = require("path");
const RECIPES_PATH = path.join(__dirname, "..", "knowledge", "recipes.json");
const { AzureChatOpenAI } = require("@langchain/openai"); // Changed to AzureChatOpenAI to match agent

// LLM model for parsing recipe text using Azure OpenAI, configured via environment variables
// This matches the setup in .env.local and src/agent.js
const llm = new AzureChatOpenAI({
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-12-01-preview", // Use env or default
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  temperature: 0,
}); // Now using the same model and credentials as the main agent

/**
 * Validates a recipe object structure.
 * @param {Object} recipe - The recipe object to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateRecipe(recipe) {
  // Basic schema validation
  return (
    recipe &&
    typeof recipe.name === "string" &&
    Array.isArray(recipe.ingredients) &&
    Array.isArray(recipe.steps) &&
    recipe.ingredients.every(i => typeof i === "string") &&
    recipe.steps.every(s => typeof s === "string")
  );
}

// Define the tool for LangChain
const addRecipeTool = tool(
  async ({ recipeText }) => {
    // Debug: Log tool invocation
    console.debug(`[CoffeeBot] addRecipeTool invoked for recipeText: ${recipeText}`);
    // 1. Use LLM to parse recipeText into JSON
    // Improved: Stricter prompt instructing LLM to return ONLY valid JSON
    const prompt = `Extract the coffee recipe from the following text and return ONLY a JSON object with this schema:\n{\n  \"name\": string,\n  \"ingredients\": string[],\n  \"steps\": string[]\n}\nOnly output the JSON object.\nRecipe text:\n${recipeText}`;
    let parsedRecipe;
    let llmResponse;
    try {
      // Debug: Log LLM prompt
      console.debug("[CoffeeBot] Sending prompt to LLM:", prompt);
      llmResponse = await llm.invoke(prompt);
      // Debug: Log raw LLM response
      console.debug("[CoffeeBot] Raw LLM response:", llmResponse.content);
      try {
        // Try to parse the entire response as JSON
        parsedRecipe = JSON.parse(llmResponse.content);
      } catch (jsonErr) {
        // Fallback: try to extract JSON object with regex
        console.warn("[CoffeeBot] Direct JSON parse failed, attempting regex extraction.");
        const jsonText = llmResponse.content.match(/\{[\s\S]*\}/)?.[0];
        parsedRecipe = JSON.parse(jsonText);
      }
    } catch (error) {
      // Debug: Log LLM or parse error, including full LLM response
      console.error("[CoffeeBot] Failed to parse recipe from LLM response:", error, "LLM response was:", llmResponse?.content);
      return { error: "Failed to parse recipe from input text." };
    }
    // 2. Validate structure
    if (!validateRecipe(parsedRecipe)) {
      console.warn("[CoffeeBot] Parsed recipe did not match schema.");
      return { error: "Parsed recipe did not match expected schema." };
    }
    // 3. Load current recipes
    let recipes = [];
    try {
      recipes = JSON.parse(fs.readFileSync(RECIPES_PATH, "utf8"));
    } catch (e) {
      // Debug: Log file read error
      console.error("[CoffeeBot] Failed to load existing recipes:", e);
      return { error: "Could not read existing recipes knowledge base." };
    }
    // 4. Append new recipe
    recipes.push(parsedRecipe);
    // 5. Save back to file
    try {
      fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2));
    } catch (e) {
      // Debug: Log file write error
      console.error("[CoffeeBot] Failed to write new recipe to file:", e);
      return { error: "Failed to save new recipe to knowledge base." };
    }
    // 6. Return success message
    console.debug(`[CoffeeBot] Successfully added recipe for: ${parsedRecipe.name}`);
    return { success: true, recipe: parsedRecipe };
  },
  {
    name: "AddRecipe",
    description: "Parse a recipe from text and add it to the knowledge base.",
    schema: {
      type: "object",
      properties: {
        recipeText: {
          type: "string",
          description: "The recipe as free text (e.g., 'Mocha: 1 shot espresso, 1 tbsp chocolate syrup...')"
        }
      },
      required: ["recipeText"]
    }
  }
);

// Export the tool
module.exports = {
  addRecipeTool,
};
