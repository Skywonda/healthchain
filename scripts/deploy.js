async function main() {
  const HealthChain = await ethers.getContractFactory("HealthChain");
  const healthChain = await HealthChain.deploy();

  await healthChain.deployed();

  console.log("HealthChain deployed to:", healthChain.address);

  const fs = require('fs');
  const contractData = {
    address: healthChain.address,
    abi: HealthChain.interface.format("json")
  };

  fs.writeFileSync(
    './contracts/contract-data.json',
    JSON.stringify(contractData, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });