import puppeteer from "puppeteer";
import { getSiblings, extractTypeFromTable } from "./util";

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
    if (
      html.includes("types") ||
      html.includes("Types") ||
      html.includes("Global properties")
    ) {
      typeSectionHeadings.push(content);
    }
  }

  // let's get all the elements in a heading section. Might be worth breaking
  const typeTables: puppeteer.ElementHandle[] = [];
  for await (const heading of typeSectionHeadings) {
    const siblings = await getSiblings(page, heading);
    // console.log(siblings.length);

    // as far as I can tell, the table is always the last sibling, so we're
    // going to roll with that for now
    const table = await siblings[siblings.length - 1].$("table");
    typeTables.push(table);
  }

  for await (const table of typeTables) {
    await extractTypeFromTable(page, table);
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
