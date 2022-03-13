import { readFileSync, writeFileSync } from "fs";
import { formatUnits } from "ethers/lib/utils";
import { totalBribe } from "./common";

let md = `
# Bribe Data

Total Eligible Address: %0

Total USDC for bribe: %1

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
  md = md.replace("%0", String(keys.length)).replace("%1", formatUnits(totalBribe, "6"));
  for (let addr of keys) {
    md += `|${addr}|${formatUnits(data[addr].usdc, "6")}|\n`;
  }
  writeFileSync(`output/bribe.md`, md);
}

main();
