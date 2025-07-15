# Coffee Bot: Coffee Shop Assistant Agent

This project is a Coffee Shop Assistant Agent built on top of the [Microsoft 365 Agents SDK](https://github.com/Microsoft/Agents) and LangChain. It provides:
- Coffee recipes and preparation steps (from a JSON knowledge base)
- The ability to add new recipes using natural language
- Support for future extensibility (e.g., machinery instructions, Teams integration)

## ⚠️ Security & GitHub Best Practices
- **Do NOT upload your `.env`, `.env.local.user`, or any file containing API keys or secrets to GitHub.**
- The `.gitignore` is set up to exclude secrets and dependencies (`node_modules/`).
- Double-check that no API keys or credentials are hardcoded in the codebase before pushing.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/), supported versions: 18, 20, 22.
- [Microsoft 365 Agents Toolkit VS Code Extension](https://aka.ms/teams-toolkit) or [CLI](https://aka.ms/teamsfx-toolkit-cli)
- Your own [Azure OpenAI](https://aka.ms/oai/access) resource

### Setup
1. **Clone this repo**
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Configure environment variables:**
   - Copy `.env.local.user.example` to `.env.local.user` (or use your existing file)
   - Fill in your Azure OpenAI key, endpoint, and deployment name:
     ```env
     SECRET_AZURE_OPENAI_API_KEY=your-key-here
     AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
     AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
     ```
   - **Never commit this file to GitHub.**
4. **Start the agent:**
   ```sh
   npm start
   ```

## Usage
- Interact with Coffee Bot via chat (Teams, web, or playground)
- Ask for recipes (e.g., "How do I make a flat white?")
- Add new recipes by describing them in natural language (e.g., "Add this recipe: ...")
- Recipes are stored in `src/knowledge/recipes.json` and can be edited or extended

## Project Structure
| Folder/File | Purpose |
| - | - |
| `src/agent.js` | Main agent logic, tool integration |
| `src/tools/coffeeRecipeTool.js` | Recipe lookup tool |
| `src/tools/addRecipeTool.js` | Tool for parsing and adding new recipes |
| `src/knowledge/recipes.json` | Coffee recipes knowledge base |
| `.gitignore` | Ensures secrets and dependencies are not committed |

## Extending the Bot
- Add new tools for machinery, troubleshooting, or Teams message ingestion
- Connect to Microsoft Graph API for Teams message retrieval
- Expand the knowledge base by editing `recipes.json` or using the add recipe tool

## License
Specify your license terms here (e.g., MIT, Apache 2.0, etc.)

## Acknowledgements
- [Microsoft 365 Agents SDK](https://github.com/Microsoft/Agents)
- [LangChain](https://js.langchain.com/)
- [OpenAI](https://openai.com/)

---
**Before pushing to GitHub, always check for secrets and test your project locally!**
