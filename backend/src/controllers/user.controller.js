import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [
                {_id: {$ne: currentUserId}}, // exclus l'utilisateur actuel
                {$id: {$nin: currentUser.friends}}, // exclus les amis de l'utilisateur actuel
                {isOnBoarded: true}
            ]
        })
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error("Error in getRecommendeUsers controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export async function sendFriendRequest(req,res) {
    try {
        const myId = req.user.id;
        const {id:recipientId} = req.params;

        // prevent sending req to yourself
        if (myId === recipientId) {
            return res.status(400).json({ messsage: "You can't send friend request to yourself"});
        }

        if(recipientId.friends.includes(myId)) {
            return res.status(400).json({ message: "You rare already friends with this user"});
        }

        const existingRequest = await FriendRequest.findOne({
            $or:[
                {sender: myId, recipient: recipientId},
                {sender: recipientId, recipientId: myId},
            ],
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A friend request already exists between you and this user"});
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,
        });

        res.status(201).json({friendRequest});

    } catch (error) {
        console.error("Error in sendFriendRequest controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
}