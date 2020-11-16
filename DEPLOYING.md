# Security Planner: Continuous Integration / Continuous Deployment

As of 02-2020, the Security Planner codebase has been shifted to CI / CD. This means deployment of code to production or staging is now handled via a pipeline monitoring the main repository on GitLab.

Basic workflow:

* All development should be done on a local fork of the main repository
* When ready to push code to staging or production you must create a pull request
* When a PR is approved, the pipeline on GitLab will compile the code and deploy it to the appropriate S3 Bucket (Staging for the stage branch, Production for the master branch)

Note: credentials reuired by the deployment process (e.g. secret key id, secret key, bucket name, bucket regions) are stored in GitLab as environment variables and referened in the local pipeline config (/gitlab-ci.yml)


## Deployment checklist

This section lists the final checklist prior to deploying the Security Planner website to a domain. It lists all host-dependent features (including security features) that have to be enabled.

Notice the website was implemented as generically as possible, without targeting a specific domain name (as one has not yet been picked). Because of this, certain properties of the website have to be updated prior to deployment.

* On the Server
  1. [Set the `X-Frame-Options` header to `deny`](https://developer.mozilla.org/en-US/docs/Web/HTTP/X-Frame-Options). This is done to prevent the website from being embedded inside other sites.
* On the site content (requires [re-building using the command line](DEVELOPMENT.md))
  1. Update the header metadata on index.html and legacy.html for [CSP](http://www.html5rocks.com/en/tutorials/security/content-security-policy/), as the some settings were in place for testing only
     * Remove all `http` URL references
     * Remove the `unsafe-inline` keyword
  2. Update the Google Analytics id with the correct production ID once known
     * In `src/js/ga-legacy.js`
     * In `src/js/ga-main.js`
  3. Update page metadata on `webpack.config.json` to reflect the final website name and URL
     * In the "METADATA" object
* On the content management system
     * For the `Copy` type:
       * Item with id `common-friendly-url`
       * Item with id `sharing-url`

  1. Set the correct URL for social media sharing (`sharing-url` of type `Copy`). This is the URL used when using the social media or email sharing features.
  2. Set the correct URL for printing (`common-friendly-url` of type `Copy`). This is the URL used for display purposes.
  3. Set the correct URL for action plan deeplinking (`action-plan-share-url` of type `Copy`). This URL is used when copying the current Action Plan URL to the keyboard. It should be in the format `http://domain.com/path/?plan=[[hash]]`, where `domain.com` is the new domain used by the website, and `path` (if needed) is the path to the website root; `[[hash]]` is a hard-coded string that is replaced with the list of Action Plan tools.
     * Optionally, user friendly URLs (e.g. `http://domain.com/action-plan/[[hash]]` are possible if [URL rewriting](https://en.wikipedia.org/wiki/Rewrite_engine) is enabled.
* Other requirements
  1. The website should be served through https. All its dependencies are already served through https.
