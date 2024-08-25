const mongoose = require("mongoose");

const booksSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  dir: {
    type: String,
    required: true,
  },
  idioma: {
    type: String,
    required: false,
  }, 
  isbn: {
    type: String,
    required: true
  }
});

const BooksModel = mongoose.model("books", booksSchema);

module.exports = BooksModel;
