var childProcess = require('child_process')
var connectLivereload = require('connect-livereload')
var express = require('express')
var tinylr = require('tiny-lr')
var watch = require('watch')

const watchPaths = [
  __dirname + '/index.js',
  __dirname + '/layouts',
  __dirname + '/src',
]
const livereloadPort = 35729

/**
 * Start the development server
 */
var app = express()
app.use(connectLivereload({ port: livereloadPort }))
app.use(express.static('build'))
app.listen(3000, function () {
  console.log('Development server started at http://0.0.0.0:3000')
})

/**
 * Start the live reload server
 */

// standard LiveReload port
const livereloadServer = tinylr()
livereloadServer.listen(livereloadPort, function() {
  console.log('Live reload server listening on %s ...', livereloadPort);
})

/**
 * Run the build command when any files change
 */
var building = false
var buildWebsite = function buildWebsite (file) {
  if (building) return
  building = true
  console.log('Rebuilding...')
  childProcess.exec('npm run build', { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) {
      console.log('Error while building:\n' + err)
    } else {
      livereloadServer.changed({ body: { files: [ file ] } })
      console.log('Done building!')
    }

    console.log('###\nListening...')
    building = false
  })
}
var shouldWatchFile = function shouldWatchFile (file) {
  var matches = false
  for (var i = 0; i < watchPaths.length; i++) {
    if (file.startsWith(watchPaths[i])) matches = true
  }
  return matches
}
var options = {
  filter: shouldWatchFile,
  interval: 0.25
}
watch.watchTree(__dirname, options, buildWebsite)
