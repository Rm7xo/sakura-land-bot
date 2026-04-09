import Redis from 'ioredis';
let redis=null; export const getRedis=()=>{ if(!redis) redis=new Redis(process.env.REDIS_URL,{maxRetriesPerRequest:2}); return redis; };
