const { HumanMessage, SystemMessage } = require("@langchain/core/messages");
const { MemorySaver } = require("@langchain/langgraph");
const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { AzureChatOpenAI, ChatOpenAI } = require("@langchain/openai");
const { ActivityTypes } = require("@microsoft/agents-activity");
const { AgentApplicationBuilder, MessageFactory } = require("@microsoft/agents-hosting");
// Import the date tool for time-related functionality
const { dateTool } = require("./tools/dateTimeTool");
// Import the Coffee Recipe Tool for recipe lookup functionality
const { coffeeRecipeTool } = require("./tools/coffeeRecipeTool");
// Import the Add Recipe Tool for adding new recipes to the knowledge base
const { addRecipeTool } = require("./tools/addRecipeTool");
// const { getWeatherTool } = require("./tools/getWeatherTool"); // Removed as Coffee Bot does not need weather functionality

const weatherAgent = new AgentApplicationBuilder().build();

weatherAgent.conversationUpdate(
  "membersAdded",
  async (context) => {
    // Send Coffee Bot introduction to the user
    console.debug("[CoffeeBot] Sending introduction message to user.");
    await context.sendActivity(
      `Hi I am Coffee Bot, your personal coffee shop assistant! How may I help you?`
    );
  }
);

const agentModel = new AzureChatOpenAI({
  azureOpenAIApiVersion: "2024-12-01-preview",
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  temperature: 0,
});

// Register tools for the agent: Coffee Recipe Tool, Add Recipe Tool, and date tool
const agentTools = [coffeeRecipeTool, addRecipeTool, dateTool]; // Added addRecipeTool for dynamic recipe addition
const agentCheckpointer = new MemorySaver();
const agent = createReactAgent({
  llm: agentModel,
  tools: agentTools,
  checkpointSaver: agentCheckpointer,
});

// System prompt for Coffee Bot: instructs the assistant to help new hires with coffee shop knowledge
console.debug("[CoffeeBot] Setting up system message for Coffee Bot context.");
const sysMessage = new SystemMessage(`
You are Coffee Bot, a friendly assistant that helps new hires at a coffee shop learn about coffee recipes, machine operation, and best practices.
You may ask follow up questions until you have enough information to answer the customer's question. Once you have the answer, present it clearly and concisely.

Respond in JSON format with the following JSON schema, and do not use markdown in the response:

{
    "contentType": "'Text' or 'AdaptiveCard' only",
    "content": "{The content of the response, may be plain text, or JSON based adaptive card}"
}`);

weatherAgent.activity(ActivityTypes.Message, async (context, state) => {
  const llmResponse = await agent.invoke(
    {
      messages: [sysMessage, new HumanMessage(context.activity.text)],
    },
    {
      configurable: { thread_id: context.activity.conversation.id },
    }
  );

  const llmResponseContent = JSON.parse(
    llmResponse.messages[llmResponse.messages.length - 1].content
  );

  if (llmResponseContent.contentType === "Text") {
    await context.sendActivity(llmResponseContent.content);
  } else if (llmResponseContent.contentType === "AdaptiveCard") {
    const response = MessageFactory.attachment({
      contentType: "application/vnd.microsoft.card.adaptive",
      content: llmResponseContent.content,
    });
    await context.sendActivity(response);
  }
});

module.exports = {
  weatherAgent,
};
