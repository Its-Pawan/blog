import mongoose from 'mongoose';

const authSchema = new mongoose.Schema({
    username: String,
    password: String

}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

const Auth = mongoose.model('auth', authSchema);

export default Auth