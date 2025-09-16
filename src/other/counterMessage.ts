
import { ContainerBuilder } from "discord.js"
import { getCurrentCount } from "../.."

export function counterMessage(): ContainerBuilder {
    return new ContainerBuilder()
        .addTextDisplayComponents(
            textDisplay => textDisplay
                .setContent('## Global Counting Bot!'),
            textDisplay => textDisplay
                .setContent(`Current count: ${getCurrentCount()}.`),
        )
}