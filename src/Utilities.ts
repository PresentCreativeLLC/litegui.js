const puppeteer = require('puppeteer');

export async function takeScreenshot(file: string, downloadPath: string)
{
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(file);
  await page.screenshot({path: downloadPath, fullPage: true});
  await page.close();
  await browser.close();
}