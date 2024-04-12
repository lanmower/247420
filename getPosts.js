import { Web3 } from 'web3'
import { LensClient, production } from "@lens-protocol/client"
import PocketBase from 'pocketbase/cjs'
let web3 = new Web3("https://polygon-rpc.com")
import fs from 'fs'

const lensClient = new LensClient({
    environment: production
});

const pb = new PocketBase('https://247420.xyz')

const getUsers = (async () => {
    global.users = JSON.parse(fs.readFileSync('../migrate/memberslist.json'))//(await pb.collection('users').getList()).items
    try {
        for (const user of global.users) {
            user.Posts = [];
        }
        for (const user of global.users) {
            const address = user.ERC20 || user.User;
            user.nft = '';
            user.url = '/@' + user.Id;
            const add = user.erc20 || user.User || user.user
            const eth = web3.utils.toChecksumAddress(add);
            //console.log(eth);
            //process.exit()
            if (eth) {
                try {
                    const allOwnedProfiles = (await lensClient.profile.fetchAll({
                        where: { ownedBy: [eth] },
                    })).items

                    if (allOwnedProfiles.length) user.Lens = allOwnedProfiles

                    console.log(user.Lens)
                    //process.exit()
                } catch (e) {
                    console.error(e);
                    process.exit()
                }
            }

            if (user.Lens && user.Lens.length) {
                //console.log(user.Lens)
                const lensposts = (await lensClient.publication.fetchAll({
                    where: {
                        from: [user.Lens[0].id],
                    }
                }));

                user.Posts = [];
                let moreposts = lensposts;
                /*while(moreposts = await moreposts.next()) {
                    await new Promise(res=>{setTimeout(res,1000)})
                    moreposts.items.map(a=>user.Posts.push(a));
                }*/
                moreposts.items.map(a=>user.Posts.push(a));
                //console.log(moreposts.items);
                //user.Posts = lensposts.items
                for (let post of user.Posts) {
                    post.createdAt = new Date(post.createdAt).getTime()
                    delete post.by
                    delete post.operations
                    delete post.quoteOn
                }
            }
            console.log(user.Posts.length)
            try {
                user.Lens = user.Lens[user.Lens.length - 1].handle
            } catch (e) {

            }
            console.log(user)
            //console.log('posts',user.Posts.length)
            Object.keys(user).forEach(a => {
                user[a.toLowerCase()] = user[a]
                delete user[a]
            })
            delete user.id
            //if(!user.ERC20) user.ERC20 = user.user
            //if(!user.pseudonym) 
            user.pseudonym = user.lens = user.username = user.lens.localName
            //console.log(user)
            user.ERC20 = web3.utils.toChecksumAddress(user.erc20 || user.user)
            user.catchphrase = user.subtitle
            //console.log({user})
            //process.exit()
            const authData = await pb.admins.authWithPassword('admin@247420.xyz', 'Bigdikn3rgBigdikn3rg');
            const users = await pb.collection("users");
            const posts = await pb.collection("posts");
            let created;
            try {
                user.password = 'Bigdikn3rgBigdikn3rg'
                user.passwordConfirm = 'Bigdikn3rgBigdikn3rg'
                //console.log({user})
                created = await pb.collection('users').create(user);
                created.posts = []
                //console.log({user, created})
                //process.exit()
            } catch (e) {
                //console.error('could not create user', e)
                //process.exit()
            }
            if (!created) {
                //console.log({created})
                created = (await users.getList(1, 1, {
                    filter: 'ERC20 = "' + user.ERC20 + '"'
                })).items[0];
                //console.log('new',{created})
            }
            let changed = false
            //console.log(JSON.stringify(user.posts,null, 2))\
            //console.log(user.posts)
            for (let post of user.posts) {
                //console.log({post})
                //process.exit()
                if(!post.metadata) continue;
                const newPost = {
                    body: post.metadata?.content || post.body || post.metadata?.marketplace.name || "",
                    title: post.metadata?.title || post.metadata?.marketplace.name || post.title || "",
                    metadata: JSON.stringify(post.metadata) || "",
                    user: created.id || "",
                    createdAt: new Date(post.createdAt),
                    network: 'lens' || "",
                    remote_id: post.id || ""
                }
                //process.exit()
                //console.log(JSON.stringify(post, null, 2))
                //console.log(JSON.stringify(newPost, null, 2))
                try {
                    const createdPost = await posts.create(newPost)
                    //console.log({created})
                    created.posts.push(createdPost.id)
                    changed = true;
                    console.log(newPost.createdAt)

                } catch (e) {
                    //console.error("ERROR CREATING POST", e)
                    if(e?.originalError?.data?.data?.remote_id?.code != 'validation_not_unique') {
                        console.log('skipped ', newPost.remote_id)
                        console.error(JSON.stringify(e, null, 2))
                    }
                    //process.exit();

                }
            }
            if (changed) users.update(created.id, created)
        }

        //console.log('done')
    } catch (e) {
        console.error(e);
    }
})
setInterval(getUsers, 180000)
getUsers();