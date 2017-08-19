// recursive copy Solid folders

// Just copy raw files, or parse and optinally transform RDF?
// Check whether destination directories exist first?
// Sync things in both directions?
// Use hashes from server to check identical trees?
// See all the options on rsync, unison, etc etc!!

const $rdf = require('rdflib')

const ldp = $rdf.Namespace('http://www.w3.org/ns/ldp#')

const kb = $rdf.graph()
const fetcher = $rdf.fetcher(kb)

module.export = {
  deepCopy
}


function deepCopy(src, dest, options, indent = ''){
  return new Promise(function(resolve, reject){
    function mapURI(src, dest, x){
      if (!x.uri.startsWith(src.uri)){
        throw new Error('source {x} is not in tree {src}')
      }
      return kb.sym(dest.uri + x.uri.slice(src.uri.length))
    }
    fetcher.load(src).then(ok, status, response => {
      if (!ok) throw new Error("Error reading container {src}: {status}")
      let contents = kb.each(src, ldp('contains'))
      level += 1
      promises = []
      for (let i=0; i < contents.length; i++){
        let here = contents[i]
        let there = mapURI(here)
        if (kb.holds(here, rdf(type), ldp('Container'))){
          promises.push(deepCopy(here, mapURI(here), options, indent + '  '))
        } else { // copy a leaf
          promises.push(fetcher.webCopy(here))
        }
      }
      Promise.all(promises).then(resolve(true))
    })
  })
}
