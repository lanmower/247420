import db from '$lib/db.js';
export const prerender = true;
export const trailingSlash = 'always'
export async function load(ctx) {
    const usersSub = await db.getUsers();
    const postsSub = await db.getPosts();
    const users = await new Promise(res=>{
        usersSub.subscribe((a)=>{
            if(a) res(a)
        })
    })
    const posts = await new Promise(res=>{
        postsSub.subscribe((a)=>{
            if(a) res(a)
        })
    })
    return {users, posts, login:db.login, logout:db.logout, loggedin:db.loggedin}
}