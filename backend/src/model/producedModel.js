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
    default: Date.now,
    expires: '7d',
  },
  body: {
    sampleid: {
      type: String,
      index: true,
    },
    plateid: {
      type: String,
      index: true,
    },
    position: String,
    result: String,
    retry: String,
    ct: Number,
    valid: Boolean,
    complete: Boolean,
    updated: Boolean,
    stop: Boolean,
  },
}, { collection: 'producerlist', versionKey: false });

export default model('produced', taskschema);
