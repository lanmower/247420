import db from '$lib/db.js';
export const prerender = true;

export async function load(ctx) {
    const usersSub = await db.getUsers();
    const user = await new Promise(res=>{
        usersSub.subscribe((a)=>{
            if(a) res(a.filter((item) => {
                const nick = ctx.params.nick
                return item.ERC20 === nick
            })[0])
        })
    })
    
    return {user}
}