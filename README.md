# JavaScript Carvoyant API

The JavaScript Carvoyant API for both the browser and Node.js.  This library was created using the
[Carvoyant API Reference](http://confluence.carvoyant.com/display/PUBDEV/API+Reference) and as of writing this,
this library has complete feature parity with the documented Carvoyant API Reference.

## Usage

Below are usage scenarios for both the browser and Node.js.

### Browser

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

**Note:** The usage pattern documented will depend on this module being registered with NPM.  When that is taken
care of, this note will be removed.

Installation is as simple as any other Node.js module using [NPM](https://npmjs.org/):

```bash
npm install carvoyant --save
````

At this point, you can use the module like any other:

```javascript
var client = require('carvoyant').createClient({apiKey: '...', securityToken: '...'});
````

### Development

This project uses best of breed libraries and tooling:

* [Browserify](http://browserify.org/) - Tool for allowing you to write browser code like Node.js
* [Grunt](http://gruntjs.com/) - The JavaScript task runner
* [Karma](http://karma-runner.github.io/): Test runner for JavaScript
* [Lodash](http://lodash.com/) - Utility library for JavaScript (We're current piecing together the pieces we need
instead of using the whole library to make the browser builds as small as possible)
* [Superagent](http://visionmedia.github.io/superagent/) - JavaScript AJAX library for the browser and Node.js

## Future Plans

* Get this into NPM
* Get this into Bower/Component
* Hook up to Travis
* Update this documentation
* Create an example application online
* Tag an initial release
* Generate a sourcemap for the generated version and link to it