import { SlashCommandBuilder, hyperlink, EmbedBuilder } from 'discord.js';
import {
  abandonInstance, getCurrentInstances, getInstanceState, newInstanceURL,
  startInstance, getVisitLinkURL,
} from '../api/cpee.js';
import { plainInstanceURL } from '../config.js';
import logger from '../logger.js';
import { deleteTaskbyIdNin, deleteProducedbyIdNin } from '../tasks/tasksData.js';
import { embedError, embedInformation, embedWarning } from '../utils/embedTemplates.js';

const newPlainInstanceEmbed = (data) => new EmbedBuilder()
  .setColor(0x57F287)
  .setTitle('✅ New plain instance successfully spawned')
  .addFields(
    { name: 'Instance', value: `${data['CPEE-INSTANCE']}` },
    { name: 'Instance UUID', value: `${data['CPEE-INSTANCE-UUID']}` },
    { name: 'Instance URL', value: `${hyperlink(getVisitLinkURL(data['CPEE-INSTANCE-URL']))}` },
  );

export default {
  data: new SlashCommandBuilder().setName('lab_action').setDescription('Execute specific actions on cpee')
    .addSubcommand((subcommand) => subcommand.setName('abandon')
      .setDescription('Abandon all lab instances including plain instance').addIntegerOption((option) => option.setName('abandon_instance').setDescription('Enter the cpee instance number')))
    .addSubcommand((subcommand) => subcommand.setName('reset')
      .setDescription('Abandon all wellplate and sample instances'))
    .addSubcommand((subcommand) => subcommand.setName('restart')
      .setDescription('Abandon all lab instances and spawn a new plain instance'))
    .addSubcommand((subcommand) => subcommand.setName('start')
      .setDescription('Spawn a new plain instance')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const instances = await getCurrentInstances();
    if (subcommand === 'abandon') {
      const instanceNumber = interaction.options.getInteger('abandon_instance');
      if (instanceNumber) {
        abandonInstance(instanceNumber);
      } else {
        instances.forEach((instance) => {
          const test = ['Wellplate', 'Sample', 'Lab Plain Instance', 'Lab Finish Watcher'].some((item) => instance.name.includes(item));
          if (test) {
            const { pathname } = new URL(instance.url);
            const pathArr = pathname.split('/');
            abandonInstance(parseInt(pathArr[3], 10));
          }
        });

        deleteTaskbyIdNin(['1', '2']).then(
          () => logger.info('Successfully deleted all tasks except pid 1 and 2'),
        ).catch(console.error);

        deleteProducedbyIdNin(['6']).then(
          () => logger.info('Successfully deleted all produced tasks except 6'),
        ).catch(console.error);
      }
      await interaction.reply('executed...');
    } else if (subcommand === 'reset') {
      instances.forEach((instance) => {
        const test = ['Wellplate', 'Sample'].some((item) => instance.name.includes(item));
        if (test) {
          const { pathname } = new URL(instance.url);
          const pathArr = pathname.split('/');
          abandonInstance(parseInt(pathArr[3], 10));
        }
      });

      deleteTaskbyIdNin(['1', '2']).then(
        () => logger.info('Successfully deleted all tasks except pid 1 and 2'),
      ).catch(console.error);

      deleteProducedbyIdNin(['6']).then(
        () => logger.info('Successfully deleted all produced tasks except 6'),
      ).catch(console.error);

      await interaction.reply('executed...');
    } else if (subcommand === 'restart') {
      let message = new EmbedBuilder().setTitle('🕣 executing...').setColor(0x0099FF);
      const plainInstance = instances.find(({ name }) => name === 'Lab Plain Instance');

      if (plainInstance) {
        console.log('hi');
        let onlyOnePlainInstanceFlag = true;
        instances.forEach((instance) => {
          const test = ['Lab Plain Instance', 'Lab Finish Watcher', 'Wellplate', 'Sample'].some((item) => instance.name.includes(item));
          if (test) {
            const { pathname } = new URL(instance.url);
            const pathArr = pathname.split('/');

            abandonInstance(parseInt(pathArr[3], 10));
            if (instance.name === 'Lab Plain Instance') {
              const interval = setInterval(async () => {
                try {
                  const { data: state } = await getInstanceState(parseInt(pathArr[3], 10));
                  if (state === 'abandoned') {
                    clearInterval(interval);
                    if (onlyOnePlainInstanceFlag) {
                      newInstanceURL(plainInstanceURL).then(({ data }) => {
                        logger.info(data, 'New PlainInstance spawned');
                        interaction.editReply({ embeds: [newPlainInstanceEmbed(data)] });
                      });
                      onlyOnePlainInstanceFlag = false;
                    }
                  }
                } catch (error) {
                  console.error(error);
                }
              }, 1000);
            }
          }
        });

        deleteTaskbyIdNin(['1', '2']).then(
          () => logger.info('Successfully deleted all tasks except pid 1 and 2'),
        ).catch(console.error);
      } else { // plain instance not found start new one
        const { data } = await newInstanceURL(plainInstanceURL).catch(console.error);
        message = newPlainInstanceEmbed(data);
      }

      await interaction.reply({ embeds: [message] });
    } else if (subcommand === 'start') {
      let message = embedError('Undefined response...');
      try {
        const plainInstance = instances.find(({ name }) => name === 'Lab Plain Instance');

        if (plainInstance?.state === 'running') {
          message = embedWarning(`Plain instance is already running: ${hyperlink(getVisitLinkURL(plainInstance.url))}`);
        }

        if (!plainInstance) { // plain instance not found start new one
          const { data } = await newInstanceURL(plainInstanceURL);
          message = newPlainInstanceEmbed(data);
        }
        console.log(plainInstance);
        if (['ready', 'stopped'].includes(plainInstance?.state)) { // start plain instance
          startInstance(plainInstance.url);
          message = embedInformation(`Plain instance started: ${hyperlink(getVisitLinkURL(plainInstance.url))}`);
        }
      } catch (error) {
        console.error(error);
        message = embedError('An error has been occured...');
      } finally {
        await interaction.reply({ embeds: [message] });
      }
    }
  },
};
