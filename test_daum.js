const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    // Find Chrome
    const execPath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
    if (!fs.existsSync(execPath)) {
        console.log('Chrome not found');
        return;
    }
    
    const browser = await puppeteer.launch({
        executablePath: execPath,
        headless: "new"
    });
    
    const page = await browser.newPage();
    
    // Catch console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    // Open the local file
    const fileUrl = 'file:///Users/mac/Downloads/표지생성기_개발과정/표지내지견적및 주문생성기/index.html';
    await page.goto(fileUrl, { waitUntil: 'networkidle0' });
    
    // Click openPostcode button
    console.log('Clicking search button...');
    await page.evaluate(() => {
        openPostcode();
    });
    
    await new Promise(r => setTimeout(r, 2000));
    console.log('Done');
    await browser.close();
})();
