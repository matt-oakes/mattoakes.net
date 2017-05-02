var Metalsmith = require('metalsmith')
var handlebars = require('handlebars')
var postcss = require('metalsmith-with-postcss')
var layouts = require('metalsmith-layouts')
var hbtmd = require('metalsmith-hbt-md')
var markdown = require('metalsmith-markdown')
var permalinks = require('metalsmith-permalinks')
var picsetGenerate = require('metalsmith-picset-generate')
var picsetHandlearsHelper = require('metalsmith-picset-handlebars-helper')

if (process.argv.length !== 3) {
  console.error('Error: You must provide an action. One of "build" or "deploy".')
  process.exit(-1)
}

// Configure the website build process using Metalsmith
const website = Metalsmith(__dirname)
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
  // Change URLs to permalinks
  .use(permalinks({
    relative: false
  }))
  // Wrap layouts around HTML pages
  .use(layouts({
    engine: 'handlebars'
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
    // TODO: Deploy to S3
    console.error('Error: "deploy" action is not currently implemented.')
    process.exit(-1)
    break
  // An invalid action was chosen. Error!
  default:
    console.error('Error: You must provide an action. One of "develop", "build" or "deploy".')
    process.exit(-1)
}
