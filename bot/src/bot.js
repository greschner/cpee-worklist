import {
  Client, GatewayIntentBits, Collection, PermissionsBitField, EmbedBuilder,
} from 'discord.js';
import { join, resolve } from 'path';
import { readdirSync } from 'fs';
import logger from './logger';
import deployCommands from './deployCommands';

deployCommands();

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = join(resolve(), 'src/commands');
const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

commandFiles.forEach((file) => {
  const filePath = join(commandsPath, file);
  import(filePath).then(({ default: command }) => {
    client.commands.set(command.data.name, command);
  });
});

client.on('interactionCreate', async (interaction) => {
  // console.log(interaction);
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

const sendMessageToAll = (message) => {
  client.channels.cache.forEach((channel) => {
    if (channel.type === 0
      && channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.ViewChannel)
      && channel.permissionsFor(client.user.id).has(PermissionsBitField.Flags.SendMessages)
    ) {
      channel.send(
        message instanceof EmbedBuilder ? { embeds: [message] } : message,
      ).catch(console.error);
    }
  });
};

const logMessage = (message, level = 'INFO') => {
  if (!message) {
    throw new Error('Message cannot be empty');
  }

  let m = 'ℹ️ Information';
  let color = 0x0099FF;
  if (level === 'WARN') {
    m = '⚠️ Warning';
    color = 0xFFCC00;
  } else if (level === 'ERROR') {
    m = '❌ Error';
    color = 0xCC3300;
  }

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(m)
    .setDescription(message)
    .setTimestamp();

  // console.log(m);
  sendMessageToAll(embed);
};

// When the client is ready, run this code (only once)
client.once('ready', () => {
  logger.info('Bot is ready.');
  // sendMessageToAll('test');
});

export { sendMessageToAll, logMessage };
export default client;
