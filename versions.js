
module.exports = function(engine) {
  const out = {}
  const versions = require('fs').readFileSync(`./${engine}.versions`).toString().replace(/v/g, '').trim().split('\n')
  const prev = { flagged: { data: '' }, unflagged: { data: '' } }

  function serialize (v, harmony = '') {
    try {
      const data = require(`./results/${engine}/${v}${harmony}.json`)
      return {
        engine: data._engine,
        data: JSON.stringify(data, (k, v) => /^_/.test(k) ? 0 : v)
      }
    }
    catch(e) {}
  }

  let lastMajor

  versions.unshift('nightly')
  versions.forEach((v) => {
    if(!v) return; // ignore empty lines
    const unflagged = serialize(v)
    const cur = {
      unflagged: unflagged,
      flagged: serialize(v, '--harmony') || unflagged
    }

    if (cur.unflagged.data !== prev.unflagged.data || cur.flagged.data !== prev.flagged.data || prev.parent === 'nightly') {
      prev.parent = v
      out[v] = []
    }

    const major = v.replace(/^(0\.\d+|\d+).*/, '$1')
    let latest = false
    if(major !== lastMajor) {
      latest = true
      lastMajor = major
    }

    out[prev.parent].push({
      version: v,
      engine: cur.unflagged.engine,
      // latest: latest
    })
    prev.flagged = cur.flagged
    prev.unflagged = cur.unflagged
  })
  console.log(out)
  return out
}

if (require.main === module) {
  console.log(JSON.stringify(module.exports(process.argv[2] || 'v8'), null, 2))
}
