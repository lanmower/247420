import db from '$lib/db.js';
//export const prerender = false;

export async function load(ctx) {
    const usersSub = await db.getUsers();
    const user = await new Promise(res=>{
        usersSub.subscribe((a)=>{
            if(a) res(a.filter((item) => {
                const nick = db.getName()
                return item.ERC20.toLowerCase() == nick
            })[0])
        })
    })
    
    return {user, name:db.getName(), saveUser:db.saveUser}
}