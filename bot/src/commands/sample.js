import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { embedError } from '../utils/embedTemplates.js';
import { getSample } from '../logging/loggingData.js';
import dateFormatter from '../utils/dateFormatter.js';

export default {
  data: new SlashCommandBuilder().setName('sample').setDescription('Gets the sample information').addStringOption((option) => option.setName('sampleid')
    .setDescription('The sample ID')
    .setRequired(true)),
  async execute(interaction) {
    const sampleid = interaction.options.getString('sampleid');
    let message = embedError('Please enter a valid sampleID!', '❌ Invalid sampleID');
    if (/^ *[A-z0-9]+\s*$/i.test(sampleid)) {
      await interaction.deferReply();
      const data = await getSample(sampleid);
      console.log(data);
      if (data?.length) { // data is defined and has status property
        message = new EmbedBuilder().setColor(0x0099FF).setTitle(`Sample: ${sampleid}`);
        // message = `Sample information of the following sample: ${bold(sampleid)}`;
        data.forEach((sampleObject) => {
          const fieldsArray = [
            { name: `${dateFormatter(sampleObject.timestamp)} -> ${sampleObject.name}`, value: ' ' },
          ];
          message.addFields(fieldsArray);
          switch (sampleObject.id) {
            case '3': {
              fieldsArray[0].value = `
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}`;
              /* message += `
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}`; */
              break;
            }
            case '9': {
              fieldsArray[0].value = `
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              Complete: ${sampleObject.body.complete}`;
              /* message += `
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              Complete: ${sampleObject.body.complete}`; */
              break;
            }
            case '13': {
              fieldsArray[0].value = `
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              CT: ${sampleObject.body.ct}
              Retry: ${sampleObject.body.retry}
              Valid: ${sampleObject.body.valid}`;
              /* message += `
              Plate: ${sampleObject.body.plateid}
              Position: ${sampleObject.body.position}
              Result: ${sampleObject.body.result === 'N' ? 'Negative' : 'Positive'}
              CT: ${sampleObject.body.ct}
              Retry: ${sampleObject.body.retry}
              Valid: ${sampleObject.body.valid}`; */
              break;
            }
            default:
              break;
          }
        });
      }
      return interaction.editReply({ embeds: [message] });
    }
    return interaction.reply({ embeds: [message] });
  },
};
