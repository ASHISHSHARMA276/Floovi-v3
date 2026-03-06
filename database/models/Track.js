// Mock Track model.
module.exports = {
  findOne: async () => null,
  create: async (data) => data,
  deleteOne: async () => ({ deletedCount: 1 }),
};
