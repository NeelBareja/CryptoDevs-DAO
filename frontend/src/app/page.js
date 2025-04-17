'use client';

import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from '@/constants';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { formatEther } from 'viem/utils';
import {
  useAccount,
  useBalance,
  useReadContract,
  useConfig,
} from 'wagmi';
import {
  readContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions';
import styles from './page.module.css';
import { Inter } from 'next/font/google';
import { useWeb3Modal } from '@web3modal/wagmi/react';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

const CustomW3mConnectButton = () => {
  const { open } = useWeb3Modal();

  return (
    <button 
      onClick={() => open()} 
      className={styles.customConnectButton}
    >
      <span className={styles.buttonGlow}></span>
      Connect Wallet
    </button>
  );
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fakeNftTokenId, setFakeNftTokenId] = useState('');
  const [proposals, setProposals] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');

  const { data: daoOwner, isLoading: isLoadingOwner } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'owner',
  });

  const { data: daoBalance, isLoading: isLoadingDaoBalance } = useBalance({
    address: CryptoDevsDAOAddress,
  });

  const { data: numOfProposalsInDAO, isLoading: isLoadingNumProposals } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'numProposals',
  });

  const { data: nftBalanceOfUser, isLoading: isLoadingNftBalance } = useReadContract({
    abi: CryptoDevsNFTABI,
    address: CryptoDevsNFTAddress,
    functionName: 'balanceOf',
    args: [address],
  });

  async function createProposal() {
    setLoading(true);
    try {
      const tx = await writeContract(wagmiConfig, {
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'createProposal',
        args: [fakeNftTokenId],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: tx });
      window.alert("Proposal created successfully!");
      setFakeNftTokenId(''); // Clear input after success
      fetchAllProposals(); // Refresh proposals
    } catch (error) {
      console.error(error);
      if (error.message.includes('User rejected the request')) {
        window.alert('Transaction rejected by user.');
      } else {
        window.alert(`Error creating proposal: ${error.message}`);
      }
    }
    setLoading(false);
  }

  async function fetchProposalById(id) {
    try {
      const proposal = await readContract(wagmiConfig, {
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'proposals',
        args: [id],
      });
      const [nftTokenId, deadline, yesVotes, noVotes, executed] = proposal;
      return {
        proposalId: id,
        nftTokenId: String(nftTokenId),
        deadline: new Date(Number(deadline) * 1000),
        yesVotes: String(yesVotes),
        noVotes: String(noVotes),
        executed: Boolean(executed),
      };
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  async function fetchAllProposals() {
    try {
      const total = Number(numOfProposalsInDAO);
      const proposalsList = [];
      for (let i = 0; i < total; i++) {
        const proposal = await fetchProposalById(i);
        proposalsList.push(proposal);
      }
      setProposals(proposalsList);
      return proposalsList;
    } catch (error) {
      console.error(error);
      window.alert(error);
    }
  }

  async function voteForProposal(proposalId, vote) {
    setLoading(true);
    try {
      const tx = await writeContract(wagmiConfig, {
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'voteOnProposal',
        args: [proposalId, vote === 'YES' ? 0 : 1],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: tx });
      window.alert("Vote cast successfully!");
      fetchAllProposals(); // Refresh proposals
    } catch (error) {
      console.error(error);
      if (error.message.includes('User rejected the request')) {
        window.alert('Transaction rejected by user.');
      } else {
        window.alert(`Error voting on proposal: ${error.message}`);
      }
    }
    setLoading(false);
  }

  async function executeProposal(proposalId) {
    setLoading(true);
    try {
      const tx = await writeContract(wagmiConfig, {
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'executeProposal',
        args: [proposalId],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: tx });
      window.alert("Proposal executed successfully!");
      fetchAllProposals(); // Refresh proposals
    } catch (error) {
      console.error(error);
      if (error.message.includes('User rejected the request')) {
        window.alert('Transaction rejected by user.');
      } else {
        window.alert(`Error executing proposal: ${error.message}`);
      }
    }
    setLoading(false);
  }

  async function withdrawDAOEther() {
    setLoading(true);
    try {
      const tx = await writeContract(wagmiConfig, {
        address: CryptoDevsDAOAddress,
        abi: CryptoDevsDAOABI,
        functionName: 'withdrawEther',
        args: [],
      });
      await waitForTransactionReceipt(wagmiConfig, { hash: tx });
      window.alert("DAO funds withdrawn successfully!");
    } catch (error) {
      console.error(error);
      if (error.message.includes('User rejected the request')) {
        window.alert('Transaction rejected by user.');
      } else {
        window.alert(`Error withdrawing funds: ${error.message}`);
      }
    }
    setLoading(false);
  }

  function renderTabs() {
    if (selectedTab === 'Create Proposal') return renderCreateProposalTab();
    if (selectedTab === 'View Proposals') return renderViewProposalsTab();
    return null;
  }

  function renderCreateProposalTab() {
    if (loading) return <div className={styles.description}>Loading... Waiting for transaction...</div>;
    if (isLoadingNftBalance) return <div className={styles.description}>Loading NFT Balance...</div>;
    if (!nftBalanceOfUser || Number(nftBalanceOfUser) === 0) {
      return (
        <div className={styles.description}>
          <h3>No CryptoDevs NFTs Found</h3>
          <p>You need to own at least one CryptoDevs NFT to create or vote on proposals.</p>
          <p>Please mint a CryptoDevs NFT to participate in the DAO.</p>
        </div>
      );
    }
    return (
      <div className={styles.container}>
        <h3>Create New Proposal</h3>
        <p>Enter the ID of the NFT you want to purchase from the marketplace</p>
        <input
          placeholder="Enter NFT Token ID"
          type="number"
          onChange={(e) => setFakeNftTokenId(e.target.value)}
        />
        <button className={styles.button2} onClick={createProposal}>
          Create Proposal
        </button>
      </div>
    );
  }

  function renderViewProposalsTab() {
    if (loading) return <div className={styles.description}>Loading... Waiting for transaction...</div>;
    if (proposals.length === 0) return <div className={styles.description}>No proposals have been created yet</div>;
    return (
      <div>
        {proposals.map((p, index) => (
          <div key={index} className={styles.card}>
            <h3>Proposal #{p.proposalId}</h3>
            <p><strong>NFT Token ID:</strong> {p.nftTokenId}</p>
            <p><strong>Deadline:</strong> {p.deadline.toLocaleString()}</p>
            <p><strong>Votes:</strong> Yes: {p.yesVotes} | No: {p.noVotes}</p>
            <p><strong>Status:</strong> {p.executed ? 'Executed' : p.deadline.getTime() > Date.now() ? 'Active' : 'Expired'}</p>
            
            {p.deadline.getTime() > Date.now() && !p.executed ? (
              <div className={styles.flex}>
                <button 
                  className={styles.button2} 
                  onClick={() => voteForProposal(p.proposalId, 'YES')}
                  disabled={loading}
                >
                  Vote YES
                </button>
                <button 
                  className={styles.button2} 
                  onClick={() => voteForProposal(p.proposalId, 'NO')}
                  disabled={loading}
                >
                  Vote NO
                </button>
              </div>
            ) : p.deadline.getTime() < Date.now() && !p.executed ? (
              <div className={styles.flex}>
                <button 
                  className={styles.button2} 
                  onClick={() => executeProposal(p.proposalId)}
                  disabled={loading}
                >
                  Execute Proposal {p.yesVotes > p.noVotes ? '(YES)' : '(NO)'}
                </button>
              </div>
            ) : (
              <div className={styles.description}>Proposal has been executed</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    console.log("Connection Status:", isConnected);
    if (isConnected && address) {
      console.log("Connected Address:", address);
      console.log("Fetching Balances for address:", address);
    } else {
      console.log("Not Connected or Address not available yet.");
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConnected) {
      console.log("DAO Balance Data:", daoBalance ? formatEther(daoBalance.value) : 'Loading...');
      console.log("NFT Balance Data:", nftBalanceOfUser !== undefined ? String(nftBalanceOfUser) : 'Loading...');
      console.log("Number of Proposals:", numOfProposalsInDAO !== undefined ? String(numOfProposalsInDAO) : 'Loading...');
      console.log("DAO Owner:", daoOwner !== undefined ? daoOwner : 'Loading...');
    }
  }, [daoBalance, nftBalanceOfUser, numOfProposalsInDAO, daoOwner, isConnected]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (selectedTab === 'View Proposals' && isConnected) {
      fetchAllProposals();
    }
  }, [selectedTab, isConnected]);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div className={styles.connectContainer}>
        <div className={styles.connectContent}>
          <h1 className={styles.connectTitle}>Welcome to CryptoDevs DAO</h1>
          <p className={styles.connectSubtitle}>Connect your wallet to start participating in the DAO</p>
          
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <h3>Create Proposals</h3>
              <p>Propose new NFT purchases for the DAO</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Vote on Proposals</h3>
              <p>Participate in DAO governance decisions</p>
            </div>
            <div className={styles.featureCard}>
              <h3>Execute Decisions</h3>
              <p>Help execute approved proposals</p>
            </div>
          </div>

          <div className={styles.connectButtonContainer}>
            <CustomW3mConnectButton />
            <p className={styles.connectHint}>You'll need a Web3 wallet like MetaMask to connect</p>
          </div>

          <div className={styles.requirements}>
            <h3>Requirements to Participate:</h3>
            <ul>
              <li>Web3 Wallet (MetaMask, Coinbase Wallet, etc.)</li>
              <li>CryptoDevs NFT (to create/vote on proposals)</li>
              <li>Some ETH for gas fees</li>
            </ul>
          </div>
        </div>
      </div>
    );

  return (
    <div className={styles.main}>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO - A Decentralized Autonomous Organization" />
      </Head>

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Welcome to CryptoDevs DAO</h1>
          <p className={styles.subtitle}>A Decentralized Autonomous Organization for CryptoDevs NFT Holders</p>
        </div>
        <div className={styles.walletConnect}>
          <w3m-button />
        </div>
      </div>

      {isConnected && (
        <div className={styles.content}>
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <h3>DAO Balance</h3>
              <p>{daoBalance ? formatEther(daoBalance.value) : "0"} ETH</p>
            </div>
            <div className={styles.statCard}>
              <h3>Your NFTs</h3>
              <p>{nftBalanceOfUser ? nftBalanceOfUser.toString() : "0"}</p>
            </div>
            <div className={styles.statCard}>
              <h3>Active Proposals</h3>
              <p>{proposals.filter(p => !p.executed && p.deadline.getTime() > Date.now()).length}</p>
            </div>
          </div>

          <div className={styles.tabs}>
            <button 
              className={`${styles.tabButton} ${selectedTab === 'Create Proposal' ? styles.active : ''}`}
              onClick={() => setSelectedTab('Create Proposal')}
            >
              Create Proposal
            </button>
            <button 
              className={`${styles.tabButton} ${selectedTab === 'View Proposals' ? styles.active : ''}`}
              onClick={() => setSelectedTab('View Proposals')}
            >
              View Proposals
            </button>
          </div>

          <div className={styles.tabContent}>
            {renderTabs()}
          </div>

          {daoOwner === address && (
            <div className={styles.adminSection}>
              <h3>DAO Owner Controls</h3>
              <button 
                className={styles.adminButton}
                onClick={withdrawDAOEther}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Withdraw DAO Funds'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
