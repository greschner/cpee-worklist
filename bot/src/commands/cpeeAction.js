import { SlashCommandBuilder, hyperlink } from 'discord.js';
import {
  abandonInstance, getCurrentInstances, getInstanceState, newInstanceURL,
  startInstance, getVisitLinkURL,
} from '../api/cpee.js';
import { plainInstanceURL } from '../config.js';
import logger from '../logger.js';
import { deleteTaskbyIdNin, deleteProducedbyIdNin } from '../tasks/tasksData.js';

export default {
  data: new SlashCommandBuilder().setName('cpee_action').setDescription('Execute specific actions on cpee')
    .addSubcommand((subcommand) => subcommand.setName('abandon')
      .setDescription('Abandon all lab instances').addIntegerOption((option) => option.setName('abandon_instance').setDescription('Enter the cpee instance number')))
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
          const test = ['Wellplate', 'Sample', 'labAutomationPlainInstance', 'finish_watcher'].some((item) => instance.name.includes(item));
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
      let message = 'executing...';
      const plainInstance = instances.find(({ name }) => name === 'labAutomationPlainInstance');

      if (plainInstance) {
        console.log('hi');
        let onlyOnePlainInstanceFlag = true;
        instances.forEach((instance) => {
          const test = ['labAutomationPlainInstance', 'finish_watcher', 'Wellplate', 'Sample'].some((item) => instance.name.includes(item));
          if (test) {
            const { pathname } = new URL(instance.url);
            const pathArr = pathname.split('/');

            abandonInstance(parseInt(pathArr[3], 10));
            if (instance.name === 'labAutomationPlainInstance') {
              const interval = setInterval(async () => {
                try {
                  const { data: state } = await getInstanceState(parseInt(pathArr[3], 10));
                  if (state === 'abandoned') {
                    clearInterval(interval);
                    if (onlyOnePlainInstanceFlag) {
                      newInstanceURL(plainInstanceURL).then(({ data }) => {
                        logger.info(data, 'New PlainInstance spawned');
                        interaction.editReply(`New PlainInstance spawned: ${hyperlink(getVisitLinkURL(data['CPEE-INSTANCE-URL']))}`);
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
        message = `New PlainInstance spawned: ${hyperlink(getVisitLinkURL(data['CPEE-INSTANCE-URL']))}`;
      }

      await interaction.reply(message);
    } else if (subcommand === 'start') {
      let message = 'Undefined response...';
      try {
        const plainInstance = instances.find(({ name }) => name === 'labAutomationPlainInstance');

        if (plainInstance?.state === 'running') {
          message = `PlainInstance is already running: ${hyperlink(getVisitLinkURL(plainInstance.url))}`;
        }

        if (!plainInstance) { // plain instance not found start new one
          const { data } = await newInstanceURL(plainInstanceURL);
          message = `New PlainInstance spawned: ${hyperlink(getVisitLinkURL(data['CPEE-INSTANCE-URL']))}`;
        }

        if (['ready', 'stopped'].includes(plainInstance?.state)) { // start plain instance
          startInstance(plainInstance.url);
          message = `PlainInstance started: ${hyperlink(getVisitLinkURL(plainInstance.url))}`;
        }
      } catch (error) {
        console.error(error);
        message = 'An error has been occured...';
      } finally {
        await interaction.reply(message);
      }
    }
  },
};
