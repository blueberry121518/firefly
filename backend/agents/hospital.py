from uagents import Agent, Context, Model

# TODO: Define the Pydantic Models for messages and data this agent handles.
agent = Agent(name="hospital", seed="hospital_secret_seed_phrase_44444")

@agent.on_interval(period=10.0)
async def main_loop(ctx: Context):
    # TODO: Implement the agent's primary logic.
    ctx.logger.info(f"Agent '{agent.name}' is running and checking for tasks.")

# TODO: Add @agent.on_message handlers here to define how the agent responds to messages.

if __name__ == "__main__":
    agent.run()
