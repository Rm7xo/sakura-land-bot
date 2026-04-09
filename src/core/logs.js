import { prisma } from '../db/prisma.js';
export const addGenerationLog=(data)=>prisma.generationLog.create({data});
export const getGenerationLogs=(orderId=null)=>prisma.generationLog.findMany({where:orderId?{orderId:String(orderId)}:{},orderBy:{createdAt:'desc'},take:50});
