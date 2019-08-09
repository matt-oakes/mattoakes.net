var fs = require('fs');
var _ = require('lodash');
var Metalsmith = require('metalsmith')
var fingerprint = require('metalsmith-fingerprint')
var postcss = require('metalsmith-with-postcss')
var layouts = require('metalsmith-layouts')
var collections = require('metalsmith-collections')
var archive = require('metalsmith-archive')
var discoverPartials = require('metalsmith-discover-partials')
var discoverHelpers = require('metalsmith-discover-helpers')
var inPlace = require('metalsmith-in-place')
var favicons = require('metalsmith-favicons')
var twitterCard = require('metalsmith-twitter-card')
var permalinks = require('metalsmith-permalinks')
var redirect = require('metalsmith-redirect')
var picsetGenerate = require('metalsmith-picset-generate')
var picsetHandlearsHelper = require('metalsmith-picset-handlebars-helper')
var htmlMinifier = require("metalsmith-html-minifier")
var sitemap = require('metalsmith-sitemap')
var s3 = require('./s3')
var cloudfront = require('metalsmith-cloudfront')

if (process.argv.length !== 3) {
  console.error('Error: You must provide an action. One of "build" or "deploy".')
  process.exit(-1)
}

// Load the .env variables
require('dotenv').config()

const websiteName = 'Matt Oakes'
const websiteDescription = 'Matt Oakes a mobile app developer in Brighton who helps companies with their mobile strategy and develops Android, iOS & React Native apps.'
const websiteUrl = 'https://mattoakes.net/'
const websiteUrlNoProtocol = 'mattoakes.net'
const redirects = {
  "/react-native/": "/guides/react-native/",
  "/native-development/": "/guides/native-development/",
  "/go-mobile/": "/services/go-mobile/",
  "/improve-your-mobile-app/": "/services/improve-your-mobile-app/",
  "/what-information-do-i-need-to-submit-to-the-amazon-app-store-b515bb4d32ee": "/guides/what-information-is-needed-for-an-amazon-app-store-listing/",
  "/what-information-do-i-need-to-submit-to-the-google-play-store-5f261870bab0": "/guides/what-information-is-needed-for-a-google-play-store-listing/",
  "/what-information-do-i-need-to-submit-to-the-apple-app-store-a33ecc38a5ca": "/guides/what-information-is-needed-for-an-apple-app-store-listing/",
  "/mobile-web-or-mobile-app-fdf96460264f": "/guides/mobile-web-or-mobile-app/",
  "/a-better-way-to-automatically-merge-changes-in-your-xcode-project-files-3d83b3583fe4": "https://medium.com/@mattoakes/a-better-way-to-automatically-merge-changes-in-your-xcode-project-files-3d83b3583fe4"
};
const redirectedPaths = Object.keys(redirects);

