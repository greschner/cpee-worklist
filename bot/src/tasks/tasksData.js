import mongoose from 'mongoose';
import { encodeMongoURI } from '../db';

let { default: taskModel } = await import('./taskModel');
let { default: producedModel } = await import('./producedModel');

if (process.env.MONGO_DB_URI2) {
  const conn = mongoose.createConnection(encodeMongoURI(process.env.MONGO_DB_URI2));
  const { taskschema } = await import('./taskModel');
  const { producedschema } = await import('./producedModel');
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
