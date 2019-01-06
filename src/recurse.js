// recursive copy Solid folders

// Just copy raw files, or parse and optinally transform RDF?
// Check whether destination directories exist first?
// Sync things in both directions?
// Use hashes from server to check identical trees?
// See all the options on rsync, unison, etc etc!!

const $rdf = require('rdflib')

const ldp = $rdf.Namespace('http://www.w3.org/ns/ldp#')
const RDF = $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')

const kb = $rdf.graph()
const fetcher = $rdf.fetcher(kb)

module.export = {
  deepCopy
}


function deepCopy(src, dest, options, indent = ''){
  options = options || {}
  console.log(indent + 'deepCopy ' + src + ' -> ' + dest)
  return new Promise(function(resolve, reject){
    function mapURI(src, dest, x){
      if (!x.uri.startsWith(src.uri)){
        throw new Error('source {x} is not in tree {src}')
      }
      return kb.sym(dest.uri + x.uri.slice(src.uri.length))
    }
    console.log(indent + ' deepCopy ' + src + ' -> ' + dest)
    fetcher.load(src).then(function(response) {
      console.log(indent + '  ok = ' + response.status)
      if (!response.ok) throw new Error('Error reading container ' + src + ' : ' + response.status)
      let contents = kb.each(src, ldp('contains'))
      promises = []
      for (let i=0; i < contents.length; i++){
        let here = contents[i]
        let there = mapURI(src, dest, here)
        if (kb.holds(here, RDF('type'), ldp('Container'))){
          promises.push(deepCopy(here, there, options, indent + '  '))
        } else { // copy a leaf
          promises.push(fetcher.webCopy(here, there))
        }
      }
      Promise.all(promises).then(resolve(true)).catch(function (e) {
        console.log("Overall promise rejected: " + e)
        reject(e)
      })
    })
    .catch(error => {
      console.log('Load error: ' + error)
    })
  })
}

// TEST ONLY

var source = kb.sym('https://timbl.com/timbl/Public/Test/')
var destination = kb.sym('https://timbl.databox.me/Public/Test/')

deepCopy(source, destination).then(function(){
  console.log("Test Finished.")
}).catch( function (e) {
  console.log("Failed: e")
})

// wit for end
//
