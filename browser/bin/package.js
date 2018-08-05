const Zip = require('node-zip')
const files = ['index.js', 'manifest.json']
const fs = require('fs')
const path = require('path')

const zip = new Zip()

// Dummy, just compress the files, no control at all;
files.forEach(file => {
  zip.file(file, fs.readFileSync(path.join(__dirname, '..', file), 'utf8'))
})

const data = zip.generate({ base64:false, compression:'DEFLATE' })
fs.writeFileSync(path.join(__dirname, '..', 'probot-ui.zip'), data, 'binary')
console.log('📦 Your package has been delivered!')
