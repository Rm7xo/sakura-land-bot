import axios from 'axios';
import { getSallaToken } from './oauth.js';
export async function getOrderById(orderId){
  const token=await getSallaToken();
  if(!token) return {ok:false, reason:'missing_access_token'};
  try{
    const response=await axios.get(`${process.env.SALLA_API_BASE||'https://api.salla.dev/admin/v2'}/orders/${orderId}`,{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'}});
    return {ok:true,data:response.data?.data||response.data};
  }catch(err){ return {ok:false, reason:'order_lookup_failed', details:err.response?.data||err.message}; }
}
export const isAcceptedOrderStatus=(order)=>['paid','completed'].includes(String(order?.status||'').toLowerCase());
