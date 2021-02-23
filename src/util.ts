import puppeteer from "puppeteer";

/**
 * A function to get all of the siblings to an element
 */
export async function getSiblings(
  page: puppeteer.Page,
  elem: puppeteer.ElementHandle
): Promise<puppeteer.ElementHandle[]> {
  const siblings: puppeteer.ElementHandle[] = [];
  let cur = elem;
  let curElement = await cur.evaluate((elem) => elem);
  while (curElement !== null) {
    siblings.push(cur);
    cur = await page.evaluateHandle((elem) => elem.nextElementSibling, cur);
    curElement = await cur.evaluate((elem) => elem);
  }
  return siblings;
}
