import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import { join, resolve } from 'path';
import { readdirSync } from 'fs';
import { clientId, token } from './config';
import logger from './logger';

export default async () => {
  const commands = [];
  const commandsPath = join(resolve(), 'src/commands');
  const commandFiles = readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

  await Promise.all(commandFiles.map(async (file) => {
    const filePath = join(commandsPath, file);
    const { default: command } = await import(filePath);
    commands.push(command.data.toJSON());
  }));

  const rest = new REST({ version: '10' }).setToken(token);

  rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => logger.info('Successfully registered application commands.'))
    .catch(console.error);
};
