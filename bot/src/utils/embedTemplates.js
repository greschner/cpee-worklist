import { EmbedBuilder } from 'discord.js';

const embedWarning = (message) => new EmbedBuilder()
  .setColor(0xFFCC00)
  .setTitle('⚠️ Warning')
  .setDescription(message)
  .setTimestamp();

const embedError = (message, title = '❌ Error') => new EmbedBuilder()
  .setColor(0xCC3300)
  .setTitle(title)
  .setDescription(message)
  .setTimestamp();

const embedInformation = (message) => new EmbedBuilder()
  .setColor(0x0099FF)
  .setTitle('ℹ️ Information')
  .setDescription(message)
  .setTimestamp();

export {
  embedWarning,
  embedError,
  embedInformation,
};
