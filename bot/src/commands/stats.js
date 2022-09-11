import { SlashCommandBuilder, bold } from 'discord.js';
import { stripIndent } from 'common-tags';
import { getStats } from '../logging/loggingData';

export default {
  data: new SlashCommandBuilder().setName('stats').setDescription('Gets the statistics 📊').addStringOption((option) => option.setName('date')
    .setDescription('Set the date')),
  async execute(interaction) {
    const dateString = interaction.options.getString('date');
    let message = 'Invalid date!';
    // regex adapted from https://www.regextester.com/97612 (29.05.2022)
    if (/^ *((3[01]|[12][0-9]|0?[1-9])[-/.](1[012]|0?[1-9])[-/.]((?:19|20)\d{2})|yesterday)\s*$/i.test(dateString) || !dateString) {
      await interaction.deferReply();
      let date = new Date(dateString?.replace(/(\d{2})[-/.](\d{2})[-/.](\d+)/, '$2/$1/$3') ?? Date.now());
      if (dateString === 'yesterday') {
        date = new Date(Date.now() - 86400000);
      }
      const data = await getStats(date);
      const dateStr = `${(`0${date.getDate()}`).slice(-2)}.${(`0${date.getMonth() + 1}`).slice(-2)}.${
        date.getFullYear()}`;
      console.log(data);
      message = `Stats for ${bold(dateStr)}\n\n`;
      if (data) { // data is defined and has status property
        message += stripIndent`
        Created plates:           ${data.newPlates}
        Finished plates:          ${data.finishedPlates}
        Validated plates:        ${data.validatedPlates}
        Scanned samples:      ${data.scannedSamples}
        Deleted samples:       ${data.deletedSamples}
        Positive samples:       ${data.positives}
        Negative samples:     ${data.negatives}
        Positive rate:               ${(data.positiveRate * 100).toFixed(3)}%
        `;
      }
      return interaction.editReply(message);
    }
    return interaction.reply(message);
  },
};
