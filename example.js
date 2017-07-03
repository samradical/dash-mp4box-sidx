const Dash = require('./index')

Dash(['video.mp4'],{distance: 2000}).then(d => {
  console.log(d);
})
