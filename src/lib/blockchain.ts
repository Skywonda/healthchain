// lib/blockchain.ts
import { ethers } from "ethers";
import { getIPFSService } from "./ipfs";
import { EncryptionService } from "./encryption";
import type {
  BlockchainTransaction,
  SmartContractEvent,
  WalletConnection,
} from "@/types/blockchain";
import type { RecordType } from "@/types/medical-records";
import { AccessType } from "@/types/consent";

const HEALTHCHAIN_ABI = [
  "function createMedicalRecord(string ipfsHash, string metadataHash, uint8 recordType) returns (uint256)",
  "function grantConsent(address doctor, uint256[] recordIds, uint8 accessType, uint256 duration, string purpose) returns (uint256)",
  "function revokeConsent(uint256 consentId)",
  "function accessRecord(uint256 recordId, string purpose)",
  "function registerPatient(address patientAddress)",
  "function registerDoctor(address doctorAddress)",
  "function setEmergencyContacts(address[] contacts)",
  "function activateEmergencyAccess(address patient)",
  "function deactivateEmergencyAccess()",
  "function getRecordDetails(uint256 recordId) view returns (address, string, uint8, uint256)",
  "function getPatientRecords(address patient) view returns (uint256[])",
  "function getPatientConsents(address patient) view returns (uint256[])",
  "function isConsentValid(uint256 consentId) view returns (bool)",
  "function getRecordAccessLogs(uint256 recordId) view returns (tuple(address,uint256,uint8,uint256,string)[])",
  "event RecordCreated(uint256 indexed recordId, address indexed patient, string ipfsHash)",
  "event ConsentGranted(uint256 indexed consentId, address indexed patient, address indexed doctor)",
  "event ConsentRevoked(uint256 indexed consentId, address indexed patient, address indexed doctor)",
  "event RecordAccessed(uint256 indexed recordId, address indexed accessor, uint8 accessType)",
];

const RECORD_TYPE_MAP: Record<RecordType, number> = {
  MEDICAL_REPORT: 0,
  LAB_RESULT: 1,
  PRESCRIPTION: 2,
  IMAGING: 3,
  VACCINE_RECORD: 4,
  ALLERGY_INFO: 5,
  EMERGENCY_CONTACT: 6,
};

const ACCESS_TYPE_MAP: Record<AccessType, number> = {
  READ: 0,
  WRITE: 1,
  EMERGENCY: 2,
};

