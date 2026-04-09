require('dotenv').config();
import { AgentTool, OpenAILLM, startAgentServer, startAgentTelegram, TerminationError } from "@ssww.one/framework";

export async function agent(at: AgentTool) {
  await at.prepareKnowledge(`Your name is ${process.env.NAME || 'ABC Agent'}.`);
  await at.prepareKnowledge(process.env.AGENT_BRIEF || 'No brief');
  await at.prepareKnowledge(`Current date and time: ${new Date().toISOString()}`);

  // Initial greetings
  at.print('Welcome to our Laundry, may I help you?', true);
  
  // Main loop
  try {
    while (true) {
      const instruction = await at.waitForUserInstruction();
      await at.streamLLM(
        `User request: "${instruction}". Respond user request based on given knowledge.`,
        (s: string) => at.print(s)
      );
      at.print('', true);
    }
  } catch (err) {
    if (err instanceof TerminationError) {
      at.exit(`Conversation ended`);
    }
  }
}

startAgentServer(agent, {
  llm: new OpenAILLM(),
  port: +(process.env.PORT || 9811),
  timeout: 120 * 1000
});
startAgentTelegram(agent, {
  llm: new OpenAILLM()
});
