import User from "../models/user.js";

async function updateStatus(id, status){
    try{
        const user = await User.findById(id)
        user.isOnline = status === 'online' ? true : false;
        if(status !== 'online'){
            user.lastSeen = Date.now()
        }
        user.save()
    }catch(error){
        console.log(error)
    }
}

export { updateStatus }