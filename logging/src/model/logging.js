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
  body: {},
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, { versionKey: false });

export default model('logging', sampleschema);
