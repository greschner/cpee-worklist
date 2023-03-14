import { SlashCommandBuilder, bold } from 'discord.js';
import { stripIndent } from 'common-tags';
import { getPlate } from '../logging/loggingData.js';
import dateFormatter from '../utils/dateFormatter.js';

export default {
  data: new SlashCommandBuilder().setName('plate').setDescription('Gets the wellplate information').addStringOption((option) => option.setName('plateid')
    .setDescription('The plate ID')
    .setRequired(true)),
  async execute(interaction) {
    const plateid = interaction.options.getString('plateid');
    let message = 'Invalid plateID!';
    if (/^ *[0-9]+\s*$/i.test(plateid)) {
      await interaction.deferReply();
      const data = await getPlate(plateid);
      console.log(data);
      if (data?.status) { // data is defined and has status property
        message = stripIndent`
        Plate:                    ${bold(data.plateid)}
        Status:                  ${data.status}
        Samples:              ${data.samples}
        Created:               ${data.created ? dateFormatter(data.created) : 'not available'}
        Finished:              ${data.finished ? dateFormatter(data.finished) : 'not available'}
        EPS imported:    ${data.eps ? dateFormatter(data.eps) : 'not available'}
        Validated:            ${data.validated ? dateFormatter(data.validated) : 'not available'}
        `;
      }
      return interaction.editReply(message);
    }
    return interaction.reply(message);
  },
};
