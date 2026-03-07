require("@nomicfoundation/hardhat-toolbox@hh2");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      accounts: [
        "0x3c0f64b1b6e0072a24db921d4a84acbc2f09ce9534dfa48a6674a3f55a087bf7",
        "0x86ce6ac05cb54ddb149fa407d4316b733df07dfcedcc885acb8ac795a1d1dd1c",
        "0xfdd84e42cb8c7d1f792493301e116bef9e7a00d0d60f4aa955ca33ad238f79ac"
      ],
    },
    baseSepolia: {
      url: process.env.BASE_RPC_URL || "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY].filter(Boolean),
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
};