import {
  SlashCommandBuilder, bold, hyperlink,
} from 'discord.js';
import { stripIndent } from 'common-tags';
import { XMLParser } from 'fast-xml-parser';
import axios from 'axios';
import {
  getInstanceState, getVisitLink, getEngineInformation, getInstanceInformation, getVisitLinkURL,
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

      const { data: engineStats } = await getEngineInformation();
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
      let sRunning = 0;
      let sStopped = 0;

      instanceInformationObj.instances.instance.forEach((instance) => {
        if (instance.name.includes('Wellplate')) {
          plates[instance.uuid] = instance;
          plates[instance.uuid].samples = [];
          if (instance.state === 'running') {
            wpRunning += 1;
          } else if (instance.state === 'stopped') {
            wpStopped += 1;
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
          }
        }
      });

      message += stripIndent`
      Total created: ${engineStats.total_created}
      Total finished: ${engineStats.total_finished}
      Total abandoned: ${engineStats.total_abandoned}
      Ready: ${engineStats.ready}
      Stopped: ${engineStats.stopped}     [Wellplates: ${wpStopped}|Samples: ${sStopped}]
      Running: ${engineStats.running}      [Wellplates: ${wpRunning}|Samples: ${sRunning}]
      Parentless Samples: ${parentlessSamples.length}
      `;

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

      message += `${hyperlink(`\n\nPlain instance [${plainInstance.instance}]`, getVisitLink(plainInstance.instance))}
      ${bold('Status')}: ${plainInstanceStatus.data}
      ${bold('Created')}: ${dateFormatter(plainInstance.timestamp)}\n\n`;

      message += `${hyperlink(`Finish wellplate subprocess [${plainSubInstance.instance}]`, getVisitLink(plainSubInstance.instance))}
      ${bold('Status')}: ${finishPlateStatus.data}
      ${bold('Created')}: ${dateFormatter(plainSubInstance.timestamp)}\n\n`;

      await Promise.all(Object.entries(plates).map(async ([, {
        name, url, samples, state,
      }], i) => {
        if (i < 7) {
          const { data: ts } = await axios.get(`${url}/properties/state/@changed/`);
          message += `${hyperlink(name, getVisitLinkURL(url))}
        ${bold('Status')}: ${state}
        ${bold('Changed')}: ${dateFormatter(ts)}
        ${bold('#Samples')}: ${samples.length}\n\n`;
        }
      }));

      const numberOfPlates = Object.entries(plates).length;

      if (numberOfPlates >= 7) {
        message += `. . . [${numberOfPlates - 8}]`;
      }

      return interaction.editReply(message);
    } catch (error) {
      message = 'An internal error occured';
      if (error.response?.status === 404) {
        message = 'Plain instance was not properly removed. Please spawn a new plain instance!';
      } else {
        console.error(error);
      }
      return interaction.editReply({ embeds: [embedWarning(message)] });
    }
  },
};
