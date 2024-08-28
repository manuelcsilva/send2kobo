const express = require("express");
const LivrosModel = require("./src/models/books.model");
const BooksModel = require("./src/models/books.model");
const bodyParser = require("body-parser");
const multer = require("multer");
const EPub = require("epub");
const fs = require("fs");
const path = require("path");

const port = 8080;

const app = express();
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", "src/views");
app.use(express.static("./src/assets"));
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "repositorio/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname.replace(/\s+/g, "-"));
  },
});

const upload = multer({ storage: storage });

function getEPUBMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const epub = new EPub(filePath);

    epub.on("end", function () {
      const metadata = epub.metadata;
      resolve(metadata);
    });

    epub.on("error", function (error) {
      reject(error);
    });

    epub.parse();
  });
}

app.get("/download/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const livro = await BooksModel.findOne({ _id: id }, "dir");
    const dir = livro.dir;
    console.log(livro.dir);

    res.download(`repositorio/${dir}`);
    res.status(200);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/apagar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const livro = await BooksModel.findOne({ _id: id }, "dir");
    fs.unlink("repositorio/" + livro.dir, (err) => {
      if (err) {
        // An error occurred while deleting the file
        if (err.code === "ENOENT") {
          // The file does not exist
          console.error("The file does not exist");
          res.status(500).send("The file does not exist");
        } else {
          // Some other error
          console.error(err.message);
        }
      } else {
        // The file was deleted successfully
        console.log("The file was deleted");
      }
    });
    const user = await BooksModel.findByIdAndDelete(id);

    res.redirect("/add");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/editar/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const livro = await BooksModel.findOne({ _id: id }, "nome dir idioma isbn");

    res.render("editar", { livro });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/editar/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await BooksModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log(user);

    res.status(201).redirect("/add");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/", async function (req, res) {
  try {
    const livros = await BooksModel.find({});

    res.render("home", { livros });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/add", async function (req, res) {
  try {
    const livros = await BooksModel.find({});

    res.render("add", { livros });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/add", upload.single("epubFile"), async (req, res) => {
  if (req.file) {
    try {
      await new Promise(resolve => setTimeout(resolve, 5000));
      let md_epub = await getEPUBMetadata(
        path.join("repositorio", req.file.filename)
      );
      console.log(md_epub);
      let dados = {
        nome: md_epub.title,
        dir: req.file.filename,
        idioma: md_epub.language.toUpperCase() || "",
        isbn: md_epub.isbn || md_epub.ISBN || "",
      };
      const livro = await BooksModel.create(dados);

      console.log(dados);
      res.redirect("./add");
    } catch (error) {
      console.error("Erro ao processar o arquivo EPUB:", error);
      res.status(500).send("Erro interno ao processar o arquivo.");
    }
  } else {
    return res.status(400).send("Nenhum arquivo foi enviado.");
  }
});

app.listen(port, () => console.log(`Porta: ${port}`));
