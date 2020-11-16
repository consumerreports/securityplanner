# Security Planner

This is the source for the "Security Planner" web tool.

## Folder locations

* `/dist`: (optional) a temporary production build of the project, with all assets minified. This is where the compiled version of the application goes after it is built (see [DEVELOPMENT](DEVELOPMENT.MD) for more details).
* `/build-staging`: files used in the temporary staging location. This should be gone soon.
* `/src`: all source files, including assets.
  * `/fonts`: all locally-hosted fonts used in the project (see [LICENSES](LICENSES.md) for the list of font licenses employed).
  * `/html`: all static HTML files used.
  * `/images`: all images used, separated by context. Most of the images used in the website come from the CMS (and its own CDN), but all other globally available user interface images are located here.
  * `/js`: all JavaScript code used (see [DEVELOPMENT](DEVELOPMENT.md) for more information).
  * `/less`: all source stylesheets, used to create the CSS used for the application (see [DEVELOPMENT](DEVELOPMENT.md) for more information).

## Branches

The **master** branch is reserved for stable versions. All the work is currently being performed in the **dev** branch, and merged as appropriate.

## Development

The [development](DEVELOPMENT.md) document contains instructions on the technology used to build the website, as well as how to build it yourself.

## Testing

Check [the testing strategy documentation](TESTING.md) for information on how to check the project's data and code validity.

## Deployment

Please check [the deployment document](DEPLOYING.md) for instructions on how to deploy the application, and a list of items to be addressed prior to doing so.

## Content editing

See the [Security Planner Wiki](https://github.com/workco/archive-google-ideas-2015/wiki) for an explanation on how to edit, test, preview, and publish content for Security Planner.
