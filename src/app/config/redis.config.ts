import { createClient } from "redis";
import { envVariables } from "./env";

export const redisClient = createClient({
    username: envVariables.REDIS_USERNAME,
    password: envVariables.REDIS_PASSWORD,
    socket: {
        host: envVariables.REDIS_HOST,
        port: Number(envVariables.REDIS_PORT),
    },
});

redisClient.on("error", (err) => {
    console.error("❌ Redis Client Error:", err.message);
});

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log("✅ Redis Connected");
        }
    } catch (error) {
        console.error("❌ Redis Connection Failed");
    }
};

// Graceful shutdown
process.on("SIGINT", async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
        console.log("🔴 Redis Disconnected");
    }
    process.exit(0);
});
