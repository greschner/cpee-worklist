import mongoose from 'mongoose';
import logger from '../logger.js';
import { callbackInstance } from '../utils/cpee.js';

const { Schema, model } = mongoose;

// Model for timout collection
const timeoutschema = new Schema({
  _id: String,
  callback: String,
  expireAt: {
    type: Date,
    expires: 0,
    required: true,
    default: Date.now,
  },
}, { versionKey: false, _id: false });

// Model for timout sub collection
const timeoutsubschema = new Schema({
  _id: String,
  callback: {
    type: String,
    required: true,
  },
  cbFlag: {
    type: Boolean,
    default: true,
    required: false,
  },
}, { versionKey: false, _id: false });

const timeoutsubModel = model('timeoutsub', timeoutsubschema);
const timeoutModel = model('timeout', timeoutschema);

// watch for delete events execute callback when delete occurs
timeoutModel.watch([{
  $match: {
    operationType: 'delete',
  },
}]).on('change', async ({ documentKey: { _id } }) => {
  const tsub = await timeoutsubModel.findByIdAndDelete(_id).catch(console.log);
  if (tsub) {
    logger.info(`Timeout callback to instance: ${_id}`);
    callbackInstance(tsub.callback, tsub.cbFlag ? 'true' : 'nil', { 'Content-Type': 'text/plain' }).catch(console.log);
  }
});

export { timeoutModel, timeoutsubModel };
