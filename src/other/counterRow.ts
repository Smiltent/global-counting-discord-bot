
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

export function counterRow(): ActionRowBuilder<ButtonBuilder> {
    return new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("countBtn")
                .setLabel("Count!")
                .setStyle(ButtonStyle.Primary)
                .setEmoji("✨")
        )
}