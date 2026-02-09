const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://namastenode_db_user:pdLe7eJxL7iYZ9xE@namastenode-cluster.yrad3wg.mongodb.net/devTinder",
  );
};

module.exports = {
  connectDB,
};
