const config = require("../config/config");

module.exports = (id) => config.owners.includes(id);
