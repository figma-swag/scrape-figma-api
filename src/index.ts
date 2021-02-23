import puppeteer from "puppeteer";
import { getSiblings } from "./util";

async function parse(page: puppeteer.Page) {
  const contents = await page.$$("[class*=developer_docs--subsectionHeader");

  const typeSectionHeadings: puppeteer.ElementHandle[] = [];

  /**
   * @TODO This could probably be sped-up using Promise.all. Keeping it
   * like this for momentary convencience!
   *
   * ~reccanti 2/23/2021
   */
  for await (const content of contents) {
    const html: string = await content.evaluate((elem) => elem.innerHTML);
    if (html.includes("types") || html.includes("Types")) {
      typeSectionHeadings.push(content);
    }
  }

  // let's get all the elements in a heading section. Might be worth breaking
  for await (const heading of typeSectionHeadings) {
    const siblings = await getSiblings(page, heading);
    console.log(siblings.length);
  }
}

async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.figma.com/developers/api");

  await parse(page);
  // const content = await page.content();
  // console.log(content);

  await browser.close();
}

main();
