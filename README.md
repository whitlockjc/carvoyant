# JavaScript Carvoyant API

The JavaScript Carvoyant API for both the browser and Node.js.  This library was created using the
[Carvoyant API Reference](http://confluence.carvoyant.com/display/PUBDEV/API+Reference) and as of writing this,
this library has complete feature parity with the documented Carvoyant API Reference.

## Usage

Below are usage scenarios for both the browser and Node.js.

### Browser (Bower)

Installation is as simple as any other browser component using [Bower](http://bower.io/):

```bash
bower install carvoyant --save
```

### Browser (Manual)

Browser support for the JavaScript Carvoyant API is provided by [browserify](http://browserify.org/).  This offers
a zero configuration deployment, meaning you do not need to download/install third party dependencies to get this
library to work in a web browser.  While using this library will be no different than usual, there are two versions
of the file:

* [carvoyant.js](https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.js): _284kb_, full source and source maps
* [carvoyant.min.js](https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.min.js): _32kb_, minified, compressed
and no sourcemap

Here is a little HTML snippet showing how you could use the bleeding edge version in your existing page:

```html
<!-- ... -->
<script src="https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.js"></script>
<!-- <script src="https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.min.js"></script> -->
<script>
var client = carvoyant.createClient({apiKey: '...', securityToken: '...'});
</script>
<!-- ... -->
````

### Node.js

Installation is as simple as any other Node.js module using [NPM](https://npmjs.org/):

```bash
npm install carvoyant --save
````

At this point, you can use the module like any other:

```javascript
var client = require('carvoyant').createClient({apiKey: '...', securityToken: '...'});
````

For more details on what APIs are available and how to use them, please use the source until I can get the
items listed at the bottom of the page complete.

## Development

This project uses best of breed libraries and tooling:

* [Browserify](http://browserify.org/) - Tool for allowing you to write browser code like Node.js
* [Grunt](http://gruntjs.com/) - The JavaScript task runner
* [Karma](http://karma-runner.github.io/): Test runner for JavaScript
* [Lodash](http://lodash.com/) - Utility library for JavaScript (We're current piecing together the pieces we need
instead of using the whole library to make the browser builds as small as possible)
* [Superagent](http://visionmedia.github.io/superagent/) - JavaScript AJAX library for the browser and Node.js

### Running Tests and Building

Right now the default Grunt command will run all tests (browser and Node.js) and create browser binaries for the
project.  To do this, all you have to do is run `grunt` from the command line, this of course assumes you installed
the project dependencies after cloning the repository using `npm install`.  You can also generate
[JSDoc](http://usejsdoc.org/) documentation using `grunt jsdoc`.  (This will eventually be incorporated into the
build/release cycle so we can host the API documentation online.)  Finally, to run the test suite you need to copy
the template client configuration from **test/client_config.js.tmpl** to **test/client_config.js** and populate it
with valid Carvoyant API credentials.

## Future Plans

* Update this documentation
* Create an example application online
* Generate a sourcemap for the generated version and link to it
* Automate GitHub Pages with landing page, documentation, API documentation, etc.
* Flesh the API out more to be less raw
