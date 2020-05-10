const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");

const app = express();
const Schema = mongoose.Schema;

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", ejs);

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connection.on("connected", () => console.log(`Connected to: ${mongoose.connection.name}`));
mongoose.connection.on("error", (err) => console.error("Connection failed with - ", err));

// --- End of setup ---
const articleSchema = new Schema({
    title: String,
    content: String
});

const Article = mongoose.model("Article", articleSchema);


app.route("/articles")
    .get((req, res) => {
        Article.find({}, (err, result) => {
            if (!err) {
                res.send(result);
            } else {
                res.send(err)
            }
        })
    })
    .post((req, res) => {
        const newArticle = new Article({
            title: req.body.title,
            content: req.body.content
        });
        newArticle.save().then(value => res.send(value));

    })
    .delete((req, res) => {
        Article.deleteMany({}, err => {
            if (err) {
                console.log(err);
                res.send(err);
            } else {
                res.send("SUCCESSFULLY DELETED ALL ARTICLES");
            }
        });
    });

app.route("/articles/:title")
    .get((req, res) => {
        let searchParam = req.params.title;
        Article.findOne({title: searchParam}, (err, results) => {
            if (results) {
                res.send(results);
            } else if (err) {
                res.send(err);
            } else {
                res.send(`No article found`)
            }
            ;
        })
    })
    .put((req, res) => {
        let searchParam = req.params.title;
        let titleParam = req.body.title;
        let contentParam = req.body.content;

        Article.updateOne(
            {title: searchParam},
            {title: titleParam, content: contentParam},
            (err, raw) => {
                if (!err) {
                    res.send(raw);
                } else res.send(err);
            }
        )

    })
    .patch((req, res) => {
        let searchParam = req.params.title;

        Article.updateOne(
            {title: searchParam},
            {$set: req.body},
            (err, raw) => {
                if (!err) {
                    res.send("SUCCESSFULLY UPDATED ARTICLE. " + req.accepted)
                } else (res.send(err));
            }
        )
    })
    .delete((req, res) => {
        let searchParam = req.params.title;
        Article.deleteOne(
            {title: searchParam},
            err => {
                if (!err) {
                    res.send(`SUCCESSFULLY DELETED TITLE: ${searchParam}`)
                } else res.send(err);
            }
        )
    })


// --- Listen Port ---
app.listen(3000, () => {
    console.log("Server running on port 3000")
});