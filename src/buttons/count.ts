
import { Client, MessageFlags, type Interaction } from "discord.js"
import { counterMessage } from "../other/counterMessage"
import { counterRow } from "../other/counterRow"
import { addToCurrentCount } from "../.."

export default class Command {
    public id = "countBtn"

    public async execute(client: Client, i: Interaction) {
		if (!i.isButton()) return

        addToCurrentCount()

        await i.update({
            components: [counterMessage(), counterRow()],
            flags: MessageFlags.IsComponentsV2
        })
    }
}