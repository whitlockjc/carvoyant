# JavaScript Carvoyant API

The JavaScript Carvoyant API for both the browser and Node.js.  This library was created using the
[Carvoyant API Reference](http://confluence.carvoyant.com/display/PUBDEV/Carvoyant+API) and as of writing this,
this library has complete feature parity with the documented Carvoyant API Reference.

## Release Notes

* **0.0.5 (TBD)** - Cleanup the API
    * Stop passing each API argument as a function argument (use `function (options, cb)`)
    * Refactor out of single client.js into more specific modules
    * Implement code coverage in the tests
* **0.0.4 (2014 Mar 11)** - Add support for missing Carvoyant APIs
    * [Account APIs][carvoyant-account-apis]
    * [Constraint APIs][carvoyant-constraint-apis]
    * [Event Notification APIs][carvoyant-event-notification-apis]
    * [Event Subscription APIs][carvoyant-event-subscription-apis]
    * [Create/Update Vehicle APIs][carvoyant-vehicle-apis]
* **0.0.3 (2014 Mar 8)** - Bugfix release
    * [Pull Request #1 (Use query params or POST body based on API)][pr1]
* **0.0.2 (2013 Nov 26)** - Miscellaneous minor refactorings
* **0.0.1 (2013 Nov 19)** - Initial release

## Known API Issues

Below are a list of known (as of this writing) issues/inconsistencies with the upstream Carvoyant API:

* No API for deleting a vehicle (Has an impact on testing and API completeness)
* No API to create trip data (Makes sense but this has an impact on testing)
* No API to create/update/delete constraints (Has an impact on testing and API completeness)
* No API to create event notifications (Makes sense but has an impact on testing)
* Constraint update API seems broken (Creates a new constraint instead of updating the existing one)
* Constraint, event notification, event subscription and vehicle list APIs return 404 instead for an empty list instead
of a 200 with empty array (This is just an inconsistency that might cause you issues in using the API without knowing)
* Some list APIs return plural form (constraints, subscriptions, notifications) while the rest do not (This is just an
inconsistency that might cause you issues in using the API without knowing)

## Usage

Below are usage scenarios for both the browser and Node.js.

### Browser

Browser support for the JavaScript Carvoyant API is provided by [browserify](http://browserify.org/).  This offers
a zero configuration deployment, meaning you do not need to download/install third party dependencies to get this
library to work in a web browser.  While using this library will be no different than usual, there are two versions
of the file:

* [carvoyant.js](https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.js): _328kb_, full source and source maps
* [carvoyant.min.js](https://raw.github.com/whitlockjc/carvoyant/master/carvoyant.min.js): _40kb_, minified, compressed
and no sourcemap

Installation can be as simple as downloading the proper JavaScript file into your project or installing it via
[Bower](http://bower.io/) which is as simple as installing any other browser component using Bower:

```bash
bower install carvoyant --save
```

Now that you've installed it into your project, here is an example HTML snippet to get you started:

```html
<!-- ... -->
<script src="bower_components/carvoyant/carvoyant.js"></script>
<!-- <script src="bower_components/carvoyant/carvoyant.min.js"></script> -->
<script>
var client = carvoyant.createClient({apiKey: '...', securityToken: '...'});
</script>
<!-- ... -->
```

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
the project dependencies after cloning the repository using `npm install` and that you've created a working
`test/client_config.js`.  (You can do this by copying `test/client_config.js.tmpl` to `test/client_config.js` and
updating accordingly)  As of this time, unit tests and integration tests run together, there is no separation.  Do
to the nature of the upstream Carvoyant API, this can leave behind created vehicles.  You can clean these up from
the [Carvoyant Dashboard][carvoyant-dashboard].

**Disclaimer**

The way tests currently work right now is we create a vehicle and that vehicle is used for **all** tests where
possible.  Any write API we test will be against the created vehicle.  We will never update an object we did not
create as a part of our test.  When you are done, the created vehicle will be left in your inventory due to a missing
delete API.

There are a few tests that require us to use a vehicle id that already has data associated with it, due to us not
having APIs to create the data behind the APIs being tested.  These cases are documented and handled in the
`test/client_config.js`.

### API Documentation

You can also generate [JSDoc](http://usejsdoc.org/) documentation using `grunt jsdoc`.  (This will eventually be
incorporated into the build/release cycle so we can host the API documentation online.)

[carvoyant-account-apis]: http://confluence.carvoyant.com/display/PUBDEV/Account
[carvoyant-constraint-apis]: http://confluence.carvoyant.com/display/PUBDEV/Constraint
[carvoyant-dashboard]: https://dash.carvoyant.com/
[carvoyant-event-notification-apis]: http://confluence.carvoyant.com/display/PUBDEV/EventNotification
[carvoyant-event-subscription-apis]: http://confluence.carvoyant.com/display/PUBDEV/EventSubscription
[carvoyant-vehicle-apis]: http://confluence.carvoyant.com/display/PUBDEV/Vehicle
[pr1]: https://github.com/whitlockjc/carvoyant/pull/1
