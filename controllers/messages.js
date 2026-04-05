let messageModel = require('../schemas/messages')

module.exports = {
    CreateMessage: async function (from, to, messageContent) {
        let newMessage = new messageModel({
            from: from,
            to: to,
            messageContent: messageContent
        })
        await newMessage.save();
        return newMessage;
    },

    GetConversation: async function (userId, otherUserId) {
        let messages = await messageModel.find({
            $or: [
                { from: userId, to: otherUserId },
                { from: otherUserId, to: userId }
            ]
        }).sort({ createdAt: 1 });
        return messages;
    },

    GetLastMessageFromEachUser: async function (userId) {
        let messages = await messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { from: new (require('mongoose')).Types.ObjectId(userId) },
                        { to: new (require('mongoose')).Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$from', new (require('mongoose')).Types.ObjectId(userId)] },
                            '$to',
                            '$from'
                        ]
                    },
                    lastMessage: { $last: '$$ROOT' }
                }
            },
            {
                $replaceRoot: { newRoot: '$lastMessage' }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'from',
                    foreignField: '_id',
                    as: 'fromUser'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'to',
                    foreignField: '_id',
                    as: 'toUser'
                }
            }
        ]);
        return messages;
    }
}
