var Metalsmith = require('metalsmith')
var handlebars = require('handlebars')
var postcss = require('metalsmith-with-postcss')
var layouts = require('metalsmith-layouts')
var hbtmd = require('metalsmith-hbt-md')
var markdown = require('metalsmith-markdown')
var favicons = require('metalsmith-favicons')
var twitterCard = require('metalsmith-twitter-card')
var permalinks = require('metalsmith-permalinks')
var picsetGenerate = require('metalsmith-picset-generate')
var picsetHandlearsHelper = require('metalsmith-picset-handlebars-helper')
var s3 = require('metalsmith-s3')
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
  // Process our CSS using PostCSS with a few plugins
  .use(postcss({
    plugins: {
      'postcss-import': {
        root: __dirname + '/src/styles/styles.css'
      },
      'lost': {},
      'postcss-typography': {
        baseFontSize: '20px',
        baseLineHeight: 1.8,
        headerFontFamily: ['Unna', 'serif'],
        headerWeight: '400',
        bodyFontFamily: ['Arimo', 'Helvetica', 'Arial', 'sans-serif'],
        scaleRatio: 3,
        blockMarginBottom: 1/4,
        includeNormalize: false
      },
      'postcss-font-magician': {
        variants: {
          'Unna': {
            '400': []
          },
          'Arimo': {
            '400': [],
            '700': []
          }
        },
        foundries: ['google']
      },
      'postcss-cssnext': {},
      'cssnano': {}
    }
  }))
  // Generate and use the picsets
  .use(picsetGenerate())
  .use(picsetHandlearsHelper())
  // Transpile markdown to HTML with handlebars support
  .use(hbtmd(handlebars, {
        pattern: '**/*.md'
    }))
  .use(markdown())
  // Generate our favicons
  .use(favicons({
    src: '**/logo.jpg',
    dest: 'favicons/',
    appName: websiteName,
    appDescription: websiteDescription,
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
