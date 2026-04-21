require('dotenv').config();
import { AgentTool, loop, OpenAILLM, startAgentServer, startAgentTelegram, startAgentWAHA, TerminationError, TerminationTimeout } from "@ssww.one/framework";

export async function agent(at: AgentTool) {
  const name = process.env.NAME || 'ABC Agent';
  await at.prepareKnowledge(`Your name is ${name}.`);
  await at.prepareKnowledge(process.env.AGENT_BRIEF || 'No brief');
  await at.prepareKnowledge(`Current date and time: ${new Date().toISOString()}`);

  // Initial greetings
  at.print(await at.askLLM(`Give short greetings to user based on given context. Your greetings must be simple`), true);
  
  // Main loop
  await loop(async () => {
    const instruction = await at.waitForUserInstruction();
    if (at.source.type === 'whatsapp-waha' && at.is_last_waha_message_from_me) {
      return;
    }
    await at.streamLLM(
      `User request: "${instruction}". Respond user request based on given knowledge.`,
      (s: string) => at.print(s)
    );
    at.print('', true);
  });
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
