// coffeeRecipeTool.js
// Tool for looking up coffee recipes from a JSON file
// Author: Coffee Bot Maintainer

const { tool } = require("@langchain/core/tools");
const fs = require("fs");
const path = require("path");

// Path to the coffee recipes JSON file
const RECIPES_PATH = path.join(__dirname, "..", "knowledge", "recipes.json");

/**
 * Loads all coffee recipes from the JSON file.
 * @returns {Object[]} Array of recipe objects.
 */
function loadRecipes() {
  try {
    // Debug: Log attempt to load recipes
    console.debug("[CoffeeBot] Loading coffee recipes from", RECIPES_PATH);
    const data = fs.readFileSync(RECIPES_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    // Debug: Log error if loading fails
    console.error("[CoffeeBot] Failed to load recipes:", error);
    return [];
  }
}

/**
 * Finds a recipe by drink name (case-insensitive, partial match allowed).
 * @param {string} drinkName - The name of the coffee drink to search for.
 * @returns {Object|null} The recipe object or null if not found.
 */
function findRecipe(drinkName) {
  const recipes = loadRecipes();
  const lowerName = drinkName.toLowerCase();
  // Debug: Log search query
  console.debug(`[CoffeeBot] Searching for recipe: ${drinkName}`);
  return recipes.find(recipe => recipe.name.toLowerCase().includes(lowerName)) || null;
}

// Define the tool for LangChain
const coffeeRecipeTool = tool(
  async ({ drink }) => {
    // Debug: Log tool invocation
    console.debug(`[CoffeeBot] coffeeRecipeTool invoked for drink: ${drink}`);
    const recipe = findRecipe(drink);
    if (recipe) {
      // Debug: Log successful recipe retrieval
      console.debug(`[CoffeeBot] Found recipe for: ${drink}`);
      return {
        name: recipe.name,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
      };
    } else {
      // Debug: Log missing recipe
      console.warn(`[CoffeeBot] No recipe found for: ${drink}`);
      return { error: `Sorry, I couldn't find a recipe for '${drink}'.` };
    }
  },
  {
    name: "CoffeeRecipe",
    description:
      "Look up the recipe for a specific coffee drink by name. Returns ingredients and steps.",
    schema: {
      type: "object",
      properties: {
        drink: {
          type: "string",
          description: "The name of the coffee drink (e.g., latte, cappuccino, espresso, flat white, caramel macchiato)",
        },
      },
      required: ["drink"],
    },
  }
);

// Export the tool
module.exports = {
  coffeeRecipeTool,
};
