import { readFileSync, writeFileSync } from "fs";
import { formatUnits } from "ethers/lib/utils";

let md = `
# Bribe Data

Total Eligible Address: %0

|Address|USDC|
|---|---|
`

function main() {
  const data: {
    [key: string]: {
      usdc: string,
      node: string,
      index: number,
      proof: string[]
    }
  } = JSON.parse(readFileSync(`output/list.json`).toString());
  const keys = Object.keys(data);
  md = md.replace("%0", String(keys.length));
  for (let addr of keys) {
    md += `|${addr}|${formatUnits(data[addr].usdc, "6")}|\n`;
  }
  writeFileSync(`output/bribe.md`, md);
}

main();
