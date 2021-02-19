import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.figma.com/developers/api");
  const content = await page.content();
  console.log(content);

  await browser.close();
}

main();
