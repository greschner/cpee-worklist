import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for produced collection
const taskschema = new Schema({
  name: {
    type: String,
    required: true,
  },
  pid: {
    type: String,
    required: true,
    index: true,
  },
  instance: {
    type: String,
    required: false,
  },
  instanceUuid: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    required: false,
    default: Date.now,
  },
  body: {},
}, { collection: 'producerlist', versionKey: false });

export default model('produced', taskschema);