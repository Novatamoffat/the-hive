"use client"

import { useState } from "react";

import { StakeArgumentsType } from "@/agentkit/actions/solana/types";
import { useChat } from "../../_contexts/chat";
import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { VersionedTransaction } from "@solana/web3.js";
import { useTokenDataByAddress } from "@/hooks/queries/token-data/use-token-data-by-address";
import { useStakeData } from "@/hooks";
import { useSendTransaction } from "@/hooks/privy";

export const useStake = (toolCallId: string, args: StakeArgumentsType, userPublicKey: string) => {

    const { addToolResult } = useChat();
    const { sendTransaction } = useSendTransaction();

    const { wallets } = useSolanaWallets();

    const [isStaking, setIsStaking] = useState(false);

    const { data: stakeData, isLoading: stakeDataLoading } = useStakeData({
      inputAmount: args.amount,
      slippageBps: 500,
      userPublicKey,
    });

    const { data: inputTokenData, isLoading: inputTokenDataLoading } = useTokenDataByAddress("So11111111111111111111111111111111111111112");
    const { data: outputTokenData, isLoading: outputTokenDataLoading } = useTokenDataByAddress("jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v");

    const onStake = async () => {

        if (!wallets.length) return;

        setIsStaking(true);

        try {
            // Deserialize the transaction
            const swapTransactionBuf = Buffer.from(stakeData.swapTransaction, "base64");
            const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

            const tx = await sendTransaction(transaction);
            
        
            addToolResult(toolCallId, {
                message: `Successfully staked ${args.amount} SOL for jupSOL.`,
                body: {
                    transaction: tx,
                    inputAmount: args.amount,
                    inputToken: inputTokenData!.symbol,
                    outputToken: outputTokenData!.symbol
                }
            });
        } catch (error) {
            console.error(error);
            addToolResult(toolCallId, {
                message: `Error executing stake: ${error}`,
            });
        }

        setIsStaking(false);
    }

    const onCancel = () => {
        addToolResult(toolCallId, {
            message: `Cancelled stake`,
        });
    }

    return {
        onStake,
        isStaking,
        stakeData,
        inputTokenData,
        outputTokenData,
        inputTokenDataLoading,
        outputTokenDataLoading,
        stakeDataLoading,
        onCancel,
    }
}