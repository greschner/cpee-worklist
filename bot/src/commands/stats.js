import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getStats } from '../logging/loggingData.js';

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
      if (data) { // data is defined and has status property
        message = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(`📊 Stats for ${dateStr}`)
          .addFields(
            { name: 'Created plates', value: `${data.newPlates}` },
            { name: 'Finished plates', value: `${data.finishedPlates}` },
            { name: 'Validated plates', value: `${data.validatedPlates}` },
            { name: 'Scanned samples', value: `${data.scannedSamples}` },
            { name: 'Deleted samples', value: `${data.deletedSamples}` },
            { name: 'Positive samples', value: `${data.positives}` },
            { name: 'Negative samples', value: `${data.negatives}` },
            { name: 'Positive rate', value: `${(data.positiveRate * 100).toFixed(3)}%` },
          )
          .setTimestamp();
        /* message += stripIndent`
        Created plates:           ${data.newPlates}
        Finished plates:          ${data.finishedPlates}
        Validated plates:        ${data.validatedPlates}
        Scanned samples:      ${data.scannedSamples}
        Deleted samples:       ${data.deletedSamples}
        Positive samples:       ${data.positives}
        Negative samples:     ${data.negatives}
        Positive rate:               ${(data.positiveRate * 100).toFixed(3)}%
        `; */
      }
      return interaction.editReply({ embeds: [message] });
    }
    return interaction.reply(message);
  },
};
