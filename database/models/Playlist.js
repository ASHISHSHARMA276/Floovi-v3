const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  tracks: [{
    title: { type: String, required: true },
    uri: { type: String, required: true },
    duration: { type: Number },
    author: { type: String }
  }]
});

PlaylistSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Playlist", PlaylistSchema);
