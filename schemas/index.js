const mongoose = require("mongoose");

const { MONGO_ID, MONGO_PASSWORD, NODE_ENV } = process.env;
const MONGO_URL = `mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`;

const connect = () => {
  if (NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }
  mongoose.connect(
    MONGO_URL,
    {
      dbName: "nodechat",
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    },
    (error) => {
      if (error) {
        console.log("error", error);
      } else {
        console.log("success");
      }
    }
  );
};

mongoose.connection.on("error", (error) => {
  console.error("error", error);
});
mongoose.connection.on("disconnected", () => {
  console.error("disconnected try again");
  connect();
});

module.exports = connect;
