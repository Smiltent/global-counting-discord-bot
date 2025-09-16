
import { Client, GatewayIntentBits, Collection, REST, Routes, MessageFlags } from 'discord.js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
dotenv.config()

// !==================!
//       Variables
// !==================!

const commands = new Collection<string, any>()
const buttons = new Collection<string, any>()

// !==================!
//       Functions
// !==================!
async function register(commands: string[]) {
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string)

    try {   
        console.log("Refreshing (/) commands!")

        // Unregister
        if (process.env.UNREGISTER_COMMANDS === "true") {
            if (process.env.USE_GUILD === "true") {
                await rest.put(Routes.applicationGuildCommands(process.env.USER_ID as string, process.env.GUILD_ID as string), { body: [] })
                    .then(() => console.log("Unregistered Development (/) commands!"))
            } else {
                await rest.put(Routes.applicationCommands(process.env.USER_ID as string), { body: [] })
                    .then(() => console.log("Unregistered (/) commands!"))
            }

            process.exit(0)
        }

        if (process.env.USE_GUILD === "true") {
            await rest.put(Routes.applicationGuildCommands(process.env.USER_ID as string, process.env.GUILD_ID as string), { body: commands })
                .then(() => console.log("Registered Development (/) commands!"))
        } else {
            await rest.put(Routes.applicationCommands(process.env.USER_ID as string), { body: commands })
                .then(() => console.log("Registered (/) commands!"))
        }
        
    } catch (err) {
        console.error(`Failed to register commands: ${err}`)
    }
} 

async function readCommandsFolder() {
    const pathh = path.join(__dirname, "src", "commands")
    const files = fs.readdirSync(pathh).filter(file => file.endsWith(".ts"))

    const commandNames: string[] = []

    for (const file of files) {
        const filePath = path.join(pathh, file)
        const command = await import(filePath)
        const commandClass = new command.default()

        if (commandClass.builder && commandClass.execute) {
            const builder = await commandClass.builder()

            commands.set(builder.name, commandClass)
            commandNames.push(builder)
        } else {
            console.error(`The command at ${filePath} is missing a "builder" or "execute" method.`)
        }
    }

    await register(commandNames)
} 

async function readButtonsFolder() {
    const pathh = path.join(__dirname, "src", "buttons")
    const files = fs.readdirSync(pathh).filter(file => file.endsWith(".ts"))

    for (const file of files) {
        const filePath = path.join(pathh, file)
        const button = await import(filePath)
        const buttonClass = new button.default()

        if (buttonClass.execute && buttonClass.id) {
            buttons.set(buttonClass.id, buttonClass)
        } else {
            console.error(`The button at ${filePath} is missing a "id" or "execute" method.`)
        }
    }
}

export function addToCurrentCount() {
    const filePath = path.join(__dirname, "currentCount.txt")
    const file = fs.readFileSync(filePath, "utf-8")
    
    let current = parseInt(file, 10)
    if (isNaN(current)) {
        current = 0
    }
    current += 1
    fs.writeFileSync(filePath, current.toString(), "utf-8")
}

export function getCurrentCount() {
    const filePath = path.join(__dirname, "currentCount.txt")
    const file = fs.readFileSync(filePath, "utf-8")
    let current = parseInt(file, 10)

    if (isNaN(current)) {
        current = 0
    }
    if (current % 100 === 0 && current !== 0) {
        return `:tada: \`${current}\` :tada:`
    }

    return `\`${current}\``
}

// !==================!
//    Discord Client
// !==================!
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
})

await readCommandsFolder()
await readButtonsFolder()
client.on("clientReady", async () => {
    console.log(`Logged in as ${client.user?.tag}`)
})

client.on("interactionCreate", async i => {
    if (i.isChatInputCommand()) {
        const command = commands.get(i.commandName)
        if (!command) return

        try {
            await command.execute(client, i)
        } catch (err) {
            console.error(`Failed running command: ${err}`)
            await i.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral })
        }
    } else if (i.isButton()) {
        const button = buttons.get(i.customId)
        if (!button) return

        try {
            await button.execute(client, i)
        } catch (err) {
            console.error(`Failed running button: ${err}`)
            await i.reply({ content: "There was an error while executing this button!", flags: MessageFlags.Ephemeral })
        }
    }
})

client.login(process.env.TOKEN)