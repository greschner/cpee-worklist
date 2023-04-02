import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedError } from '../utils/embedTemplates.js';
import { getPlate } from '../logging/loggingData.js';
import dateFormatter from '../utils/dateFormatter.js';

export default {
  data: new SlashCommandBuilder().setName('plate').setDescription('Gets the wellplate information').addStringOption((option) => option.setName('plateid')
    .setDescription('The plate ID')
    .setRequired(true)),
  async execute(interaction) {
    const plateid = interaction.options.getString('plateid');
    let message = embedError('Please enter a valid plateID!', '❌ Invalid plateID');
    if (/^ *[0-9]+\s*$/i.test(plateid)) {
      await interaction.deferReply();
      const data = await getPlate(plateid);
      console.log(data);
      if (data?.status) { // data is defined and has status property
        message = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle(`Plate: ${plateid}`)
          .addFields(
            { name: 'Status', value: `${data.status}` },
            { name: 'Samples', value: `${data.samples}` },
            { name: 'Created', value: `${data.created ? dateFormatter(data.created) : 'not available'}` },
            { name: 'Finished', value: `${data.finished ? dateFormatter(data.finished) : 'not available'}` },
            { name: 'EPS imported:', value: `${data.eps ? dateFormatter(data.eps) : 'not available'}` },
            { name: 'Validated', value: `${data.validated ? dateFormatter(data.validated) : 'not available'}` },
          );
      }
      return interaction.editReply({ embeds: [message] });
    }
    return interaction.reply({ embeds: [message] });
  },
};
