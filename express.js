const express = require('express')
const LivrosModel = require("./src/models/books.model");
const BooksModel = require('./src/models/books.model');
const bodyParser = require("body-parser");

const port = 8080

const app = express()
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/download/:id', async function (req, res) {
    try {
        const id = req.params.id;
        const livro = await BooksModel.findOne({ '_id': id }, 'dir');
        const dir = livro.dir
        console.log(livro.dir);      

        res.download(`repositorio/${dir}`)
        res.status(200)   
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.get('/', async function (req, res) {
    try {
        const livros = await BooksModel.find({});

        res.render('home', { livros })
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.get('/add', async function (req, res) {
    try {
        const livros = await BooksModel.find({});

        res.render('add', { livros })
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.post("/add", async (req, res) => {
    try {
      const livro = await BooksModel.create(req.body);
      console.log(req.body);
  
      res.redirect("./add");
    } catch (error) {
      console.log(req.body);
      res.status(500).send(error.message);
    }
});

app.listen(port, () => console.log(`Porta: ${port}`));