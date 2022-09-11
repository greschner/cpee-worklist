import taskModel from './taskModel';
import producedModel from './producedModel';

const getTaskById = async (pid) => taskModel.find({ pid });

const countTaskById = async (pid) => taskModel.countDocuments({ pid });

const deleteTaskbyId = async (pid) => taskModel.deleteMany({ pid });

const deleteTaskbyIdNin = async (pid) => taskModel.deleteMany({ pid: { $nin: pid } });

const deleteProducedbyIdNin = async (pid) => producedModel.deleteMany({ pid: { $nin: pid } });

export {
  getTaskById, countTaskById, deleteTaskbyId, deleteTaskbyIdNin, deleteProducedbyIdNin,
};
