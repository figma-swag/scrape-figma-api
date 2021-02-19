import puppeteer from "puppeteer";

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.figma.com/developers/api");
  await page.screenshot({ path: "example.png" });

  await browser.close();
}

main();
