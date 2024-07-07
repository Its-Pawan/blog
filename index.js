// import { MongoClient, ObjectId } from 'mongodb'
import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer';
import cors from 'cors';
import 'dotenv/config'
import mongoose from 'mongoose';
import session from 'express-session';

// importing models
import Auth from './models/auth.js'
import Blog from './models/blog.js'

// Set up multer for file uploads 
const upload = multer({ storage: multer.memoryStorage() });

//setting variables
const app = express()
const port = process.env.PORT;

// setting middlewares 
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set('views', './public');
app.use(cors());
app.use(express.static("public"))

app.use(session({
    secret: 'pawan_9494_joshi_9494_KEY_4_session@portfolio0pawan',
    resave: false,
    saveUninitialized: false
}));




// connectiong to db  
try {
    await mongoose.connect(process.env.MONGO_URL)
    console.log('Connected to MongoDB');
} catch (err) {
    console.error('Could not connect to MongoDB:', err);
}


// Middleware to check authentication
const checkAuth = (req, res, next) => {
    if (req.session.isAuthenticated) {
        next();
    } else {
        res.redirect('/login');
    }
};


app.get('/', checkAuth, async (req, res) => {
    try {
        const result = await Blog.find({});
        res.render('index', { data: result });
    } catch (err) {
        res.status(500).send('Error occurred: ' + err.message);
    }
});

app.get('/login', async (req, res) => { 
    res.render('login', { msg: req.query.msg });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const isUserAvailable = await Auth.findOne({ username: username })
    if (!isUserAvailable) {
        res.redirect('/login?msg=User not found');
    }

    else {
        if (isUserAvailable && password === isUserAvailable.password) {
            req.session.isAuthenticated = true;
            res.redirect('/');
        } else {
            res.redirect('/login?msg=Authentication Failed');
        }
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    })
})




app.post('/submit', upload.single('image'), async (req, res) => {
    let title = req.body.title
    let content = req.body.content
    let desc = req.body.desc
    let img = req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
    } : undefined;

    const newBlog = new Blog({
        title: title,
        content: content,
        description: desc,
        image: img
    })
    try {
        await newBlog.save();
        res.redirect('/');
    } catch (err) {
        console.error('Error uploading image:', err);
        res.status(500).send('Error occurred: ' + err.message);
    }
})


app.get('/delete/:id', async (req, res) => {
    const id = req.params.id
    try {
        await Blog.deleteOne({ _id: id })
        res.redirect('/')
    } catch (error) {
        res.status(500).send("Error detected", error)
    }
})

app.get('/update/:id', async (req, res) => {
    const id = req.params.id
    try {
        const data = await Blog.findOne({ _id: id })
        res.render('update', { data: data })
    } catch (error) {
        res.status(500).send("Error detected", error)
    }

})

app.post('/update-data/:id', upload.single('image'), async (req, res) => {
    let id = req.params.id
    const { title, content, desc } = req.body;
    const img = req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype
    } : undefined;

    const updatedBlog = {
        title: title,
        content: content,
        description: desc,
        image: img
    }
    try {
        await Blog.findByIdAndUpdate(id, updatedBlog)
        res.redirect('/')
    } catch (error) {
        res.status(500).send("Error detected", error)
    }
})


// API routes
app.get("/api/data", async (req, res) => {
    try {
        const articles = await Blog.find().lean();
        articles.forEach(article => {
            if (article.image && article.image.data instanceof Buffer) {
                article.image.data = article.image.data.toString('base64');
            }
        });
        res.json(articles);
    } catch (err) {
        res.status(500).send('Error occurred: ' + err.message);
    }
});


app.get('/api/data/:id', async (req, res) => {
    const title = req.params.id;

    try {
        const data = await Blog.findOne({ title }).lean();
        if (!data) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // Convert image buffer to base64 if it exists
        if (data.image && data.image.data instanceof Buffer) {
            data.image.data = data.image.data.toString('base64');
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({ error: 'Error fetching blog' });
    }
});

app.get('*', (req, res) => {
    res.send(`
    <html>
        <head>
            <script>
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000); // 2000 milliseconds = 2 seconds
            </script>
        </head>
        <body>
            <h1>Error 404</h1>
            <small>you will redirect to homepage in 2 seconds</small>
        </body>
    </html>
`);
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


