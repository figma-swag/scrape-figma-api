import puppeteer from "puppeteer";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";

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

/**
 * What Figma Types might we have?
 *
 * String | Number | Boolean | Record | Enum
 *
 * What does a Record look like?
 *
 * {
 *   name: String
 *   type: "Record"
 *   fields: Figma Type[]
 * }
 */

interface BaseFigmaType {
  name: string;
  type: string;
}

interface StringType extends BaseFigmaType {
  type: "String";
}

interface NumberType extends BaseFigmaType {
  type: "Number";
}

interface BooleanType extends BaseFigmaType {
  type: "Boolean";
}

interface EnumType extends BaseFigmaType {
  type: "Enum";
  values: string[];
}

interface RecordType extends BaseFigmaType {
  type: "Record";
  fields: FigmaType[];
}

interface ArrayType extends BaseFigmaType {
  type: "Array";
  values: FigmaType;
}

interface MapType extends BaseFigmaType {
  type: "Map";
  keyType: FigmaType;
  valueType: FigmaType;
}

type FigmaType =
  | StringType
  | NumberType
  | BooleanType
  | EnumType
  | RecordType
  | ArrayType
  | MapType;

/**
 * Values for "tokens". These are for the intermediate steps
 * between parsing our input and creating our types
 */
// just a single token

interface BaseToken {
  type: string;
  name: string;
}

interface UnitToken extends BaseToken {
  type: "unit";
  valueType: string;
}

interface ArrayToken extends BaseToken {
  type: "array";
  valueType: string;
}

interface EnumToken extends BaseToken {
  type: "enum";
  valueTypes: string[];
}

interface MapToken extends BaseToken {
  type: "map";
  keyType: string;
  valueType: string;
}

type Token = UnitToken | ArrayToken | EnumToken | MapToken;

/**
 * Functions to extract a type from a table of type data
 */

async function getTypeName(column: puppeteer.ElementHandle): Promise<string> {
  return column.evaluate((elem) => elem.querySelector("span").innerText);
}

async function getFields(column: puppeteer.ElementHandle): Promise<Token[]> {
  const fields = await column.$$('[class*="propField"');
  const tokens: Token[] = [];
  for await (const field of fields) {
    const token = await parseField(field);
    if (token) {
      tokens.push(token);
    }
  }
  return tokens;
}

async function parseField(
  field: puppeteer.ElementHandle
): Promise<Token | null> {
  // attempt to get normally-defined fields
  const valueNameHandle = await field.$('[class*="monoDisplay"]');
  if (valueNameHandle) {
    const valueName = await valueNameHandle.evaluate((elem) => elem.innerText);
    const type = await valueNameHandle.evaluate(
      (elem) => elem.nextElementSibling.innerText
    );
    if (type.includes("[]")) {
      return {
        type: "array",
        valueType: type,
        name: valueName,
      };
    } else if (type.includes("|")) {
      const values = type.split(" | ");
      return {
        type: "enum",
        valueTypes: values,
        name: valueName,
      };
    } else if (/Map<(.*), ?(.*)>/.exec(type)) {
      // const values = type.split(/(Map\<)|(\,)|(\>)/);
      const [, key, val] = /Map<(.*), ?(.*)>/.exec(type);
      return {
        type: "map",
        keyType: key,
        valueType: val,
        name: valueName,
      };
    } else {
      return {
        type: "unit",
        name: valueName,
        valueType: type,
      };
    }
  }
  return null;
}

export async function extractTypeFromTable(
  page: puppeteer.Page,
  elem: puppeteer.ElementHandle
) {
  // Step 1: Tokenize our Rows
  const tokenMap = new Map<string, Token[]>();
  const rows = await elem.$$("tbody > tr");
  for await (const row of rows) {
    const columns = await row.$$("td");
    const name = await getTypeName(columns[0]);
    const tokens = await getFields(columns[1]);
    tokenMap.set(name, tokens);
  }
  console.log(tokenMap);
}
