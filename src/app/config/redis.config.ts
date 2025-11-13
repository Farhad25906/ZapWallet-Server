import { createClient } from 'redis';
import { envVariables } from './env';


export const redisClient = createClient({
    username: envVariables.REDIS_USERNAME,
    password: envVariables.REDIS_PASSWORD,
    socket: {
        host: envVariables.REDIS_HOST,
        port: Number(envVariables.REDIS_PORT)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));



// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar


export const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
        console.log("Redis Connected");
    }
}
