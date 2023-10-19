import Redis from 'ioredis';
 
const kv = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
 
export default kv;