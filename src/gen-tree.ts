import { readFileSync, writeFileSync } from "fs";
import { BytesLike, ethers } from "ethers";
import { keccak256, parseUnits, solidityKeccak256 } from "ethers/lib/utils";
import { MerkleTree } from "merkletreejs";

// remove multisig from total supply
const metamTotalSupply = parseUnits("595170.937195", "gwei").sub(parseUnits("134927.522259159", "gwei"));
const totalBribe = parseUnits("42499", "6");

const ethSha3 = (data: BytesLike) => {
  return keccak256(data).slice(2);
}

async function main() {
  const addresses: { [key: string]: string } = {};
  for (let file of ["gaas", "sgaas", "wsgaas"]) {
    readFileSync(`res/${file}.csv`).toString().split(/\r\n/g).forEach(line => {
      const addr = line.split(/,/g)[0].replace(/"/g, "");
      if (ethers.utils.isAddress(addr)) {
        addresses[addr] = "";
      }
    });
  }
  const bribe: {
    [key: string]: {
      usdc: string,
      node: string,
      index: number,
      proof: string[]
    }
  } = {};
  let index = 0;
  const input: string[] = [];
  readFileSync(`res/metam.csv`).toString().split(/\r\n/g).forEach(l => {
    const [addr, balance] = l.replace(/"/g, "").split(/,/g);
    if (addresses[addr] !== undefined) {
      const usdc = totalBribe.mul(parseUnits(balance, "gwei")).div(metamTotalSupply).toString();
      const node = solidityKeccak256(["uint", "address", "uint"], [index, addr, usdc]);
      bribe[addr] = {
        usdc,
        node,
        index,
        proof: []
      };
      index++;
      input.push(node);
    }
  });
  const total = Object.keys(bribe).length;
  console.log(`Total Eligible Addresses: ${total}`);
  writeFileSync(`output/list.json`, JSON.stringify(bribe, null, 2));

  const tree = new MerkleTree(input, ethSha3, { sortPairs: true });
  const root = tree.getHexRoot();
  console.log(`Merkle Root: ${root}`);
  writeFileSync(`output/root.txt`, root);

  process.stdout.write(`Generating Merkle Proof`);
  let sum = 0;
  for (let addr of Object.keys(bribe)) {
    bribe[addr].proof = tree.getHexProof(bribe[addr].node);
    sum++;
    if (sum % 100 == 0) {
      process.stdout.write(`\rGenerating Merkle Proof [${sum}/${total}] ...`);
    }
  }
  console.log();
  writeFileSync(`output/proof.json`, JSON.stringify(bribe, null, 2));
  console.log(`Done.`);
}
main().catch(e => console.error(e));
