const https = require('https');
https.get('https://nexus-omega-khaki.vercel.app/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const jsUrl = data.match(/src="\/assets\/index-([^"]+)\.js"/);
        if (jsUrl) {
            console.log('Found JS file:', jsUrl[1]);
            https.get('https://nexus-omega-khaki.vercel.app/assets/index-' + jsUrl[1] + '.js', (res) => {
                let jsData = '';
                res.on('data', chunk => jsData += chunk);
                res.on('end', () => {
                    console.log('Contains new code?', jsData.includes('Màu áo xám giống nhân vật'));
                    console.log('Contains old desk?', jsData.includes('#b46329'));
                });
            });
        } else {
            console.log('No JS found in HTML');
        }
    });
});
