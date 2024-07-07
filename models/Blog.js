import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    description: String,
    image: {
        data: Buffer,
        contentType: String
    },
    publishDate: {
        type: Date,
        default: Date.now,
        get: (date) => date.toISOString().split('T')[0] // Format the date as YYYY-MM-DD
    }
}, {
    toJSON: { getters: true },
    toObject: { getters: true }
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog