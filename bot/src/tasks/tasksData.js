import mongoose from 'mongoose';
import { encodeMongoURI } from '../db.js';

let { default: taskModel } = await import('./taskModel.js');
let { default: producedModel } = await import('./producedModel.js');

if (process.env.MONGO_DB_URI2) {
  const conn = mongoose.createConnection(encodeMongoURI(process.env.MONGO_DB_URI2));
  const { taskschema } = await import('./taskModel.js');
  const { producedschema } = await import('./producedModel.js');
  taskModel = conn.model('task', taskschema);
  producedModel = conn.model('produced', producedschema);
}

const getTaskById = async (pid) => taskModel.find({ pid });

const countTaskById = async (pid) => taskModel.countDocuments({ pid });

const deleteTaskbyId = async (pid) => taskModel.deleteMany({ pid });

const deleteTaskbyIdNin = async (pid) => taskModel.deleteMany({ pid: { $nin: pid } });

const deleteProducedbyIdNin = async (pid) => producedModel.deleteMany({ pid: { $nin: pid } });

export {
  getTaskById, countTaskById, deleteTaskbyId, deleteTaskbyIdNin, deleteProducedbyIdNin,
};
