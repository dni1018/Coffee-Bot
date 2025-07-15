# Coffee Bot: Coffee Shop Assistant Agent

This project is a Coffee Shop Assistant Agent built on top of the [Microsoft 365 Agents SDK](https://github.com/Microsoft/Agents) and LangChain. It provides:
- Coffee recipes and preparation steps (from a JSON knowledge base)
- The ability to add new recipes using natural language
- Support for future extensibility (e.g., machinery instructions, Teams integration)

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
