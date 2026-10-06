import L1Img from '../assets/hero-cards/L1.webp';
import L2Img from '../assets/hero-cards/L2.webp';
import L3Img from '../assets/hero-cards/L3.webp';
import L4Img from '../assets/hero-cards/L4.webp';
import L5Img from '../assets/hero-cards/L5.webp';
import L6Img from '../assets/hero-cards/L6.webp';
import L7Img from '../assets/hero-cards/L7.webp';
import L8Img from '../assets/hero-cards/L8.webp';
import L9Img from '../assets/hero-cards/L9.webp';
import L10Img from '../assets/hero-cards/L10.webp';
import L11Img from '../assets/hero-cards/L11.webp';
import L12Img from '../assets/hero-cards/L12.webp';
import L13Img from '../assets/hero-cards/L13.webp';

export const CASE_STORIES = [
  {
    id: '01',
    name: 'Robert H. Miller',
    location: 'Austin, Texas • USA',
    image: L1Img,
    tag: 'CASE #01 • RESTITUTION COMPLETE',
    status: 'Restitution Approved',
    refundedAmount: '$184,500 Refunded',
    rawAmount: '$184,500',
    date: 'October 14, 2025',
    category: 'Fake Wallet Application',
    investigator: 'Lead Forensic Examiner D. Vance (Chainalysis Certified)',
    headline: 'How an Austin Investor Recovered $184,500 Siphoned via a Cloned Wallet Application',
    pullQuote: '"My name is Robert H. Miller. I lost $184,500, and for three days I thought I would never see it again."',
    summary: 'Robert deposited $184,500 into what appeared to be an authentic desktop non-custodial crypto wallet downloaded from a sponsored search result. Overnight, his balance was swept to zero by automated drainers. ReclaimDAO traced the multi-hop wallet transfers to a major centralized exchange where funds were frozen and restored.',
    sections: [
      {
        heading: 'The Fraud: A Lookalike Application',
        paragraphs: [
          'My name is Robert H. Miller, residing in Austin, Texas. I had recently decided to consolidate my digital asset holdings into cold and non-custodial storage. I searched online for a reputable wallet client and found what looked like the official website. The typography, SSL certificate, documentation, and interface were identical to the genuine product.',
          'Everything looked professional. I downloaded the desktop application, created my wallet, recorded my seed phrase on paper, and transferred $184,500 worth of crypto assets into it. I remember feeling a tremendous sense of relief: "Finally, I\'ve got my crypto safely stored and under my own keys."',
          'The next morning, I opened the wallet client. My balance was $0.00.'
        ]
      },
      {
        heading: 'The Discovery: Siphoned in the Dark',
        paragraphs: [
          'At first, I assumed the application was experiencing an RPC connection error or synchronization glitch. But when I checked the public block explorer, my stomach sank. An unauthorized automated script had transferred all my tokens away just 43 minutes after deposit.',
          'I immediately contacted the official development team of the wallet. Within minutes, they confirmed my worst nightmare: the website I had used was a sophisticated typo-squatted clone, and the binary I downloaded contained an embedded telemetry backdoor that transmitted private keys directly to a fraud network.',
          'I felt completely helpless. Local law enforcement did not possess the blockchain tooling to track the transactions, and standard recovery forums were flooded with secondary scammers.'
        ]
      },
      {
        heading: 'The ReclaimDAO Forensic Protocol',
        paragraphs: [
          'I contacted ReclaimDAO through their verified claims portal and submitted every piece of forensic evidence: transaction hashes, wallet addresses, the exact binary installer hash, and DNS records of the phishing site.',
          'The ReclaimDAO investigator told me directly: "First, we must determine whether your funds are traceable through on-chain clustering. We do not promise recovery before completing an empirical investigation." That transparency gave me genuine confidence.',
          'Within 72 hours, ReclaimDAO\'s on-chain forensics team mapped the path of my funds. The scammers had routed the $184,500 through 14 intermediary transit wallets across Ethereum and Arbitrum before funneling the combined balance into a premier centralized exchange deposit address.'
        ]
      },
      {
        heading: 'Legal Coordination & Asset Return',
        paragraphs: [
          'ReclaimDAO compiled an expedited Forensic Restitution Dossier detailing the provenance of every satoshi and token. Working in tandem with our legal representatives and international law enforcement, a formal preservation notice was served on the exchange.',
          'The exchange compliance division verified the on-chain evidence and placed an immediate administrative freeze on the beneficiary account holding the identifiable funds.',
          'Several weeks later, the formal restitution order was executed. The recovered $184,500 was transferred back to my verified secure hardware wallet. Seeing the funds restored after believing they were gone forever was surreal.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Trojanized Desktop Client (Typosquatting)',
      network: 'Ethereum Mainnet & Arbitrum One',
      hopsTraced: '14 Intermediary Addresses',
      counterpartyStatus: 'Centralized Exchange KYC Identified',
      recoveryTimeline: '28 Days from Dossier Submission',
      restitutionRate: '100% of Documented Claim'
    }
  },
  {
    id: '02',
    name: 'Marcus Vance',
    location: 'Brisbane, Queensland • Australia',
    image: L2Img,
    tag: 'CASE #02 • RESTITUTION COMPLETE',
    status: 'Claim Documented',
    refundedAmount: '$92,400 Refunded',
    rawAmount: '$92,400',
    date: 'October 21, 2025',
    category: 'Fake Tech Support Impersonation',
    investigator: 'Lead Forensic Analyst S. Thorne (TRM Certified)',
    headline: 'How Brisbane Native Marcus Vance Reclaimed $92,400 After Imposter Support Fraud',
    pullQuote: '"I didn\'t lose my crypto to a blind code bug. I lost it to someone I genuinely believed was helping me."',
    summary: 'Marcus experienced a failed decentralized transaction and sought assistance on a community Discord server. An imposter impersonating protocol support established a screen-sharing session and convinced him to input sensitive verification credentials. ReclaimDAO traced the stolen $92,400 and coordinated multi-jurisdictional freezing.',
    sections: [
      {
        heading: 'The Deception: The Friendly Support Agent',
        paragraphs: [
          'My name is Marcus Vance, based in Brisbane, Queensland. I had executed a bridge swap between Ethereum and Polygon that appeared stuck in pending status. Frustrated and concerned, I looked for official customer support on a community forum.',
          'Almost immediately, an account bearing the verified protocol logo and the handle "Tier-2 Technical Escrow Support" contacted me. They sounded exceptionally professional, used precise technical terminology, and appeared to diagnose my exact stuck bridge transaction in real-time.',
          'I thought to myself: "Finally, someone with technical authority is going to fix this."'
        ]
      },
      {
        heading: 'The Breach: A Controlled Remote Exploit',
        paragraphs: [
          'The agent guided me through what they called a "node resynchronization protocol." They sent me a diagnostic link and requested that I run a verification script to clear the stuck nonces.',
          'Within minutes of following their instructions, transaction notifications flashed on my hardware interface. $92,400 in wrapped assets was instantaneously drained and converted into liquid Ether.',
          'I hurriedly messaged the support agent. No response. Within 60 seconds, their profile vanished, the server kicked me, and the account was deleted. The realization that I had opened the door to an imposter was devastating.'
        ]
      },
      {
        heading: 'Forensic Investigation by ReclaimDAO',
        paragraphs: [
          'After lodging reports with the Australian Cyber Security Centre (ACSC), I engaged ReclaimDAO. I provided the complete conversation transcript, the malicious diagnostic script, and transaction receipts.',
          'ReclaimDAO\'s investigation team immediately deployed heuristic clustering tools. The perpetrator\'s wallet was not an isolated actor; it was part of a syndication network executing support impersonations globally.',
          'The on-chain trace revealed that the stolen crypto had moved through several peel chains before reaching a custodial off-ramp exchange with stringent KYC protocols.'
        ]
      },
      {
        heading: 'Full Asset Recovery & Restitution',
        paragraphs: [
          'With ReclaimDAO\'s comprehensive cryptographic forensic report in hand, mutual legal assistance treaties (MLAT) channels were utilized to freeze the recipient account before the perpetrators could execute fiat off-ramping.',
          'The exchange compliance officers confirmed that the account held the full $92,400 balance. Following verified identity confirmation and judicial certification, the funds were returned in full.',
          'The feeling of relief cannot be overstated. ReclaimDAO proved that on-chain records do not lie when expert investigators know how to read them.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Social Engineering & Malicious Diagnostic Script',
      network: 'Ethereum & Polygon PoS',
      hopsTraced: '9 Layered Peel Wallets',
      counterpartyStatus: 'Custodial KYC Account Frozen',
      recoveryTimeline: '32 Days Total Investigation',
      restitutionRate: '100% Fully Recovered'
    }
  },
  {
    id: '03',
    name: 'Alastair Sterling',
    location: 'London, Greater London • UK',
    image: L3Img,
    tag: 'CASE #03 • RESTITUTION COMPLETE',
    status: 'Restitution In Progress',
    refundedAmount: '$245,000 Refunded',
    rawAmount: '$245,000',
    date: 'November 02, 2025',
    category: 'Institutional Phishing Domain',
    investigator: 'Forensic Director K. Henderson (Former Met Cyber Specialist)',
    headline: 'London Executive Alastair Sterling Recovers $245,000 After Urgent KYC Phishing Attack',
    pullQuote: '"I clicked one urgent security link because I believed I was safeguarding my institutional custody account."',
    summary: 'Alastair received a high-priority compliance warning appearing to originate from his primary institutional custodian. The email linked to an exact replica domain that intercepted his cryptographic session token. ReclaimDAO intercepted the movement across DeFi bridges and secured full restitution.',
    sections: [
      {
        heading: 'The Hook: An Urgent Regulatory Mandate',
        paragraphs: [
          'My name is Alastair Sterling, and I run an investment consultancy in London. I received an email notifying me that due to newly enacted UK FCA guidelines, my digital asset custody account required an immediate compliance re-verification within 24 hours to avoid trading suspension.',
          'The communication bore the exact branding, sender domain mask, cryptographic signatures, and corporate legal disclosures of our custodial provider. I clicked the secure verification link.',
          'The portal interface was an exact clone of the institutional dashboard. Without suspecting deceit, I authenticated using our Web3 credentials.'
        ]
      },
      {
        heading: 'The Drain: Intercepted Signature Hijack',
        paragraphs: [
          'Within 40 minutes of authentication, our treasury wallet triggered alerts. $245,000 in stablecoins and blue-chip tokens had been routed to an unknown address.',
          'The malicious portal had not merely harvested login credentials—it had solicited an off-chain cryptographic signature (EIP-712) that authorized the contract to liquidate pool tokens without an on-chain gas confirmation on our end.',
          'I felt an overwhelming sense of responsibility for having compromised the firm\'s capital. We notified the City of London Police Cyber Unit and immediately retained ReclaimDAO.'
        ]
      },
      {
        heading: 'ReclaimDAO On-Chain Pursuit',
        paragraphs: [
          'ReclaimDAO\'s senior forensic team initiated real-time blockchain monitoring. They discovered the adversary was executing cross-chain hops via decentralized liquidity pools to obscure the asset trail.',
          'However, ReclaimDAO\'s proprietary tracing algorithms identified deterministic transaction timestamps and gas fee correlations that linked the attacker\'s liquidity hops to an off-ramp exchange operating in the European Economic Area.',
          'Their forensic team generated an urgent legal disclosure package within 18 hours, documenting the direct causal link between our compromised wallet and the destination deposits.'
        ]
      },
      {
        heading: 'Restitution Realized',
        paragraphs: [
          'A provisional injunction was granted, compelling the exchange to freeze the target assets. Following inter-agency verification, all $245,000 was successfully returned to our custody.',
          'When the final confirmation cleared, I sat in silence looking at the restored treasury balance. It taught our entire leadership that recovery is possible when speed and mathematical evidence converge.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'EIP-712 Permit Phishing & Spoofed Regulatory Alert',
      network: 'Ethereum Mainnet / Arbitrum',
      hopsTraced: '18 Cross-Bridge Swaps',
      counterpartyStatus: 'EEA-Regulated Exchange Restrained',
      recoveryTimeline: '21 Days Expedited Recovery',
      restitutionRate: '100% of Lost Capital'
    }
  },
  {
    id: '04',
    name: 'Chloe Martinez',
    location: 'San Diego, California • USA',
    image: L4Img,
    tag: 'CASE #04 • RESTITUTION COMPLETE',
    status: 'Recovery Allocated',
    refundedAmount: '$130,000 Refunded',
    rawAmount: '$130,000',
    date: 'November 11, 2025',
    category: 'Malicious Permit2 Allowance Drain',
    investigator: 'Smart Contract Auditor R. Chen (Stanford Blockchain Labs)',
    headline: 'San Diego Trader Chloe Martinez Recovers $130,000 Siphoned Through Infinite Token Approval',
    pullQuote: '"I thought I was simply pressing \'Approve\' for a token swap. In reality, I had signed away my entire vault."',
    summary: 'Chloe interacted with a decentralized aggregator that had suffered a subtle front-end script injection. The transaction request requested an unlimited Permit2 allowance that granted bad actors permission to sweep her account. ReclaimDAO traced the stolen liquidity and enforced legal recovery.',
    sections: [
      {
        heading: 'The Interaction: A Routine Token Swap',
        paragraphs: [
          'My name is Chloe Martinez, living in San Diego, California. As an active decentralized finance participant, I frequently swap tokens on decentralized exchanges. I navigated to what appeared to be an updated aggregator interface.',
          'I connected my hardware wallet to execute a planned trade. The wallet extension prompted me to approve a standard contract interaction. Everything looked standard—it appeared to be a routine spending cap authorization.',
          'I pressed "Confirm" and went back to work.'
        ]
      },
      {
        heading: 'The Vacuum: Infinite Allowance Exploitation',
        paragraphs: [
          'Later that afternoon, I opened my portfolio tracker and gasped. My balance had dropped by $130,000.',
          'I had not initiated any transfers, yet my USDC, DAI, and ETH had been swept into a contract called "Disperse." The approval I had signed was not for a single swap—it had granted an obscured smart contract proxy an unlimited, perpetual spending allowance over my entire wallet balance.',
          'I was horrified. The money represented three years of disciplined personal savings.'
        ]
      },
      {
        heading: 'Forensic Bytecode Deconstruction by ReclaimDAO',
        paragraphs: [
          'A colleague directed me to ReclaimDAO. Their smart contract specialists disassembled the malicious proxy contract and identified a vulnerability in the exploiter\'s own automated withdrawal script.',
          'The perpetrators had automated their drainer to pool funds into an intermediary smart contract before bridging out. ReclaimDAO coordinated with white-hat validators and specialized law enforcement contacts to freeze the exploiter\'s withdrawal route.',
          'Their forensic team tracked the remainder of the funds as they entered a prominent centralized exchange, submitting a verified audit showing the exact signature hash used to siphon the $130,000.'
        ]
      },
      {
        heading: 'Restitution and Return',
        paragraphs: [
          'The exchange legal team acted swiftly upon receiving ReclaimDAO\'s definitive proof. The illicit account was frozen and judicial forfeiture proceedings commenced.',
          'Thirty-six days after submitting my claim, the entirety of my $130,000 was safely remitted back to my fresh, newly generated hardware wallet address.',
          'I never blindly approve a transaction again—and I am forever indebted to ReclaimDAO\'s technical rigor.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Malicious Permit2 Allowance Signature',
      network: 'Ethereum Mainnet (USDC / DAI)',
      hopsTraced: 'Intermediate Smart Contract Proxy',
      counterpartyStatus: 'Exploiter Hot Wallet Seized',
      recoveryTimeline: '36 Days from Incident',
      restitutionRate: '100% Full Restitution'
    }
  },
  {
    id: '05',
    name: 'Sophie Campbell',
    location: 'Melbourne, Victoria • Australia',
    image: L5Img,
    tag: 'CASE #05 • RESTITUTION COMPLETE',
    status: 'Forensic Verified',
    refundedAmount: '$278,000 Refunded',
    rawAmount: '$278,000',
    date: 'November 19, 2025',
    category: 'Fake Algorithmic Yield Platform',
    investigator: 'Senior Financial Crime Specialist M. Ross (Ex-ASIC Investigator)',
    headline: 'Melbourne Investor Sophie Campbell Recovers $278,000 from an Elaborate Fake Yield Syndicate',
    pullQuote: '"The dashboard showed my portfolio climbing to $340,000. In reality, my actual money had been siphoned the very second I deposited it."',
    summary: 'Sophie was introduced to a high-yield algorithmic quantitative platform featuring real-time trading dashboards and live charts. When she requested a principal withdrawal, the platform demanded $50,000 in "capital gains tax fees." ReclaimDAO untangled the shell syndicate and recovered her entire $278,000.',
    sections: [
      {
        heading: 'The Mirage: A High-Yield Quantitative Platform',
        paragraphs: [
          'My name is Sophie Campbell, from Melbourne, Australia. Through an investment networking circle, I was introduced to what purported to be an institutional-grade quantitative yield platform operating automated arbitrage across decentralized exchanges.',
          'The platform featured an immaculate user interface: daily profit statements, real-time charts, audited performance metrics, and professional account managers who conducted bi-weekly telephone reviews.',
          'Confident in their operational legitimacy, I transferred an initial $50,000, followed by subsequent deposits totaling $278,000 over a two-month span.'
        ]
      },
      {
        heading: 'The Extortion: Withdrawal Lockout',
        paragraphs: [
          'When my dashboard indicated my balance had appreciated to over $340,000, I submitted a request to withdraw $100,000 for a property settlement.',
          'Within hours, the platform administrator informed me that my funds were locked under "anti-money laundering compliance review" and demanded an additional $50,000 wire transfer for "advance tax withholding" before funds could be released.',
          'When I refused and insisted on deducting fees from the balance, all communication was severed and my login credentials were systematically disabled.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Multi-Chain Investigation',
        paragraphs: [
          'In a state of acute panic, I contacted ReclaimDAO. Their financial crime investigators quickly confirmed what I feared: the platform dashboard was a simulated frontend displaying fabricated data. The deposits had never been invested.',
          'However, the blockchain never forgets. ReclaimDAO traced the actual on-chain routing of my deposits. The scam syndicate had moved my USDT through a complex chain of cross-network swaps across Tron, Binance Smart Chain, and Ethereum.',
          'ReclaimDAO pieced together the transaction graph and identified that the syndicate maintained significant unliquidated liquidity reserves on two compliant, regulated crypto exchanges.'
        ]
      },
      {
        heading: 'International Freezing & Full Restitution',
        paragraphs: [
          'ReclaimDAO prepared an ironclad forensic evidentiary brief that was submitted to the Australian Federal Police and overseas financial intelligence units.',
          'Emergency court orders were secured freezing the perpetrator nodes. Through the formal judicial recovery framework, $278,000 of my documented principal capital was successfully recovered and remitted to me.',
          'ReclaimDAO did not just recover my money; they restored my peace of mind and faith in justice.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Simulated Web Dashboard & Advance Fee Fraud',
      network: 'Tron (TRC-20) & Ethereum (ERC-20)',
      hopsTraced: '24 Multi-Network Transactions',
      counterpartyStatus: 'Syndicate Liquidity Reserves Restrained',
      recoveryTimeline: '44 Days Comprehensive Action',
      restitutionRate: '100% of Principal Investment'
    }
  },
  {
    id: '06',
    name: 'Gemma Thornton',
    location: 'Manchester, Greater Manchester • UK',
    image: L6Img,
    tag: 'CASE #06 • RESTITUTION COMPLETE',
    status: 'Asset Traced',
    refundedAmount: '$115,200 Refunded',
    rawAmount: '$115,200',
    date: 'November 27, 2025',
    category: 'Seed Phrase Social Engineering',
    investigator: 'Forensic Intelligence Specialist E. Davies (SANS GIAC Certified)',
    headline: 'Manchester Resident Gemma Thornton Restores $115,200 After Social Engineering Deception',
    pullQuote: '"I gave away the one secret that should have belonged solely to me. I thought my entire family savings were gone forever."',
    summary: 'Gemma fell victim to an intricate social engineering scheme masquerading as an official protocol hard fork validator. Under psychological duress regarding asset invalidation, she entered her secret recovery phrase on a spoofed portal. ReclaimDAO tracked the funds and secured a complete recovery.',
    sections: [
      {
        heading: 'The Trap: A Manufactured Urgency',
        paragraphs: [
          'My name is Gemma Thornton, residing in Manchester, England. I held $115,200 in long-term cryptocurrency assets that I had accumulated over five years as a reserve fund for my children.',
          'One afternoon, I received a notice warning of an imminent hard fork upgrade on the network hosting my tokens. The message indicated that non-migrated wallets would experience permanent asset de-synchronization unless validated within 48 hours.',
          'Anxiety overtook my caution. I followed the provided link to a beautifully designed "Consensus Migration Portal" that asked for wallet synchronization via my 12-word seed phrase.'
        ]
      },
      {
        heading: 'The Collapse: An Empty Portfolio',
        paragraphs: [
          'Within 15 minutes of submitting the phrase, my wallet balance dropped to absolute zero. Every token had been drained.',
          'The magnitude of my mistake struck me immediately. I knew in my heart that a recovery phrase must never be shared, yet in that moment of manufactured panic, I had handed over the master keys to our family savings.',
          'I spent three days in complete despair, unable to sleep or explain what had happened to my family.'
        ]
      },
      {
        heading: 'Forensic Intervention by ReclaimDAO',
        paragraphs: [
          'A colleague in cybersecurity urged me to submit a claim to ReclaimDAO. Their team responded with empathy, professionalism, and zero judgment.',
          'Their forensic analysts immediately isolated the destination wallets and discovered that the attacker had dispersed the funds into three separate liquidity clusters on decentralized exchanges.',
          'Crucially, ReclaimDAO\'s real-time monitoring bot flagged when the attacker attempted to bridge the proceeds through an unapproved centralized gateway, generating an instant alert.'
        ]
      },
      {
        heading: 'Restitution & Financial Salvation',
        paragraphs: [
          'ReclaimDAO worked around the clock with European financial regulators to execute an emergency preservation hold on the destination exchange.',
          'The entire $115,200 was successfully sequestered. Following the required statutory review period, the funds were released and returned directly to a newly generated, cold-storage custodial address.',
          'When the funds returned, I wept with gratitude. ReclaimDAO literally saved my family\'s financial future.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Seed Phrase Harvesting via Spoofed Migration Portal',
      network: 'Ethereum Mainnet',
      hopsTraced: '11 Fragmented Liquidity Paths',
      counterpartyStatus: 'Gateway Hot Wallet Intercepted',
      recoveryTimeline: '29 Days from Initial Dossier',
      restitutionRate: '100% Total Recovery'
    }
  },
  {
    id: '07',
    name: 'Dr. Lucas Bennett',
    location: 'Denver, Colorado • USA',
    image: L7Img,
    tag: 'CASE #07 • RESTITUTION COMPLETE',
    status: 'Claim Documented',
    refundedAmount: '$198,000 Refunded',
    rawAmount: '$198,000',
    date: 'December 04, 2025',
    category: 'Clipboard Address Poisoning',
    investigator: 'Forensic Cyber Researcher J. Morales (CISSP & TRM Certified)',
    headline: 'Denver Physician Dr. Lucas Bennett Recovers $198,000 Lost to Clipboard Address Poisoning',
    pullQuote: '"I did not trust a scammer or click an unknown link. I simply discovered that the transaction had gone somewhere it never should have."',
    summary: 'Dr. Lucas Bennett prepared a $198,000 transfer to complete a medical clinic acquisition. A resident clipboard hijacker malware secretly substituted the destination address in his operating system clipboard with an attacker-controlled vanity address sharing the identical first four and last four characters. ReclaimDAO tracked the funds and recovered 100%.',
    sections: [
      {
        heading: 'The Transfer: A High-Stakes Transaction',
        paragraphs: [
          'My name is Dr. Lucas Bennett, practicing in Denver, Colorado. I was in the final stages of acquiring diagnostic imaging equipment for our clinic, with the vendor agreeing to settle in USDC on Ethereum.',
          'I copied the vendor\'s verified invoice address from our encrypted communications, pasted it into my transfer interface, and checked the first four and last four characters as I had routinely done for years. They matched perfectly.',
          'I confirmed the $198,000 transaction with my hardware token and notified the vendor.'
        ]
      },
      {
        heading: 'The Discrepancy: Address Poisoning Exposed',
        paragraphs: [
          'Thirty minutes later, the vendor\'s chief financial officer called to report that the invoice remained unpaid on their end. We inspected the transaction hash together on Etherscan.',
          'To my utter horror, the middle 32 characters of the recipient address were completely different from the intended address. My computer had been infected with a stealth clipboard poisoning malware that monitored the system clipboard and substituted cryptocurrency addresses with pre-mined vanity clones.',
          'I had sent $198,000 into a trap. Because blockchain transactions are immutable, I believed the capital was permanently obliterated.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Heuristic Pursuit',
        paragraphs: [
          'I reached out to ReclaimDAO after researching blockchain recovery protocols. Their forensic specialists immediately recognized the signature of the clipboard malware campaign.',
          'By analyzing the bytecode patterns and gas funding trails of the vanity address, ReclaimDAO mapped the broader syndicate of addresses controlled by the same threat actor.',
          'The team tracked the movement of the $198,000 as it was channeled through cross-chain DEX routers into a high-liquidity fiat gateway operating under US and Swiss regulatory jurisdiction.'
        ]
      },
      {
        heading: 'Asset Freezing & Court-Sanctioned Restitution',
        paragraphs: [
          'Armed with ReclaimDAO\'s exhaustive cryptographic audit, our legal counsel obtained an emergency ex-parte freezing order served upon the exchange.',
          'The gateway complied immediately, securing the entire $198,000 before the cybercriminals could convert it to fiat currency.',
          'Within five weeks, the full balance was restored to our clinic\'s verified account. This experience demonstrated that while code is immutable, criminal activity leaves a traceable forensic footprint that ReclaimDAO knows how to dismantle.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Memory-Resident Clipboard Hijacker (Vanity Address Poisoning)',
      network: 'Ethereum Mainnet (USDC)',
      hopsTraced: '16 Automated Routing Jumps',
      counterpartyStatus: 'Swiss/US Gateway Deposit Restrained',
      recoveryTimeline: '35 Days Total Case Resolution',
      restitutionRate: '100% of Diverted Funds'
    }
  },
  {
    id: '08',
    name: 'Charlotte Hayes',
    location: 'Sydney, New South Wales • Australia',
    image: L8Img,
    tag: 'CASE #08 • RESTITUTION COMPLETE',
    status: 'Restitution In Progress',
    refundedAmount: '$86,500 Refunded',
    rawAmount: '$86,500',
    date: 'December 12, 2025',
    category: 'Arbitrage Romance / Pig Butchering Deception',
    investigator: 'Lead Forensic Specialist H. O\'Connor (ACSC Liaison Fellow)',
    headline: 'Sydney Professional Charlotte Hayes Recovers $86,500 After Deceptive Liquidity Pool Trap',
    pullQuote: '"They spent months earning my trust before showing me what seemed like an innocent, automated liquidity arbitrage protocol."',
    summary: 'Charlotte was systematically groomed by a sophisticated online syndicate that steered her toward a decentralized liquidity pool. The custom smart contract contained a hidden liquidity drain function that stripped her $86,500 in capital. ReclaimDAO traced the funds across Polygon and secured full asset recovery.',
    sections: [
      {
        heading: 'The Approach: A Calculated Psychological Setup',
        paragraphs: [
          'My name is Charlotte Hayes, living in Sydney, Australia. I was approached through a professional social network by someone claiming to be a financial risk analyst in Singapore. Over several months, we built what felt like a genuine personal and professional rapport.',
          'Eventually, the conversation turned to decentralized liquidity provisioning. They shared real-time telemetry from an automated liquidity pool smart contract that allegedly earned consistent protocol fees through cross-exchange spreads.',
          'The interface was smooth, transparent, and appeared to connect seamlessly to standard Web3 wallets without requiring asset custody surrender.'
        ]
      },
      {
        heading: 'The Drain: The Malicious Liquidity Trap',
        paragraphs: [
          'Encouraged by early simulated returns, I committed $86,500 in USDT to the liquidity pairing contract. For two weeks, the yield accrued smoothly.',
          'Suddenly, the protocol\'s total value locked (TVL) dropped to zero. When I attempted to unstake my principal, the transaction repeatedly failed with an enigmatic smart contract revert error.',
          'My acquaintance ceased all communications, deleted their profile, and disconnected all channels. I was left facing the agonizing reality that the smart contract had been coded with an owner-only backdoor drain.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Forensic Investigation',
        paragraphs: [
          'Devastated, I submitted my case to ReclaimDAO. Their senior analysts audited the liquidity pool\'s smart contract bytecode and exposed the hidden "emergencyMigrate" function that the syndicate had triggered to route my assets into their personal wallets.',
          'ReclaimDAO tracked the stolen USDT across Polygon to an Asian-registered centralized exchange, matching transaction timestamps with precision.',
          'They produced a detailed forensic evidence binder connecting my initial deposit directly to the final exchange KYC account.'
        ]
      },
      {
        heading: 'Restitution and Closure',
        paragraphs: [
          'With ReclaimDAO\'s evidence submitted to law enforcement and the exchange compliance division, an emergency freeze was placed on the recipient account within 48 hours.',
          'Following verified victim identification, the entirety of my $86,500 was released back into my custody.',
          'ReclaimDAO transformed an experience of profound betrayal into a testament to what legitimate forensic accountability can accomplish.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Engineered Liquidity Pool Backdoor (EmergencyMigrate Drain)',
      network: 'Polygon PoS & Ethereum',
      hopsTraced: '12 Layered Swaps',
      counterpartyStatus: 'Offshore Exchange KYC Account Frozen',
      recoveryTimeline: '38 Days from Submission',
      restitutionRate: '100% of Documented Losses'
    }
  },
  {
    id: '09',
    name: 'David Kowalski',
    location: 'Chicago, Illinois • USA',
    image: L9Img,
    tag: 'CASE #09 • RESTITUTION COMPLETE',
    status: 'Claim Documented',
    refundedAmount: '$210,000 Refunded',
    rawAmount: '$210,000',
    date: 'December 20, 2025',
    category: 'Backdoored OTC Escrow Smart Contract',
    investigator: 'Principal Blockchain Investigator T. Sterling (TRM & Chainalysis Certified)',
    headline: 'Chicago Executive David Kowalski Reclaims $210,000 from Exploited Escrow Contract',
    pullQuote: '"The escrow contract claimed to be audited by OpenZeppelin. In truth, it contained a re-entrancy backdoor that robbed us in broad daylight."',
    summary: 'David engaged in an institutional over-the-counter (OTC) transaction for $210,000 using what appeared to be an audited multisig escrow contract. The counterparty exploited an obscured fallback function to drain the escrowed funds. ReclaimDAO tracked the operator and recovered 100% of the funds.',
    sections: [
      {
        heading: 'The OTC Arrangement: A Private Transaction',
        paragraphs: [
          'My name is David Kowalski, an executive in Chicago, Illinois. My private family office was executing an over-the-counter purchase of Bitcoin and Ether valued at $210,000.',
          'To avoid market slippage on public order books, we agreed with the counterparty to use a custom smart contract escrow. The seller provided a GitHub repository and an audit report displaying a clean bill of health purportedly verified by reputable security auditors.',
          'We reviewed the contract code and deposited the $210,000 USDC into the escrow smart contract.'
        ]
      },
      {
        heading: 'The Heist: Re-Entrancy and Flash Drain',
        paragraphs: [
          'The moment our funds were confirmed in the escrow, the counterparty executed an undocumented fallback call. Instead of waiting for the dual-signature release, the contract executed a re-entrancy loop that cleared the contract balance into an unlisted address.',
          'The counterparty immediately disconnected from our communications channel. The audit badge they had displayed was completely fabricated.',
          'Losing $210,000 of fiduciary capital threatened our entire business operation and caused immense distress.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Bytecode Reconstruction',
        paragraphs: [
          'We turned to ReclaimDAO for urgent forensic intervention. Their smart contract engineering team analyzed the malicious transaction on the execution layer.',
          'They traced the gas-funding origin of the deployer wallet back six months to an exchange deposit wallet tied to an individual residing in North America.',
          'ReclaimDAO drafted an exhaustive, court-ready forensic affidavit detailing the exact transaction flow, the contract exploit mechanics, and the direct attribution to the perpetrator.'
        ]
      },
      {
        heading: 'Judicial Freezing & Complete Recovery',
        paragraphs: [
          'Federal authorities, acting on ReclaimDAO\'s evidentiary filing, served an asset freeze order on the exchange where the perpetrator held active collateral.',
          'The full $210,000 was successfully sequestered before it could be laundered through mixing protocols.',
          'Following legal adjudication, the capital was returned to our firm\'s custody in full. ReclaimDAO demonstrated forensic precision at the highest level.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Fabricated Escrow Smart Contract with Re-Entrancy Vector',
      network: 'Ethereum Mainnet (USDC)',
      hopsTraced: '8 Execution Layer Hops',
      counterpartyStatus: 'Domestic Exchange Account Restrained',
      recoveryTimeline: '26 Days to Asset Injunction',
      restitutionRate: '100% Full Restitution'
    }
  },
  {
    id: '10',
    name: 'Oliver Wright',
    location: 'Birmingham, West Midlands • UK',
    image: L10Img,
    tag: 'CASE #10 • RESTITUTION COMPLETE',
    status: 'Claim Documented',
    refundedAmount: '$142,800 Refunded',
    rawAmount: '$142,800',
    date: 'January 05, 2026',
    category: 'Cryptographic Vendor Invoice Hijack',
    investigator: 'Forensic Investigator P. Gallagher (Former NCA Cyber Officer)',
    headline: 'Birmingham Business Owner Oliver Wright Restores $142,800 Siphoned via Invoice Tampering',
    pullQuote: '"Our legitimate hardware supplier was real. But cyber attackers compromised the email thread and silently altered the settlement wallet."',
    summary: 'Oliver was settling an international hardware procurement invoice for $142,800 via digital assets. Adversaries compromised the vendor\'s mail server and quietly substituted the payment address. ReclaimDAO traced the rapid hopping of funds to an offshore gateway and initiated an immediate freeze.',
    sections: [
      {
        heading: 'The Commercial Transaction: A Major Procurement',
        paragraphs: [
          'My name is Oliver Wright, managing director of an advanced manufacturing consultancy in Birmingham, UK. We had finalized an agreement with a German hardware manufacturer to purchase precision robotic tooling valued at $142,800.',
          'Given the cross-border nature of the delivery, the supplier requested payment in USDT for immediate settlement and dispatch.',
          'We received the finalized invoice PDF directly from the supplier\'s senior sales executive\'s verified email address, complete with payment address and cryptographic QR code.'
        ]
      },
      {
        heading: 'The Breach: Man-in-the-Middle Invoice Swap',
        paragraphs: [
          'We authorized the payment of $142,800 from our treasury. Three days later, the German supplier inquired when they should expect our settlement.',
          'An urgent investigation revealed that threat actors had breached the supplier\'s Microsoft 365 tenant, monitored the conversation until the invoice was generated, and substituted the PDF with an identical document containing the attacker\'s wallet address.',
          'Our funds had landed in a criminal syndicate\'s collection address rather than our vendor\'s corporate account.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Trace to the Off-Ramp Gateway',
        paragraphs: [
          'Within 4 hours of discovering the breach, we engaged ReclaimDAO. Their analysts initiated continuous transaction tracing across cross-chain bridges.',
          'The scammers attempted to peel the $142,800 through multiple micro-swaps on decentralized liquidity pools to blur the asset history.',
          'ReclaimDAO\'s tracing cluster matched the outbound transactions to a registered financial services exchange in Europe where the threat actor was preparing to withdraw into fiat bank accounts.'
        ]
      },
      {
        heading: 'Injunction, Seizure & Full Restitution',
        paragraphs: [
          'ReclaimDAO facilitated an emergency alert package that was submitted to the exchange\'s anti-fraud department and the UK National Crime Agency (NCA).',
          'The exchange placed an administrative freeze on the beneficiary account within 90 minutes of the notification.',
          'The entire $142,800 was preserved and returned through official judicial restitution. ReclaimDAO saved our manufacturing firm from a catastrophic commercial loss.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Email Account Compromise & Invoice Substitution (BEC)',
      network: 'Ethereum Mainnet & Tron Network',
      hopsTraced: '15 High-Velocity Peels',
      counterpartyStatus: 'European Crypto Off-Ramp Seized',
      recoveryTimeline: '23 Days Expedited Recovery',
      restitutionRate: '100% of Documented Loss'
    }
  },
  {
    id: '11',
    name: 'Marcus J. Reynolds',
    location: 'Atlanta, Georgia • USA',
    image: L11Img,
    tag: 'CASE #11 • RESTITUTION COMPLETE',
    status: 'Claim Verified',
    refundedAmount: '$265,000 Refunded',
    rawAmount: '$265,000',
    date: 'January 14, 2026',
    category: 'Cloud Key Leak & Automated Sandwich Bot',
    investigator: 'Lead Threat Researcher N. Patel (SANS GIAC & TRM Certified)',
    headline: 'Atlanta Tech Founder Marcus J. Reynolds Reclaims $265,000 Siphoned by Automated Bot Sweepers',
    pullQuote: '"An accidental environment file push exposed our private key for less than ninety seconds. An automated predator bot swept everything."',
    summary: 'Marcus accidentally exposed an environment configuration file during a routine cloud migration. An automated mempool sweeper bot identified the private key and siphoned $265,000 in seconds. ReclaimDAO analyzed the bot\'s contract logic, traced its withdrawal routes, and recovered the funds.',
    sections: [
      {
        heading: 'The Incident: Ninety Seconds of Exposure',
        paragraphs: [
          'My name is Marcus J. Reynolds, a software founder based in Atlanta, Georgia. During an urgent server migration late on a Friday evening, an automated deployment script inadvertently committed a private configuration file containing a key fragment to a public repository.',
          'I noticed the error within ninety seconds and immediately scrubbed the commit history. But in Web3, ninety seconds is an eternity.',
          'Automated mempool predator bots that continuously crawl public repositories had already indexed the key.'
        ]
      },
      {
        heading: 'The Drain: Instantaneous Programmatic Sweeping',
        paragraphs: [
          'Before I could transfer the funds to cold storage, an automated sweeper bot submitted high-gas transactions directly through Flashbots private RPC.',
          'In a single block, $265,000 in wrapped tokens and protocol liquidity positions were completely drained from the address.',
          'I sat frozen in my chair. Years of engineering work and startup operational reserves had vanished in an instant.'
        ]
      },
      {
        heading: 'Decompiling the Bot: ReclaimDAO\'s Counter-Offensive',
        paragraphs: [
          'On the recommendation of an industry security adviser, I filed a priority case with ReclaimDAO. Their threat researchers immediately deconstructed the bot contract that executed the sweep.',
          'They discovered that the bot operator used an automated profit-distribution smart contract that periodically routed stolen funds into identifiable exchange deposit addresses to settle server infrastructure bills.',
          'ReclaimDAO generated an exhaustive forensic timeline proving that every token in the bot\'s profit pool derived directly from our hijacked wallet address.'
        ]
      },
      {
        heading: 'Freezing the Operator & Full Restitution',
        paragraphs: [
          'ReclaimDAO worked in tandem with the FBI Cyber Division and exchange compliance officers to freeze the bot operator\'s centralized accounts.',
          'The freeze captured the entire $265,000 balance before the bot operator could liquidate the assets.',
          'Following formal civil forfeiture proceedings, the full $265,000 was restored to our corporate treasury. ReclaimDAO proved that even automated bots cannot escape deterministic blockchain forensics.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Mempool Predator Bot & Public Key Harvesting',
      network: 'Ethereum Mainnet (Flashbots Private RPC)',
      hopsTraced: '6 Automated Bot Contract Transfers',
      counterpartyStatus: 'Bot Operator Exchange Account Frozen',
      recoveryTimeline: '31 Days from Incident',
      restitutionRate: '100% Restitution Completed'
    }
  },
  {
    id: '12',
    name: 'Kwame Adewale',
    location: 'Bristol, South West England • UK',
    image: L12Img,
    tag: 'CASE #12 • RESTITUTION COMPLETE',
    status: 'Restitution Approved',
    refundedAmount: '$158,400 Refunded',
    rawAmount: '$158,400',
    date: 'January 22, 2026',
    category: 'Staking Vault Flash-Loan Rug Pull',
    investigator: 'DeFi Forensics Specialist L. Moreau (Certified Ethereum Security Professional)',
    headline: 'Bristol FinTech Specialist Kwame Adewale Recovers $158,400 from Staking Protocol Rug Pull',
    pullQuote: '"The protocol promised audited, market-neutral staking rewards. In truth, the developers executed an unannounced liquidity drain."',
    summary: 'Kwame deposited $158,400 into a decentralized staking vault with a verified audit badge. The protocol developers executed an unauthorized flash loan attack that manipulated the vault collateral ratio and swept user funds. ReclaimDAO unraveled the mixer transactions and recovered all assets.',
    sections: [
      {
        heading: 'The Commitment: An Audited Staking Vault',
        paragraphs: [
          'My name is Kwame Adewale, residing in Bristol, United Kingdom. With a background in financial risk, I spent weeks vetting decentralized staking protocols before committing capital.',
          'I selected a yield optimization vault that possessed a verified security audit from a recognized Web3 auditing firm and had over $12 million in Total Value Locked (TVL).',
          'I committed $158,400 of my personal savings into the yield strategy, receiving receipt tokens that represented my share of the underlying collateral.'
        ]
      },
      {
        heading: 'The Exploit: An Engineered Collateral Collapse',
        paragraphs: [
          'In the early hours of a Sunday morning, an unverified smart contract executed an orchestrated flash loan transaction that manipulated the protocol\'s price oracle.',
          'The malicious contract borrowed massive liquidity, artificially inflated the valuation of a low-cap token, and drained the vault\'s liquid collateral, leaving depositors holding worthless receipt tokens.',
          'The protocol team deleted their Discord, Twitter, and website within an hour. It was a textbook rug pull executed under the cover of a simulated market exploit.'
        ]
      },
      {
        heading: 'ReclaimDAO Untangles the Privacy Mixer',
        paragraphs: [
          'I brought the case to ReclaimDAO. Where most investigators gave up due to the perpetrators\' use of privacy mixer protocols, ReclaimDAO\'s team dug deeper.',
          'By analyzing transaction timing, gas price anomalies, and unmixed change outputs that were deposited back into centralized exchanges, ReclaimDAO successfully shattered the mixer\'s pseudo-anonymity.',
          'They proved unequivocally that the developer wallet and the flash-loan borrower were controlled by the identical private entity.'
        ]
      },
      {
        heading: 'Enforcement and Full Asset Return',
        paragraphs: [
          'ReclaimDAO served a comprehensive forensic dossier upon international authorities and the recipient exchanges hosting the unmixed capital.',
          'Regulatory agencies ordered an immediate freeze of the perpetrators\' identified custodial wallets.',
          'Through structured legal restitution, my full $158,400 was recovered and returned. ReclaimDAO demonstrated that sophisticated exploiters cannot outsmart forensic mathematical truth.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Oracle Price Manipulation & Malicious Flash-Loan Exploit',
      network: 'Ethereum Mainnet & Arbitrum',
      hopsTraced: '22 Cross-Protocol Transactions',
      counterpartyStatus: 'Mixer Change Outputs Identified & Frozen',
      recoveryTimeline: '41 Days to Complete Settlement',
      restitutionRate: '100% of Documented Principal'
    }
  },
  {
    id: '13',
    name: 'Graeme MacIntyre',
    location: 'Perth, Western Australia • Australia',
    image: L13Img,
    tag: 'CASE #13 • RESTITUTION COMPLETE',
    status: 'Claim Documented',
    refundedAmount: '$289,000 Refunded',
    rawAmount: '$289,000',
    date: 'February 02, 2026',
    category: 'SIM-Swap & Centralized Custody Hijack',
    investigator: 'Senior Forensic Lead C. Becker (Former AFP Cyber Analyst)',
    headline: 'Perth Executive Graeme MacIntyre Recovers $289,000 Following Targeted SIM-Swap Attack',
    pullQuote: '"My phone abruptly showed \'No Service\'. By the time I reached the telecom store, my entire custodial exchange account had been liquidated."',
    summary: 'Graeme suffered an unauthorized carrier SIM-swap that allowed threat actors to intercept SMS 2FA codes and reset credentials on his custodial exchange account. $289,000 was swept into high-velocity transit wallets. ReclaimDAO intervened within 48 hours and secured full restitution.',
    sections: [
      {
        heading: 'The Takeover: A Sudden Signal Loss',
        paragraphs: [
          'My name is Graeme MacIntyre, a business owner based in Perth, Western Australia. On a Tuesday afternoon, my mobile device suddenly disconnected from the mobile network and displayed "No Service."',
          'Assuming it was a temporary carrier outage, I waited an hour before contacting my telecom provider from a landline. To my shock, they informed me that my SIM card had just been ported to a new device at an interstate store.',
          'I felt cold panic wash over me. My primary custodial cryptocurrency exchange used SMS-based two-factor authentication.'
        ]
      },
      {
        heading: 'The Plunder: Account Takeover and Liquidation',
        paragraphs: [
          'I logged onto my computer and tried to access my exchange account. The password had been changed and the backup email reset.',
          'When I finally regained access with exchange emergency support four hours later, the damage was done. $289,000 in Bitcoin and Ether had been liquidated and withdrawn to external non-custodial addresses in four rapid transactions.',
          'The culmination of fifteen years of prudent wealth creation had been plundered in a single afternoon.'
        ]
      },
      {
        heading: 'ReclaimDAO\'s Rapid Response Intervention',
        paragraphs: [
          'I contacted ReclaimDAO within 24 hours of the attack. Their rapid response forensic team mobilized immediately, mapping the outbound blockchain transfers in real-time.',
          'The attackers moved the funds through several intermediary wallets before attempting to deposit the funds across three international exchanges with lax KYC standards.',
          'However, ReclaimDAO\'s automated inter-exchange fraud alert network triggered instant red flags, freezing the funds at the recipient nodes before off-ramping was possible.'
        ]
      },
      {
        heading: 'Legal Seizure & Total Restitution',
        paragraphs: [
          'ReclaimDAO coordinated with the Australian Federal Police (AFP) and international law enforcement to execute urgent formal preservation orders.',
          'Every dollar of the $289,000 was preserved across the recipient exchanges. Following rigorous identity verification and legal processing, the entire sum was repatriated to my secure cold storage.',
          'ReclaimDAO turned an unimaginable nightmare into an absolute victory for truth and justice.'
        ]
      }
    ],
    forensicData: {
      attackVector: 'Carrier SIM-Swap & SMS-2FA Bypass',
      network: 'Bitcoin (BTC) & Ethereum (ETH)',
      hopsTraced: '10 Cross-Network Transactions',
      counterpartyStatus: 'International Exchange Accounts Frozen',
      recoveryTimeline: '27 Days from Emergency Report',
      restitutionRate: '100% of Diverted Assets'
    }
  }
];

export const getCaseById = (id) => {
  if (!id) return null;
  const normalizedId = String(id).padStart(2, '0');
  return CASE_STORIES.find((c) => c.id === normalizedId) || CASE_STORIES[0];
};

export const getAllCases = () => CASE_STORIES;
