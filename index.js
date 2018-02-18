// Browser-based test for recusrive copy over solid space

const deepCopy = require('./src/recurse')


const dom = document

const source = dom.getElementById('from')
const destinsation = dom.getElementById('to')
const button = source = dom.getElementById('go')

go.addEventListener('click', event => {
  const from = source.value
  const to = desination.value
  deepCopy()

})
