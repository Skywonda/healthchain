require("@nomiclabs/hardhat-ethers");
require('dotenv').config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.NEXT_PUBLIC_RPC_URL,
      accounts: [process.env.ADMIN_PRIVATE_KEY]
    }
  },
  paths: {
    sources: "./contracts",
    artifacts: "./artifacts"
  }
};