import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('help').setDescription('List of available commands'),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('List of available commands')
      .addFields(
        { name: '/lab', value: 'Returns the current status of the lab' },
        { name: '/lab_action start', value: 'Spawn and start new plain instance if not already exists' },
        { name: '/lab_action restart', value: 'Abandon all lab instances and spawn a new plain instance' },
        { name: '/lab_action reset', value: 'Abandon all wellplate and sample instances while plain instance stays untouched' },
        { name: '/lab_action abandon', value: 'Abandon all lab instances' },
        { name: '/plate [plateid]', value: 'Returns the current wellplate status' },
        { name: '/sample [sampleid]', value: 'Returns the current sample status' },
        { name: '/stats [date]', value: 'Returns some statistical information on this date' },
      );
    await interaction.reply({ embeds: [embed] });
  },
};
