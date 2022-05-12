import mongoose from 'mongoose';

const { Schema, model } = mongoose;
// Model for settings collection
const sampleschema = new Schema({
  id: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  macaddress: {
    type: String,
    required: true,
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
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: '90d',
  },
}, { versionKey: false });

export default model('logging', sampleschema);
