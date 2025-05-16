const app = require("./app");
const config = require("./config");
const MongoDB = require("./utils/mongodb.utils");

async function startServer() {
    try {
        await MongoDB.connect(config.db.uri);
        console.log("connect to the database!");

        const PORT = config.app.port;

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
}

startServer();