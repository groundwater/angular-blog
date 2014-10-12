var express = require('express')
var app     = express()

app.use('/bower_components', express.static(__dirname + '/bower_components'))
app.use('/blog', express.static(__dirname + '/blog'))
app.use(express.static(__dirname + '/app'))
app.use(express.static(__dirname + '/dist'))

var PORT = process.env.PORT || 8080
var HOST = process.env.HOST || 'localhost'

app.listen(PORT, function(){
  console.log('Server listening on http://%s:%s/', HOST, PORT)
})
