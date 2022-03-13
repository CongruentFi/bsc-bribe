// remove multisig from total supply
import { parseUnits } from "ethers/lib/utils";

export const metamTotalSupply = parseUnits("595170.937195", "gwei").sub(parseUnits("134927.522259159", "gwei"));
export const totalBribe = parseUnits("83000", "6");
