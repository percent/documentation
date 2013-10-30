# Percent Documentation

Welcome to the Percent official documentation. In here you will find the article we use in our website to document our platform.

For fixes please send a pull request.

## Authors

### Adding Articles

Writing a new article is done by simply adding a Markdown file to a subdirectory.

Several articles with related content can be placed under a separate/new subdirectory. Only markdown files included in the catalog.

*Note:* each subdirectory is expected to at least have an index.md to generate a proper catalog.

### Renaming Articles

When you want to move articles or complete folders you should update the `301.json` file that is in the root of the git repository. This way implementors can redirect urls easily without getting 404's. If you are removing content you don't need to change anything as it's supposed to 404.

### Deleting Articles

Simple remove articles or folders.

### Images

Images must be added to `/assets`. [Versions][versions] will ensure images are fetched from the repository and properly cached. Linking to an image from the article should be done as below:

```
![no applications](https://cdn.percent.io/id:documentation/resources/noapps.png)
```

## Developers

### Using the Documentation as Module

Simply add documentation as dependency to the `package.json`, make sure to call the documentation constructor, otherwise the [search index][lunr] will not be initialized properly.

``` javascript
var Documentation = require('documentation'),
    docs = new Documentation();

docs.search('query');
```

### Get Markdown Content

Call `documentation.get('/quickstart/hello-world')` with a relative path to the article as first parameter, adding `.md` is optional.

Will return an object with keys content, description, title and tags. For more details about data for all keys, see [Description, title and tags][description].

``` javascript
{
  content: '##Some markdown content\n\nWhich is not parsed yet.',
  description: 'description parsed from content',
  title: 'title parsed from content',
  tags: [
    'top', 'ten', 'unique', 'descriptive', 'words',
    'without', 'numbers', 'and', 'short', 'tags'
  ]
}
```

[description]: #description-title-and-tags

### Get the Catalog

Call `documentation.catalog()` to acquire a complete catalog from content (synchronously), which should return an object with paths, href's, titles and descriptions. If you want to generate the catalog asynchronously then supply a callback to the function.

``` javascript
{
  index: {
    index: {
      href: '',
      title: 'Docs',
      description: '# Introduction\n\nFoo Bar'
    }
  },
  support: {
    index: {
      href: '/support',
      title: 'Support',
      description: '#Support\n\nBaz Foo'
    }
  }
}
```

### Description, Title and Tags

Adding a description and title to the article is as easy as providing it at the bottom of the content as per example. Omitting title and/or description is possible. The description will be parsed from the first lines of the content. The title will be returned with an empty string.

``` markdown
[meta:title]: <> (Foo Bar)
[meta:description]: <> (Lorem Ipsum)
```

Tags are parsed from the content by using TFIDF. Ten of the most descriptive tags are returned by default. Currently, there is no support for custom tags.

### Full Text Search

The search engine is powered by [lunr]. The `documentation#search` method is a simple proxy to Lunr search.

### Thank you

Thank you for the [Nodejitsu](https://nodejitsu.com) team for building much of the code that powers this module. You should check them out for Node.js hosting options

[lunr]: https://github.com/olivernn/lunr.js
[versions]: http://versions.nodejitsu.com