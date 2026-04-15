require('dotenv').config();
import { AgentTool, OpenAILLM, startAgentServer, startAgentTelegram, startAgentWAHA, TerminationError, TerminationTimeout } from "@ssww.one/framework";

export async function agent(at: AgentTool) {
  const name = process.env.NAME || 'ABC Agent';
  await at.prepareKnowledge(`Your name is ${name}.`);
  await at.prepareKnowledge(process.env.AGENT_BRIEF || 'No brief');
  await at.prepareKnowledge(`Current date and time: ${new Date().toISOString()}`);

  // Initial greetings
  at.print(await at.askLLM(`Give short greetings to user based on given context. Your greetings must be simple`), true);
  
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
  } catch (err: any) {
    if (err instanceof TerminationError) {
      at.exit(`Conversation ended`);
    }
    else if (err instanceof TerminationTimeout) {
      at.exit(`Conversation ended`);
    } else {
      at.print(err?.message ?? '5XX: Agent cannot process this request', true);
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
startAgentWAHA(agent, {
  llm: new OpenAILLM()
});
