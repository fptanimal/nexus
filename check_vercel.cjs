const https = require('https');
https.get('https://nexus-omega-khaki.vercel.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const jsUrl = data.match(/src="\/assets\/index-([^"]+)\.js"/);
    if (jsUrl) {
      https.get('https://nexus-omega-khaki.vercel.app/assets/index-' + jsUrl[1] + '.js', (res) => {
        let jsData = '';
        res.on('data', chunk => jsData += chunk);
        res.on('end', () => {
          console.log('Contains doctor_sprite.png?', jsData.includes('doctor_sprite.png'));
        });
      });
    } else {
      console.log('No JS');
    }
  });
});
