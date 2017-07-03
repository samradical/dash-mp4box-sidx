# DASH MP4 files with MP4Box

Extract the SIDX manifest after.

Expects MP4 to be installed. See [here](https://gpac.wp.imt.fr/2015/07/29/gpac-build-mp4box-only-all-platforms/)

## Example.js

### options

```
{ distance: 2000, save: __dirname }

```

You can pass a full MP4Box command in 3rd peram

```
const Dash = require('./index')
Dash(['video.mp4'],{distance: 2000}, ['-frag'...]).then(d => {
  console.log(d);
})

```

