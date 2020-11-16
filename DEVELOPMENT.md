# Security Planner: Development

## Structure

### Styles

[LESS](http://lesscss.org/) is used for stylesheets. The stysheet sources can be found inside the `/src/less` folder.

The current stylesheet structure uses `app.less` as the main entry point for all styles, with imports used depending on context. These follow the following name conventions:

* `page-*`: styles for "Pages" of the website. "Pages" are normal sections like the Home page, the Action Plan, etc.
* `overlay-*`: styles for "Overlays" used. "Overlays" are sections that pop up from some pages, like the "Tool" information overlay, the Bio overlays in "Who We are", etc.
* `vars-*`: global variables to configure design-specific aspects of the styles such as colors, fonts, etc.
* `ui-*`: styles used by global UI elements.
* `alt-platforms`: additional style tweaks for specific platforms.
* `animations`: animations referenced globally.
* `mixins`: LESS mixins for more complex CSS compositions.

### Image assets

PNG and SVG images are used. Those are automatically re-compressed when building with [imagemin](https://github.com/imagemin/imagemin). Existing PNGs were also first optimized with [OptiPNG](http://optipng.sourceforge.net/).

### Scripts

All JavaScript source code is located inside the `/src/js` folder.

This project uses ECMAScript 2015 (ES6), so our code is split around different classes and modules and combined into a single JS bundle.

The main files found inside `/src/js` are:

* `app.js`: the main entry point for the application's execution. This loads all the dependencies needed for the application.
* `content.js`: the content loading entry point for the application. Rather than waiting for the whole application to load first, content is loaded in parallel by this minimal bundle. This ensures the application's starting time is as low as possible.
* `ga-*.js`: all Google Analytics scripts used, as separate files to avoid inline scripting as required by [CSP](http://www.html5rocks.com/en/tutorials/security/content-security-policy/).

Once inside `/src/js`, these are the folders used, and their purpose:

* `/actions`: Flux actions used by the application.
* `/components`: React components, used as views for the application.
* `/constants`: Global constants, including some configuration flags.
* `/dispatcher`: Main Flux dispatcher.
* `/routing`: Code responsible for configuring the possible internal URI routes.
* `/stores`: Code related to loading, parsing, validating, and maintaining the main state of the application through a data store, as well as its data models.
* `/vendor`: Context-less code, used to maintain generic pieces of the application's functionality.


After compilation (see more below), JavaScript code is minified with [UglifyJS](https://github.com/mishoo/UglifyJS2) prior to publishing.

## Technologies

The project uses the following technologies:

* [React](http://facebook.github.io/react/) and [Flux](https://facebook.github.io/flux/docs/overview.html) are used as the main application architecture.
* [Babel](https://babeljs.io/) (with [Browserify](http://browserify.org/)) is used to compile the code and transform the ES6 code into its (more widely supported) ES5 equivalent.
* [Core-js](https://github.com/zloirock/core-js) is used to provide shims for compatibility with older browsers that lack certain JavaScript APIs.

## Third-party libraries

The application uses [Google Analytics](http://www.google.com/analytics/) for (anonymous) user tracking. It is currently using a testing ID which should be replaced with a final ID at a later point (see the [the deployment document](DEPLOYING.md) for a full checklist of similar items that need to be updated prior to deployment).

For more information on other libraries used (such as NPM modules), check the [LICENSES](LICENSES.md) file.

## External endpoints

The application uses [Contentful](https://www.contentful.com/)'s [Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/) to get its read-only content statically.

It also uses [Google Forms](https://www.google.com/forms/about/) as a means to save Feedback data.

## Building

The application uses [webpack](https://webpack.github.io/) as a manager for its development and build workflow. This build system compiles all LESS files into CSS files, copies all needed assets into their specific folders (including minifying images), and compiles, merges and minifies all JavaScript files.

To start development, download and install all dependencies using [npm](https://www.npmjs.com/):

```shell
    npm install
```

Then use the `dev` task. This task builds the app, serves it as a local server, and then watches the `src` folder for changes.

```shell
    npm run dev
```

When that task is running, the current build version of the app is served at [http://localhost:8080/index.html](http://localhost:8080/index.html). On every source change, the build is recompiled and reloaded.

Once ready, a final, compressed, production quality version of the website can be built into the `dist` folder:

```shell
    npm run build
```

Check the [testing methods](TESTING.md) for information on how to test the validity of the site's code and data, and the [the deployment document](DEPLOYING.md) for instructions on how to deploy the application.