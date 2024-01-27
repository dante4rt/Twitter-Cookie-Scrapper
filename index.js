require('colors');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const readlineSync = require('readline-sync');

async function getTwitterCookies() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36'
  );

  const twitterLoginUrl = 'https://twitter.com/i/flow/login';

  const username = readlineSync.question('Enter your Twitter username: '.cyan);
  const password = readlineSync.question('Enter your Twitter password: '.cyan, {
    hideEchoBack: true,
  });

  try {
    console.log('Navigating to Twitter login page...'.cyan);
    await page.goto(twitterLoginUrl, { waitUntil: 'networkidle2' });

    console.log('Entering username...'.cyan);
    await page.waitForSelector('input[name="text"]', { visible: true });
    await page.type('input[name="text"]', username);

    const nextButtonXPath =
      '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div/div/div/div[6]';
    await page.waitForXPath(nextButtonXPath);
    const [nextButton] = await page.$x(nextButtonXPath);
    nextButton && (await nextButton.click());

    console.log('Entering password...'.cyan);
    const passwordInputXPath =
      '//*[@id="layers"]/div/div/div/div/div/div/div[2]/div[2]/div/div/div[2]/div[2]/div[1]/div/div/div[3]/div/label/div';
    await page.waitForXPath(passwordInputXPath);
    const [passwordInput] = await page.$x(passwordInputXPath);
    if (passwordInput) {
      await passwordInput.type(password);
      console.log('Password entered'.green);
    } else {
      throw new Error('Password input not found'.red);
    }

    console.log('Logging in...'.cyan);
    await page.click('div[data-testid="LoginForm_Login_Button"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const cookies = await page.cookies();
    await fs.writeFile(
      'twitter_cookies.json',
      JSON.stringify(cookies, null, 2)
    );
    console.log('Cookies saved successfully.'.green);
  } catch (error) {
    console.error('Error in getting cookies:'.red, error);
  } finally {
    await browser.close();
    console.log('Apps closed.'.cyan);
  }
}

getTwitterCookies();
