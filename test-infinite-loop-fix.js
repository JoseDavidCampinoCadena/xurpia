const puppeteer = require('puppeteer');
async function testInfiniteLoopFix() {
  console.log('🔄 Testing infinite loop fix...');
  
  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const consoleMessages = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
      if (msg.text().includes('Maximum update depth exceeded')) {
        console.error('❌ Infinite loop detected!');
      }
    });
    console.log('📍 Navigating to tasks page...');
    await page.goto('http://localhost:3000/home/tasks', { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });

    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`📄 Page title: ${title}`);
    
    const hasInfiniteLoopError = consoleMessages.some(msg => 
      msg.includes('Maximum update depth exceeded') || 
      msg.includes('Too many re-renders')
    );
    
    if (hasInfiniteLoopError) {
      console.error('❌ Infinite loop detected in console messages!');
      console.error('Console messages:', consoleMessages);
    } else {
      console.log('✅ No infinite loop errors detected!');
    }
    
    await browser.close();
    
    return !hasInfiniteLoopError;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

testInfiniteLoopFix().then(success => {
  if (success) {
    console.log('🎉 Infinite loop fix test PASSED!');
  } else {
    console.log('💥 Infinite loop fix test FAILED!');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test script error:', error);
  process.exit(1);
});
