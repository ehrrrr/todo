const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));

const mongodb = require('mongodb');
const connectionString = 'mongodb+srv://todoAppUser:p@§§w0rd@cluster0-ve6hd.mongodb.net/TodoApp?retryWrites=true&w=majority';
const sanitizeHtml = require('sanitize-html');
let db;
let port = process.env.PORT || 3000;

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    db = client.db();
    app.listen(port, () => console.log('info', 'Server is running at port: ' + 3000));
});

function passwordProtected(req, res, next) {
    res.set('WWW-Authenticate', 'Basic realm="Simple Todo App"');
    console.log(req.headers.authorization)
    if(req.headers.authorization == "Basic aGVsbG86aGVsbG8=") {
        next();
    } else {
        res.status(401).send("Authentication required!");
    }
}

app.use(passwordProtected);

app.get('/', (req, res) => {
    db.collection('items').find().toArray(function(err, items){
        res.send(`<!DOCTYPE html>
            <html>
            <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Simple To-Do App</title>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
            </head>
            <body>
            <div class="container">
                <h1 class="display-4 text-center py-1">To-Do App</h1>
                <div class="jumbotron p-3 shadow-sm">
                <form id="create-form" action="/create-item" method="POST" >
                    <div class="d-flex align-items-center">
                    <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                    <button class="btn btn-primary">Add New Item</button>
                    </div>
                </form>
                </div>
                
                <ul id="item-list" class="list-group pb-5">

                </ul>
                
            </div>
            <script>
                let items = ${JSON.stringify(items)}
            </script>
            <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
            <script src="/browser.js"></script>
            </body>
            </html>`);    
    })   
})

app.post('/create-item', function(req, res) {
    const safeText = sanitizeHtml(req.body.text, {allowedTags: [], allowedAttributes: {}});
    db.collection('items').insertOne({
        text: safeText
    }, function (err, info) {
        res.json(info.ops[0]);
    })
})

app.post('/update-item', function(req, res){
    const safeText = sanitizeHtml(req.body.text, {allowedTags: [], allowedAttributes: {}});
    db.collection('items').findOneAndUpdate(
        {
            _id: new mongodb.ObjectID(req.body.id)
        }, 
        {
            $set: {text: safeText}
        }, 
        function() {
            res.send('Success');
    })
})

app.post("/delete-item", function(req, res) {
    db.collection("items").deleteOne(
    {
        _id: new mongodb.ObjectID(req.body.id)
    }, function() {
        res.send("Success");
    });
})