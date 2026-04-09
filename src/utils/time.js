export const nowIso=()=>new Date().toISOString();
export const todayKey=()=>new Date().toISOString().slice(0,10);
export const addMinutes=(d,m)=>new Date(d.getTime()+m*60000);
