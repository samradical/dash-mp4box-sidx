const Q = require('bluebird');
const fs = require('fs')
const path = require('path')
const xhr = Q.promisify(require('xhr-request'))
const { compact, xor } = require('lodash')
const spawn = require('child_process').spawnSync
const parseString = Q.promisify(require('xml2js').parseString);

const SIDX = require('./lib/sidx')


module.exports = (mp4s = [], options = {}, mp4BoxOptions = []) => {

  options = Object.assign({}, { distance: 2000, save: __dirname }, options)
  const { distance, save } = options

  /*
  DEFAULT OPTIONS
  */
  if(mp4BoxOptions.length){
    mp4BoxOptions = mp4BoxOptions || [
      '-dash',
      distance,
      '-frag',
      distance,
      '-rap',
      '-frag-rap',
      '-profile',
      'onDemand'
    ]
  }

  return Q.map(mp4s, mp4Path => {

    let { name, dir } = path.parse(mp4Path)
    dir = path.resolve(dir)

    mp4BoxOptions = mp4BoxOptions.concat([
      `-out`,
      path.join(save, name),
      mp4Path
    ])

    //COMMAND
    const child = spawn(`MP4Box`, compact(mp4BoxOptions))

    const stderr = child.stderr.toString('utf-8');
    const stdout = child.stdout.toString('utf-8');

    //DASH FILE
    const dashedMp4Path = path.join(dir, `${name}_dashinit.mp4`)

    return parseString(fs.readFileSync(`${name}.mpd`, "utf-8"))
      .then(mpdData => {

        return new Q((yes, no) => {

          const repesentation = mpdData['MPD']['Period'][0]['AdaptationSet'][0]['Representation'][0];

          const lastByte = parseInt(repesentation['SegmentBase'][0]['$']['indexRange'].split('-')[1], 10)

          const stream = fs.createReadStream(dashedMp4Path, { start: 0, end: lastByte });
          let indexBuffer;
          stream.on('data', (chunk) => {
            indexBuffer = chunk
          });
          stream.on('end', () => {
            yes(Object.assign({}, repesentation["$"], {
              path: dashedMp4Path,
              sidx: SIDX.parseSidx(indexBuffer.buffer)
            }))
          });
        })
      })
  })
}
