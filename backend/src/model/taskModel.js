import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for task collection
const taskschema = new Schema({
  label: {
    type: String,
    required: true,
  },
  activity: {
    type: String,
    required: true,
  },
  callback: {
    type: String,
    required: true,
  },
  callbackId: {
    type: String,
    required: true,
  },
  instance: {
    type: String,
    required: true,
  },
  instanceUuid: {
    type: String,
    required: true,
  },
  instanceUrl: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: false,
    default: Date.now,
  },
  body: {},
}, { versionKey: false });

export default model('task', taskschema);
