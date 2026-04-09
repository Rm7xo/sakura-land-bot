import { prisma } from '../db/prisma.js';
export const getLatestReviews=(limit=5)=>prisma.review.findMany({where:{status:'published'},orderBy:{createdAt:'desc'},take:limit});
export const addReview=(data)=>prisma.review.create({data});
