import { CdpAction, CdpActionResult } from "@/agentkit/actions/cdp_action";
import { Wallet } from "@coinbase/coinbase-sdk";
import { WOW_FACTORY_ABI, GENERIC_TOKEN_METADATA_URI, getFactoryAddress } from "../constants";
import { z } from "zod";

const WOW_CREATE_TOKEN_PROMPT = `
This tool can only be used to create a Zora Wow ERC20 memecoin (also can be referred to as a bonding curve token) using the WoW factory.
Do not use this tool for any other purpose, or for creating other types of tokens.

Inputs:
- Token name (e.g. WowCoin)
- Token symbol (e.g. WOW) 
- Token URI (optional) - Contains metadata about the token

Important notes:
- Uses a bonding curve - no upfront liquidity needed
- Only supported on the following networks:
  - Base Sepolia (ie, 'base-sepolia')
  - Base Mainnet (ie, 'base', 'base-mainnnet')
`;

/**
 * Input schema for create token action.
 */
export const WowCreateTokenInput = z
  .object({
    name: z.string().describe("The name of the token to create, e.g. WowCoin"),
    symbol: z.string().describe("The symbol of the token to create, e.g. WOW"),
    tokenUri: z
      .string()
      .optional()
      .describe(
        "The URI of the token metadata to store on IPFS, e.g. ipfs://QmY1GqprFYvojCcUEKgqHeDj9uhZD9jmYGrQTfA9vAE78J",
      ),
  })
  .strip()
  .describe("Instructions for creating a WOW token");

type WowCreateTokenResultBody = {
  transactionHash: string;
};

/**
 * Creates a Zora Wow ERC20 memecoin.
 *
 * @param wallet - The wallet to create the token from.
 * @param args - The input arguments for the action.
 * @returns A message containing the token creation details.
 */
export async function wowCreateToken(
  wallet: Wallet,
  args: z.infer<typeof WowCreateTokenInput>,
): Promise<CdpActionResult<WowCreateTokenResultBody>> {
  const factoryAddress = getFactoryAddress(wallet.getNetworkId());

  try {
    const invocation = await wallet.invokeContract({
      contractAddress: factoryAddress,
      method: "deploy",
      abi: WOW_FACTORY_ABI,
      args: {
        _tokenCreator: (await wallet.getDefaultAddress()).getId(),
        _platformReferrer: "0x0000000000000000000000000000000000000000",
        _tokenURI: args.tokenUri || GENERIC_TOKEN_METADATA_URI,
        _name: args.name,
        _symbol: args.symbol,
      },
    });

    const result = await invocation.wait();

    const transactionHash = result.getTransaction().getTransactionHash();

    if (!transactionHash) {
      throw new Error("Could not get transaction hash"); 
    }

    return {
      message: `Created WoW ERC20 memecoin ${args.name} with symbol ${args.symbol} on network ${wallet.getNetworkId()}.\nTransaction hash for the token creation: ${transactionHash}`,
      body: {
        transactionHash,
      },
    };
  } catch (error) {
    return {
      message: `Error creating Zora Wow ERC20 memecoin: ${error}`,
    };
  }
}

/**
 * Zora Wow create token action.
 */
export class WowCreateTokenAction implements CdpAction<typeof WowCreateTokenInput, WowCreateTokenResultBody> {
  public name = "wow_create_token";
  public description = WOW_CREATE_TOKEN_PROMPT;
  public argsSchema = WowCreateTokenInput;
  public func = wowCreateToken;
}