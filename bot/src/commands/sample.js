import { SlashCommandBuilder, bold } from 'discord.js';
import { getSample } from '../logging/loggingData';
import dateFormatter from '../utils/dateFormatter';

export default {
  data: new SlashCommandBuilder().setName('sample').setDescription('Gets the sample information').addStringOption((option) => option.setName('sampleid')
    .setDescription('The sample ID')
    .setRequired(true)),
  async execute(interaction) {
    const sampleid = interaction.options.getString('sampleid');
    let message = 'Invalid sampleID!';
    if (/^ *[A-z0-9]+\s*$/i.test(sampleid)) {
      await interaction.deferReply();
      const data = await getSample(sampleid);
      console.log(data);
      if (data?.length) { // data is defined and has status property
        message = `Sample information of the following sample: ${bold(sampleid)}`;
        data.forEach((sampleObject) => {
          message += `\n\n${bold(dateFormatter(sampleObject.timestamp))} -> ${bold(sampleObject.name)}:`;
          switch (sampleObject.id) {
            case '3': {
              message += `    
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}`;
              break;
            }
            case '9': {
              message += `
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              Complete: ${sampleObject.body.complete}`;
              break;
            }
            case '13': {
              message += `
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              CT: ${sampleObject.body.ct}
              Retry: ${sampleObject.body.retry}
              Valid: ${sampleObject.body.valid}`;
              break;
            }
            default:
              break;
          }
        });
      }
      return interaction.editReply(message);
    }
    return interaction.reply(message);
  },
};
