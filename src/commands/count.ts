
import { Client, MessageFlags, SlashCommandBuilder, type Interaction } from "discord.js"
import { counterMessage } from "../other/counterMessage"
import { counterRow } from "../other/counterRow"

export default class Command {
    public async builder() {
		return new SlashCommandBuilder()
			.setName('count')
			.setDescription('Sets up a message, that will let you count globally')
    }
    public async execute(client: Client, i: Interaction) {
		if (!i.isChatInputCommand()) return

        await i.deferReply()
		await i.editReply({
            components: [counterMessage(), counterRow()],
            flags: MessageFlags.IsComponentsV2
        })
    }
}