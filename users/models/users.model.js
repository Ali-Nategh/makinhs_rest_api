const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    permissionLevel: Number,
    friendsId: [String]
});

userSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Ensure virtual fields are serialized.
userSchema.set('toJSON', {
    virtuals: true
});

userSchema.findById = function (cb) {
    return this.model('Users').find({id: this.id}, cb);
};

const User = mongoose.model('Users', userSchema);


exports.findByEmail = (email) => {
    return User.find({email: email});
};
exports.findById = (id) => {
    return User.findById(id)
        .then((result) => {
            result = result.toJSON();
            delete result._id;
            delete result.__v;
            return result;
        });
};

exports.createUser = (userData) => {
    const user = new User(userData);
    return user.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        User.find()
            .limit(perPage)
            .skip(perPage * page)
            .exec(function (err, users) {
                if (err) {
                    reject(err);
                } else {
                    resolve(users);
                }
            })
    });
};

exports.patchUser = (id, userData) => {
    return User.findOneAndUpdate({
        _id: id
    }, userData);
};

exports.removeById = (userId) => {
    return new Promise((resolve, reject) => {
        User.deleteMany({_id: userId}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

exports.addFriendById = async (id, friendId, res) => {
    const user = await User.findById(id)
    if (user.friendsId.includes(friendId)) return res.status(400).send("friend already exists");

    await User.findOneAndUpdate({ _id: id }, { friendsId: [...user.friendsId, friendId] });
    return res.status(204).send();
};

exports.removeFriendById = async (id, friendId, res) => {
    const user = await User.findById(id)
    if (!user.friendsId.includes(friendId)) return res.status(400).send("friend doesn't exists");

    await User.findOneAndUpdate({ _id: id }, { friendsId: user.friendsId.filter(id => id !== friendId) });
    return res.status(204).send();
};
