import React from 'react'

import ToolCard from '../tool-card';

import { ToolInvocation } from 'ai';
import { BalanceResultType } from '@/agentkit/actions/solana/types';

interface Props {
    tool: ToolInvocation
}

const GetBalance: React.FC<Props> = ({ tool }) => {
    

    return (
        <ToolCard 
            tool={tool}
            agentName="Wallet Agent"
            icon="Wallet"
            loadingText={`Getting ${tool.args.tokenAddress || "SOL"} Balance...`}
            resultHeading={() => `Fetched ${tool.args.tokenAddress || "SOL"} Balance`}
            resultBody={(result: BalanceResultType) => result.body 
                ? `${result.body.balance.toFixed(4)} ${tool.args.tokenAddress || "SOL"}` 
                :  "No balance found"}
        />
    )
}

export default GetBalance;