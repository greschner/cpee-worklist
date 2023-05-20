import {
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import {
  getInstanceState, getVisitLink, getInstanceInformation, getVisitLinkURL,
} from '../api/cpee.js';
import { getTaskById } from '../tasks/tasksData.js';
import dateFormatter from '../utils/dateFormatter.js';
import { embedError, embedWarning } from '../utils/embedTemplates.js';

export default {
  data: new SlashCommandBuilder().setName('lab').setDescription('Get current lab health status'),
  async execute(interaction) {
    let message = '';
    try {
      await interaction.deferReply();

      const { data: instanceInformationXML } = await getInstanceInformation();
      const parser = new XMLParser({
        ignoreAttributes: false,
        ignoreDeclaration: true,
        attributeNamePrefix: '',
      });
      const instanceInformationObj = parser.parse(instanceInformationXML);

      const plates = {};
      const parentlessSamples = [];
      let wpRunning = 0;
      let wpStopped = 0;
      let wpReady = 0;
      let sRunning = 0;
      let sStopped = 0;
      let sReady = 0;

      instanceInformationObj.instances.instance.forEach((instance) => {
        if (instance.name.includes('Wellplate')) {
          plates[instance.uuid] = instance;
          plates[instance.uuid].samples = [];
          if (instance.state === 'running') {
            wpRunning += 1;
          } else if (instance.state === 'stopped') {
            wpStopped += 1;
          } else if (instance.state === 'ready') {
            wpReady += 1;
          }
        } else if (instance.name.includes('Sample')) {
          if (plates[instance.parent]) {
            plates[instance.parent].samples.push(instance);
          } else {
            parentlessSamples.push(instance);
          }

          if (instance.state === 'running') {
            sRunning += 1;
          } else if (instance.state === 'stopped') {
            sStopped += 1;
          } else if (instance.state === 'ready') {
            sReady += 1;
          }
        }
      });

      message = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('ℹ️ Lab Status')
        .addFields(
          {
            name: 'Ready',
            value: `Wellplates: ${wpReady}
            Samples: ${sReady}`,
            inline: true,
          },
          {
            name: 'Running',
            value: `Wellplates: ${wpRunning}
            Samples: ${sRunning}`,
            inline: true,
          },
          {
            name: 'Stopped',
            value: `Wellplates: ${wpStopped}
            Samples: ${sStopped}`,
            inline: true,
          },
          { name: 'Parentless Samples', value: `${parentlessSamples.length}` },
        );

      /* message += stripIndent`
      Total created: ${engineStats.total_created}
      Total finished: ${engineStats.total_finished}
      Total abandoned: ${engineStats.total_abandoned}
      Ready: ${engineStats.ready}
      Stopped: ${engineStats.stopped}     [Wellplates: ${wpStopped}|Samples: ${sStopped}]
      Running: ${engineStats.running}      [Wellplates: ${wpRunning}|Samples: ${sRunning}]
      Parentless Samples: ${parentlessSamples.length}
      `; */

      const plainInstanceArr = await getTaskById(['1', '2']);

      if (!plainInstanceArr?.length) {
        message += '\n\nNo plain instance found!';
        return interaction.editReply({ embeds: [embedError(message)] });
      }
      if (plainInstanceArr?.length > 2) {
        message += '\n\nMultiple plain instances detected! Please use only one plain instance at a time!';
        return interaction.editReply({ embeds: [embedWarning(message)] });
      }
      if (!plainInstanceArr?.length === 1) {
        message += `\n\n'${plainInstanceArr === '1' ? 'plain' : 'new wellplate'}' instance not found!`;
        return interaction.editReply({ embeds: [embedWarning(message)] });
      }

      const [plainInstance, plainSubInstance] = plainInstanceArr;
      const [plainInstanceStatus, finishPlateStatus] = await Promise.all([
        getInstanceState(plainInstance.instance),
        getInstanceState(plainSubInstance.instance),
      ]);

      message.addFields({
        name: `Plain instance [${plainInstance.instance}]`,
        value: `URL: ${getVisitLink(plainInstance.instance)}
        Status: ${plainInstanceStatus.data}
        Created: ${dateFormatter(plainInstance.timestamp)}`,
      });

      message.addFields({
        name: `Finish wellplate subprocess [${plainSubInstance.instance}]`,
        value: `URL: ${getVisitLink(plainSubInstance.instance)}
        Status: ${finishPlateStatus.data}
        Created: ${dateFormatter(plainSubInstance.timestamp)}`,
      });

      await Promise.all(Object.entries(plates).map(async ([, {
        name, url, samples, state,
      }], i) => {
        if (i < 7) {
          const { data: ts } = await axios.get(`${url}/properties/state/@changed/`);
          message.addFields({
            name: `${name}`,
            value: `URL: ${getVisitLinkURL(url)}
              Status: ${state}
              Changed: ${dateFormatter(ts)}
              #Samples: ${samples.length}`,
          });
        /*  message += `${hyperlink(name, getVisitLinkURL(url))}
        ${bold('Status')}: ${state}
        ${bold('Changed')}: ${dateFormatter(ts)}
        ${bold('#Samples')}: ${samples.length}\n\n`; */
        }
      }));

      const numberOfPlates = Object.entries(plates).length;

      if (numberOfPlates >= 7) {
        message.setFooter({ text: `. . . [${numberOfPlates - 8}]` });
      }

      return interaction.editReply({ embeds: [message] });
    } catch (error) {
      message = 'An internal error occured';
      if (error.response?.status === 404) {
        message = 'Plain instance was not properly removed. Please spawn a new plain instance!';
      } else {
        console.error(error);
      }
      return interaction.editReply({ embeds: [embedError(message)] });
    }
  },
};