export class BlockchainService {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;
  private ipfsService = getIPFSService();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(private contractAddress: string, private providerUrl: string) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(
      contractAddress,
      HEALTHCHAIN_ABI,
      this.provider
    );
  }

  async connectWallet(privateKey?: string): Promise<WalletConnection> {
    if (typeof window !== "undefined" && window.ethereum && !privateKey) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      this.signer = provider.getSigner();
      this.contract = this.contract.connect(this.signer);

      const address = await this.signer.getAddress();
      const network = await provider.getNetwork();

      return {
        address,
        provider: "MetaMask",
        chainId: network.chainId,
        isConnected: true,
      };
    } else if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.contract = this.contract.connect(this.signer);

      const network = await this.provider.getNetwork();

      return {
        address: this.signer.address,
        provider: "Private Key",
        chainId: network.chainId,
        isConnected: true,
      };
    }

    throw new Error("No wallet connection method available");
  }

  async createMedicalRecord(
    file: File,
    recordType: RecordType,
    metadata: any
  ): Promise<{
    recordId: string;
    transaction: BlockchainTransaction;
    ipfsHash: string;
    encryptionKey: string;
  }> {
    if (!this.signer) throw new Error("Wallet not connected");

    const uploadResult = await this.ipfsService.uploadFile(file, true);
    const metadataHash = EncryptionService.hash(JSON.stringify(metadata));

    const tx = await this.contract.createMedicalRecord(
      uploadResult.hash,
      metadataHash,
      RECORD_TYPE_MAP[recordType]
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find((e: any) => e.event === "RecordCreated");
    const recordId = event?.args?.recordId?.toString();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: receipt.gasUsed?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      timestamp: new Date(),
      status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
    };

    return {
      recordId,
      transaction,
      ipfsHash: uploadResult.hash,
      encryptionKey: uploadResult.encryptionKey!,
    };
  }

  async grantConsent(
    doctorAddress: string,
    recordIds: string[],
    accessType: AccessType,
    duration: number,
    purpose: string
  ): Promise<{
    consentId: string;
    transaction: BlockchainTransaction;
  }> {
    if (!this.signer) throw new Error("Wallet not connected");

    const tx = await this.contract.grantConsent(
      doctorAddress,
      recordIds.map((id) => ethers.BigNumber.from(id)),
      ACCESS_TYPE_MAP[accessType],
      duration,
      purpose
    );

    const receipt = await tx.wait();
    const event = receipt.events?.find(
      (e: any) => e.event === "ConsentGranted"
    );
    const consentId = event?.args?.consentId?.toString();

    const transaction: BlockchainTransaction = {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: receipt.gasUsed?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      timestamp: new Date(),
      status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
    };

    return { consentId, transaction };
  }

  async revokeConsent(consentId: string): Promise<BlockchainTransaction> {
    if (!this.signer) throw new Error("Wallet not connected");

    const tx = await this.contract.revokeConsent(
      ethers.BigNumber.from(consentId)
    );
    const receipt = await tx.wait();

    return {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: receipt.gasUsed?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      timestamp: new Date(),
      status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
    };
  }

  async accessRecord(
    recordId: string,
    purpose: string,
    encryptionKey: string
  ): Promise<{
    transaction: BlockchainTransaction;
    fileData: Uint8Array;
    ipfsHash: string;
  }> {
    if (!this.signer) throw new Error("Wallet not connected");

    const accessTx = await this.contract.accessRecord(
      ethers.BigNumber.from(recordId),
      purpose
    );
    const accessReceipt = await accessTx.wait();

    const [, ipfsHash] = await this.contract.getRecordDetails(
      ethers.BigNumber.from(recordId)
    );

    if (!ipfsHash) {
      throw new Error("Access denied or record not found");
    }

    const fileData = await this.ipfsService.downloadFile(
      ipfsHash,
      encryptionKey
    );

    const transaction: BlockchainTransaction = {
      hash: accessReceipt.transactionHash,
      blockNumber: accessReceipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: accessReceipt.gasUsed?.toString(),
      gasPrice: accessTx.gasPrice?.toString(),
      timestamp: new Date(),
      status: accessReceipt.status === 1 ? "CONFIRMED" : "FAILED",
    };

    return { transaction, fileData, ipfsHash };
  }

  async registerUser(
    address: string,
    role: "PATIENT" | "DOCTOR"
  ): Promise<BlockchainTransaction> {
    if (!this.signer) throw new Error("Wallet not connected");

    const tx =
      role === "PATIENT"
        ? await this.contract.registerPatient(address)
        : await this.contract.registerDoctor(address);

    const receipt = await tx.wait();

    return {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: receipt.gasUsed?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      timestamp: new Date(),
      status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
    };
  }

  async getPatientRecords(patientAddress: string): Promise<string[]> {
    const recordIds = await this.contract.getPatientRecords(patientAddress);
    return recordIds.map((id: any) => id.toString());
  }

  async getPatientConsents(patientAddress: string): Promise<string[]> {
    const consentIds = await this.contract.getPatientConsents(patientAddress);
    return consentIds.map((id: any) => id.toString());
  }

  async getRecordDetails(recordId: string): Promise<{
    patient: string;
    ipfsHash: string;
    recordType: number;
    timestamp: number;
  } | null> {
    try {
      const [patient, ipfsHash, recordType, timestamp] =
        await this.contract.getRecordDetails(ethers.BigNumber.from(recordId));

      return {
        patient,
        ipfsHash,
        recordType: recordType.toNumber(),
        timestamp: timestamp.toNumber(),
      };
    } catch (error) {
      console.error("Get record details error:", error);
      return null;
    }
  }

  async getRecordAccessLogs(recordId: string): Promise<any[]> {
    try {
      const logs = await this.contract.getRecordAccessLogs(
        ethers.BigNumber.from(recordId)
      );
      return logs.map((log: any) => ({
        accessor: log.accessor,
        recordId: log.recordId.toString(),
        accessType: log.accessType,
        timestamp: log.timestamp.toNumber(),
        purpose: log.purpose,
      }));
    } catch (error) {
      console.error("Get access logs error:", error);
      return [];
    }
  }

  async isConsentValid(consentId: string): Promise<boolean> {
    try {
      return await this.contract.isConsentValid(
        ethers.BigNumber.from(consentId)
      );
    } catch (error) {
      console.error("Check consent validity error:", error);
      return false;
    }
  }

  async setEmergencyContacts(
    contacts: string[]
  ): Promise<BlockchainTransaction> {
    if (!this.signer) throw new Error("Wallet not connected");

    const tx = await this.contract.setEmergencyContacts(contacts);
    const receipt = await tx.wait();

    return {
      hash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      from: await this.signer.getAddress(),
      to: this.contractAddress,
      gasUsed: receipt.gasUsed?.toString(),
      gasPrice: tx.gasPrice?.toString(),
      timestamp: new Date(),
      status: receipt.status === 1 ? "CONFIRMED" : "FAILED",
    };
  }

  onEvent(eventName: string, callback: Function): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);

    this.contract.on(eventName, (...args) => {
      const event: SmartContractEvent = {
        eventName,
        transactionHash: args[args.length - 1].transactionHash,
        blockNumber: args[args.length - 1].blockNumber,
        args: args.slice(0, -1).reduce((acc, arg, index) => {
          acc[`arg${index}`] = arg.toString();
          return acc;
        }, {}),
        timestamp: new Date(),
      };

      this.eventListeners.get(eventName)?.forEach((cb) => cb(event));
    });
  }

  removeEventListener(eventName: string, callback: Function): void {
    const listeners = this.eventListeners.get(eventName);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
    this.contract.off(eventName, callback as any);
  }

  async getTransactionStatus(
    txHash: string
  ): Promise<"PENDING" | "CONFIRMED" | "FAILED"> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      if (!receipt) return "PENDING";
      return receipt.status === 1 ? "CONFIRMED" : "FAILED";
    } catch (error) {
      return "FAILED";
    }
  }

  async estimateGas(functionName: string, ...args: any[]): Promise<string> {
    try {
      const gasEstimate = await this.contract.estimateGas[functionName](
        ...args
      );
      return ethers.utils.formatUnits(gasEstimate, "gwei");
    } catch (error) {
      console.error("Gas estimation error:", error);
      return "0";
    }
  }

  disconnect(): void {
    this.signer = null;
    this.contract = new ethers.Contract(
      this.contractAddress,
      HEALTHCHAIN_ABI,
      this.provider
    );
    this.eventListeners.clear();
  }
}

let blockchainService: BlockchainService | null = null;

export function getBlockchainService(): BlockchainService {
  if (!blockchainService) {
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;
    const providerUrl = process.env.NEXT_PUBLIC_RPC_URL!;

    if (!contractAddress || !providerUrl) {
      throw new Error("Missing blockchain configuration");
    }

    blockchainService = new BlockchainService(contractAddress, providerUrl);
  }

  return blockchainService;
}
