var Metalsmith = require('metalsmith')
var postcss = require('metalsmith-with-postcss')
var concat = require('metalsmith-concat')
var layouts = require('metalsmith-layouts')
var markdown = require('metalsmith-markdown')
var permalinks = require('metalsmith-permalinks')

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
      'precss': {},
      'lost': {},
      'postcss-typography': {
        headerFontFamily: ['Unna', 'serif'],
        headerWeight: '400',
        bodyFontFamily: ['Arimo', 'Helvetica', 'Arial', 'sans-serif'],
        scaleRatio: 3.75,
        blockMarginBottom: 1/2,
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
      'autoprefixer': {}
    }
  }))
  // Concat all our CSS into one big file
  .use(concat({
    files: [
      'styles/base/**.css',
      'styles/src/*.css'
    ],
    output: 'styles.css'
  }))
  // Transpile markdown to HTML
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
