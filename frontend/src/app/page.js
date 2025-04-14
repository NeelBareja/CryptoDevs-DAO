'use client';

import {
  CryptoDevsDAOABI,
  CryptoDevsDAOAddress,
  CryptoDevsNFTABI,
  CryptoDevsNFTAddress,
} from '@/constants';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export default function Home() {
  const { address, isConnected } = useAccount();
  const wagmiConfig = useConfig();

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fakeNftTokenId, setFakeNftTokenId] = useState('');
  const [proposals, setProposals] = useState([]);
  const [selectedTab, setSelectedTab] = useState('');

  const { data: daoOwner } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'owner',
  });

  const { data: daoBalance } = useBalance({
    address: CryptoDevsDAOAddress,
  });

  const { data: numOfProposalsInDAO } = useReadContract({
    abi: CryptoDevsDAOABI,
    address: CryptoDevsDAOAddress,
    functionName: 'numProposals',
  });

  const { data: nftBalanceOfUser } = useReadContract({
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
    } catch (error) {
      console.error(error);
      window.alert(error);
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
    } catch (error) {
      console.error(error);
      window.alert(error);
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
    } catch (error) {
      console.error(error);
      window.alert(error);
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
    } catch (error) {
      console.error(error);
      window.alert(error);
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
    if (!nftBalanceOfUser || Number(nftBalanceOfUser) === 0) {
      return (
        <div className={styles.description}>
          You do not own any CryptoDevs NFTs. <br />
          <b>You cannot create or vote on proposals</b>
        </div>
      );
    }
    return (
      <div className={styles.container}>
        <label>Fake NFT Token ID to Purchase: </label>
        <input
          placeholder="0"
          type="number"
          onChange={(e) => setFakeNftTokenId(e.target.value)}
        />
        <button className={styles.button2} onClick={createProposal}>
          Create
        </button>
      </div>
    );
  }

  function renderViewProposalsTab() {
    if (loading) return <div className={styles.description}>Loading... Waiting for transaction...</div>;
    if (proposals.length === 0) return <div className={styles.description}>No proposals have been created</div>;
    return (
      <div>
        {proposals.map((p, index) => (
          <div key={index} className={styles.card}>
            <p>Proposal ID: {p.proposalId}</p>
            <p>Fake NFT to Purchase: {p.nftTokenId}</p>
            <p>Deadline: {p.deadline.toLocaleString()}</p>
            <p>Yes Votes: {p.yesVotes}</p>
            <p>No Votes: {p.noVotes}</p>
            <p>Executed?: {String(p.executed)}</p>
            {p.deadline.getTime() > Date.now() && !p.executed ? (
              <div className={styles.flex}>
                <button className={styles.button2} onClick={() => voteForProposal(p.proposalId, 'YES')}>Vote YES</button>
                <button className={styles.button2} onClick={() => voteForProposal(p.proposalId, 'NO')}>Vote NO</button>
              </div>
            ) : p.deadline.getTime() < Date.now() && !p.executed ? (
              <div className={styles.flex}>
                <button className={styles.button2} onClick={() => executeProposal(p.proposalId)}>
                  Execute Proposal {p.yesVotes > p.noVotes ? '(YES)' : '(NO)'}
                </button>
              </div>
            ) : (
              <div className={styles.description}>Proposal Executed</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  useEffect(() => {
    if (selectedTab === 'View Proposals') fetchAllProposals();
  }, [selectedTab]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (!isConnected)
    return (
      <div>
        <ConnectButton />
      </div>
    );

  return (
    <div className={inter.className}>
      <Head>
        <title>CryptoDevs DAO</title>
        <meta name="description" content="CryptoDevs DAO" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>Welcome to the DAO!</div>
          <div className={styles.description}>
            Your CryptoDevs NFT Balance: {String(nftBalanceOfUser)}
            <br />
            {daoBalance && (
              <>
                Treasury Balance: {formatEther(daoBalance.value)} ETH
              </>
            )}
            <br />
            Total Number of Proposals: {String(numOfProposalsInDAO)}
          </div>
          <div className={styles.flex}>
            <button className={styles.button} onClick={() => setSelectedTab('Create Proposal')}>
              Create Proposal
            </button>
            <button className={styles.button} onClick={() => setSelectedTab('View Proposals')}>
              View Proposals
            </button>
          </div>
          {renderTabs()}
          {address && daoOwner && address.toLowerCase() === daoOwner.toLowerCase() && (
            <div>
              {loading ? (
                <button className={styles.button}>Loading...</button>
              ) : (
                <button className={styles.button} onClick={withdrawDAOEther}>
                  Withdraw DAO ETH
                </button>
              )}
            </div>
          )}
        </div>
        <div>
          <img className={styles.image} src="https://i.imgur.com/buNhbF7.png" />
        </div>
      </div>
    </div>
  );
}