// Configure the website build process using Metalsmith
const website = Metalsmith(__dirname)
  // Website metadata
  .metadata({
    sitename: websiteName,
    siteurl: websiteUrl,
    description: websiteDescription
  })
  // Set the source and destinatation folders
  .source('./src')
  .destination('./build')
  // Ensure we clean before building
  .clean(true)
  // Add some redirects for old page paths
  .use(redirect(redirects))
  // Process our CSS using PostCSS with a few plugins
  .use(postcss({
    plugins: {
      'postcss-import': {
        root: __dirname + '/src/styles/styles.css'
      },
      'lost': {},
      'postcss-typography': {
        baseFontSize: '22px',
        baseLineHeight: 1.8,
        headerFontFamily: ['Alegreya', 'serif'],
        headerWeight: '400',
        bodyFontFamily: ['"Alegreya Sans"', 'Helvetica', 'Arial', 'sans-serif'],
        scaleRatio: 3,
        blockMarginBottom: 1/4,
        includeNormalize: false
      },
      'postcss-font-magician': {
        variants: {
          'Alegreya': {
            '400': []
          },
          'Alegreya Sans': {
            '400': [],
            '500': [],
            '700': []
          }
        },
        foundries: ['google']
      },
      'postcss-cssnext': {},
      'cssnano': {}
    },
    map: false
  }))
  // Generate and use the picsets
  .use(picsetGenerate())
  .use(picsetHandlearsHelper())
  // Fingerprint our CSS and images
  .use(fingerprint({
    pattern: [
      'styles/styles.css',
      'img/**/*'
    ]
  }))
  // Register the partials
  .use(function (files, metalsmith, done) {
    fs.readdir(metalsmith.path("partials"), function(err, files) {
      if (err) throw err;

      files.forEach(function(file){
        var templateName = file.split('.').shift();
        var path = metalsmith.path("partials", file)
        var partialContents = fs.readFileSync(path).toString('utf8');
        require('handlebars').registerPartial(templateName, partialContents);
      });

      done();
    });
  })
  // Setup a handlbars helper to modify the picset html
  .use(function (files, metalsmith, done) {
    var imageRegex = /img\/picset\/.*?\.(jpg|png|webp)/g
    require('handlebars').registerHelper('fingerprint-picset', (html) => {
      return html.replace(imageRegex, (match) => metalsmith.metadata().fingerprint[match])
    })
    return process.nextTick(done)
  })
  // Add a handlebars helper to map a collection for the index
  .use(function (files, metalsmith, done) {
    var paragraphRegex = /<p>(.*)<\/p>/
    function getFirstParagraph(html) {
      var match = paragraphRegex.exec(html);
      return match.length > 1 ? match[1].replace(/<(?:.|\n)*?>/gm, '') : "";
    }

    require('handlebars').registerHelper('map-collection', (collection) => {
      return _.chain(collection)
        .map(item => ({
          title: item.collectionTitle || item.title,
          brief: getFirstParagraph(item.contents.toString("utf8")),
          url: "/" + (item.path.endsWith(".hbs") ? item.path.slice(0, -4) + "/" : item.path)
        }))
        .sortBy("title")
        .value();
    })
    return process.nextTick(done)
  })
  // Setup the collections
  .use(collections({
    guides: {
      refer: false
    }
  }))
  .use(archive({
    collections: ["guides", "training"]
  }))
  // Transform templates in place
  .use(inPlace({ pattern: "**/*" }))
  // Generate our favicons
  .use(favicons({
    src: '**/logo.jpg',
    dest: 'favicons/',
    appName: websiteName,
    appDescription: websiteDescription,
    background: '#c09859',
    icons: {
      android: true,
      appleIcon: true,
      favicons: true,
      firefox: true
    }
  }))
  // Change URLs to permalinks
  .use(permalinks({
    relative: false
  }))
  // Wrap layouts around HTML pages
  .use(layouts({
    engine: 'handlebars'
  }))
  // Add in Twitter cards. These can be overridden in each page
  .use(twitterCard({
    siteurl: websiteUrlNoProtocol,
    card: 'summary',
    site: '@mattdoesmobile',
    title: websiteName,
    description: websiteDescription
  }))
  .use(htmlMinifier())
  .use(sitemap({
    hostname: websiteUrl,
    omitIndex: true,
    pattern: ['**/*.html', ...redirectedPaths.map(path => `!**${path}/*`)]
  }))

// Perform the final actions depending on what action has been asked for
switch (process.argv[2]) {
  // Build the website once and then exit
  case 'build':
    website
      .build(function(err) {
        if (err) throw err;
      })
    break
  // Build the website and then deploy it
  case 'deploy':
    website
      .use(s3({
        action: 'write',
        bucket: process.env.AWS_S3_BUCKET
      }))
      .use(cloudfront({
        dist: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID,
        paths: [
          '/*'
        ]
      }))
      .build(function(err) {
        if (err) throw err;
      })
    break
  // An invalid action was chosen. Error!
  default:
    console.error('Error: You must provide an action. One of "develop", "build" or "deploy".')
    process.exit(-1)
}
