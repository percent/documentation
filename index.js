/* jslint node: true */
"use strict";

var path = require('path'),
  fs = require('fs'),
  natural = require('natural'),
  lunr = require('lunr'),
  tokenizer = new natural.WordTokenizer(),
  loc = path.resolve(__dirname, 'content'),
  scraper = {
    title: /\[meta:title\]:\s<>\s\((.+?)\)(?!\))/,
    description: /\[meta:description\]:\s<>\s\((.+?)\)(?!\))/,
    firstlines: /^((.*\n){2}){1,3}/
  };

function scrape(content, key, n) {
  if (!content)
    return '';

  var match = content.match(scraper[key]);

  return match && match[n] ? match[n].trim() : '';
}

function normalize(filename) {
  if (!filename)
    filename = 'index.md';

  if (filename[filename.length - 1] === '/')
    filename = filename.slice(0, -1);

  return ~filename.indexOf('.md') ? filename : filename + '.md';
}

function fileContent(content) {
  return {
    content: content || '',
    description: scrape(content, 'description', 1) || scrape(content, 'firstlines', 0),
    title: scrape(content, 'title', 1),
    tags: tags(content, 10)
  };
}

function frequency(content) {
  var tfidf = new natural.TfIdf(),
    processed = [],
    words = [];

  //
  // add the current content.
  //
  content = content.toLowerCase();

  tfidf.addDocument(content);
  tokenizer.tokenize(content).forEach(function wordFrequency(word) {
    //
    // return early if word is already processed,
    // too short or only a number.
    //
    if (+word || word.length < 3 || ~processed.indexOf(word))
      return;

    words.push({
      word: word,
      score: tfidf.tfidf(word, 0)
    });

    //
    // add word to processed so tfidf is not called more than required
    //
    processed.push(word);
  });

  return words;
}

function tags(content, n) {
  if (!content)
    return [];

  return frequency(content).sort(function sortByScore(a, b) {
    return b.score - a.score;
  }).slice(0, n).map(function extractWords(tag) {
    return tag.word;
  });
}

function read(file, callback) {
  if (!callback) {
    return fileContent(fs.readFileSync(path.resolve(loc, normalize(file)), 'utf8'));
  }

  file = path.resolve(loc, normalize(file));

  fs.readFile(file, 'utf8', function read(error, content) {
    callback.apply(this, [error, fileContent(content)]);
  });
}

function walk(dir, callback, result, sub) {
  var current = sub ? path.basename(dir) : 'index';

  // Prepare containers.
  result = result || {};
  result[current] = {};

  // Read the current directory
  fs.readdir(dir, function readDir(error, list) {
    if (error)
      return callback(error);

    var pending = list.length;

    if (!pending)
      return callback(null, result);

    list.forEach(function loopFiles(file) {
      file = dir + '/' + file;

      fs.stat(file, function statFile(error, stat) {
        var name, ref;

        if (stat && stat.isDirectory()) {
          walk(file, function dirDone() {
            if (!--pending)
              callback(null, result);
          }, result, true);
        } else {
          //
          // only get markdown files from the directory content.
          //
          if (path.extname(file) !== '.md')
            return;

          ref = path.basename(file, '.md');
          name = ['/' + path.basename(dir), ref];

          //
          // only append the name of the file if not index
          //
          if (ref === 'index')
            name.pop();

          //
          // get the tile of the file.
          //
          read(file, function getFile(err, file) {
            result[current][ref] = {
              href: sub ? name.join('/') + '/' : '/',
              title: file.title,
              description: file.description,
              path: dir
            };

            if (!--pending)
              callback(null, result);
          });
        }
      });
    });
  });
}

function walkSync(dir, result, sub) {
  var current = sub ? path.basename(dir) : 'index';

  result = result || {};
  result[current] = {};

  fs.readdirSync(dir).forEach(function loopDir(file) {
    var stat, name, ref;

    file = dir + '/' + file;
    stat = fs.statSync(file);

    //
    // if directory initiate another walk.
    //
    if (stat && stat.isDirectory()) {
      walkSync(file, result, true);
    } else {
      //
      // only get markdown files from the directory content
      //
      if (path.extname(file) !== '.md')
        return;

      ref = path.basename(file, '.md');
      name = ['/' + path.basename(dir), ref];

      //
      // only append the name of the file if not index
      //
      if (ref === 'index')
        name.pop();

      //
      // append file information to current container.
      //
      file = read(file);
      result[current][ref] = {
        href: sub ? name.join('/') + '/' : '/',
        title: file.title,
        description: file.description,
        path: dir
      };
    }
  });

  return result;
}

//
// # function Documentation()
//
// Constructor for easy access to Documentation content. On constructuing documentation
// synchronously prepare the search index. Listening to a search index ready
// event is not required thus easing the flow.
//
function Documentation() {
  var toc = walkSync(loc),
    idx = this.idx = lunr(function setupLunr() {
      this.field('title', {
        boost: 10
      });
      this.field('body');
    });

  Object.keys(toc).forEach(function loopSections(section) {
    Object.keys(toc[section]).forEach(function loopPages(page) {
      var document = read((section !== 'index' ? section + '/' : '') + page);

      idx.add({
        id: section + '/' + page,
        title: document.title,
        body: document.content
      });
    });
  });
}

//
// # function documentation.get()
//
// Proxy method to private async method read. This method can be called
// synchronously by omitting the callback.
//
Documentation.prototype.get = function get(file, callback) {
  read.apply(this, arguments);
};

//
// # function documentation.catalog()
//
// Returns a catalog by parsing the content directory
//
Documentation.prototype.catalog = function catalog(callback) {
  if (!callback) return walkSync(loc);

  walk(loc, callback);
};

//
// # function documentation.search()
//
// Proxy to the search method of Lunr, returns a list of documents, this must
// be called in Lunr scope.
//
Documentation.prototype.search = function (query) {
  return this.idx.search.call(this.idx, query);
};

//
// Expose the 301 routes for the documentation.
//
Documentation.redirect = require('./301.json');

// Expose public functions.
module.exports = Documentation;