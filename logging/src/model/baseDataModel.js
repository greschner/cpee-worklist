import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Model for basedata collection
const bdschema = new Schema({
  id: {
    type: String,
    required: true,
    index: true,
  },
  label: {
    type: String,
    required: true,
  },
}, { collection: 'basedata', versionKey: false });

export default model('basedata', bdschema);
