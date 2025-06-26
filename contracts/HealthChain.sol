// contracts/HealthChain.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HealthChain is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    bytes32 public constant PATIENT_ROLE = keccak256("PATIENT_ROLE");
    bytes32 public constant DOCTOR_ROLE = keccak256("DOCTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    Counters.Counter private _recordIds;
    Counters.Counter private _consentIds;
    
    enum ConsentStatus { GRANTED, REVOKED, EXPIRED }
    enum AccessType { READ, WRITE, EMERGENCY }
    enum RecordType { MEDICAL_REPORT, LAB_RESULT, PRESCRIPTION, IMAGING, VACCINE_RECORD, ALLERGY_INFO }
    
    struct MedicalRecord {
        uint256 id;
        address patientAddress;
        address doctorAddress;
        string ipfsHash;
        string metadataHash;
        RecordType recordType;
        uint256 timestamp;
        bool isActive;
    }
    
    struct ConsentGrant {
        uint256 id;
        address patient;
        address doctor;
        uint256[] allowedRecordIds;
        AccessType accessType;
        ConsentStatus status;
        uint256 grantedAt;
        uint256 expiresAt;
        string purpose;
    }
    
    struct AccessLog {
        address accessor;
        uint256 recordId;
        AccessType accessType;
        uint256 timestamp;
        string purpose;
    }
    
    mapping(uint256 => MedicalRecord) public medicalRecords;
    mapping(uint256 => ConsentGrant) public consentGrants;
    mapping(address => uint256[]) public patientRecords;
    mapping(address => uint256[]) public patientConsents;
    mapping(uint256 => AccessLog[]) public recordAccessLogs;
    mapping(address => address[]) public emergencyContacts;
    mapping(address => bool) public emergencyOverride;
    
    event RecordCreated(uint256 indexed recordId, address indexed patient, string ipfsHash);
    event ConsentGranted(uint256 indexed consentId, address indexed patient, address indexed doctor);
    event ConsentRevoked(uint256 indexed consentId, address indexed patient, address indexed doctor);
    event RecordAccessed(uint256 indexed recordId, address indexed accessor, AccessType accessType);
    event EmergencyAccessActivated(address indexed patient, address indexed emergencyContact);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }
    
    modifier onlyPatient() {
        require(hasRole(PATIENT_ROLE, msg.sender), "Caller is not a patient");
        _;
    }
    
    modifier onlyDoctor() {
        require(hasRole(DOCTOR_ROLE, msg.sender), "Caller is not a doctor");
        _;
    }
    
    function registerPatient(address patientAddress) external onlyRole(ADMIN_ROLE) {
        _grantRole(PATIENT_ROLE, patientAddress);
    }
    
    function registerDoctor(address doctorAddress) external onlyRole(ADMIN_ROLE) {
        _grantRole(DOCTOR_ROLE, doctorAddress);
    }
    
    function createMedicalRecord(
        string memory ipfsHash,
        string memory metadataHash,
        RecordType recordType
    ) external onlyPatient returns (uint256) {
        _recordIds.increment();
        uint256 recordId = _recordIds.current();
        
        medicalRecords[recordId] = MedicalRecord({
            id: recordId,
            patientAddress: msg.sender,
            doctorAddress: address(0),
            ipfsHash: ipfsHash,
            metadataHash: metadataHash,
            recordType: recordType,
            timestamp: block.timestamp,
            isActive: true
        });
        
        patientRecords[msg.sender].push(recordId);
        
        emit RecordCreated(recordId, msg.sender, ipfsHash);
        return recordId;
    }
    
    function grantConsent(
        address doctor,
        uint256[] memory recordIds,
        AccessType accessType,
        uint256 duration,
        string memory purpose
    ) external onlyPatient returns (uint256) {
        require(hasRole(DOCTOR_ROLE, doctor), "Invalid doctor address");
        
        _consentIds.increment();
        uint256 consentId = _consentIds.current();
        
        uint256 expiresAt = duration > 0 ? block.timestamp + duration : 0;
        
        consentGrants[consentId] = ConsentGrant({
            id: consentId,
            patient: msg.sender,
            doctor: doctor,
            allowedRecordIds: recordIds,
            accessType: accessType,
            status: ConsentStatus.GRANTED,
            grantedAt: block.timestamp,
            expiresAt: expiresAt,
            purpose: purpose
        });
        
        patientConsents[msg.sender].push(consentId);
        
        emit ConsentGranted(consentId, msg.sender, doctor);
        return consentId;
    }
    
    function revokeConsent(uint256 consentId) external onlyPatient {
        ConsentGrant storage consent = consentGrants[consentId];
        require(consent.patient == msg.sender, "Not your consent");
        require(consent.status == ConsentStatus.GRANTED, "Consent not active");
        
        consent.status = ConsentStatus.REVOKED;
        
        emit ConsentRevoked(consentId, msg.sender, consent.doctor);
    }
    
    function accessRecord(uint256 recordId, string memory purpose) external onlyDoctor nonReentrant {
        MedicalRecord storage record = medicalRecords[recordId];
        require(record.isActive, "Record not found or inactive");
        
        bool hasAccess = false;
        AccessType accessType = AccessType.READ;
        
        uint256[] memory consents = patientConsents[record.patientAddress];
        for (uint256 i = 0; i < consents.length; i++) {
            ConsentGrant storage consent = consentGrants[consents[i]];
            if (consent.doctor == msg.sender && 
                consent.status == ConsentStatus.GRANTED &&
                (consent.expiresAt == 0 || consent.expiresAt > block.timestamp)) {
                
                for (uint256 j = 0; j < consent.allowedRecordIds.length; j++) {
                    if (consent.allowedRecordIds[j] == recordId) {
                        hasAccess = true;
                        accessType = consent.accessType;
                        break;
                    }
                }
                if (hasAccess) break;
            }
        }
        
        if (!hasAccess && emergencyOverride[record.patientAddress]) {
            address[] memory contacts = emergencyContacts[record.patientAddress];
            for (uint256 i = 0; i < contacts.length; i++) {
                if (contacts[i] == msg.sender) {
                    hasAccess = true;
                    accessType = AccessType.EMERGENCY;
                    break;
                }
            }
        }
        
        require(hasAccess, "Access denied");
        
        recordAccessLogs[recordId].push(AccessLog({
            accessor: msg.sender,
            recordId: recordId,
            accessType: accessType,
            timestamp: block.timestamp,
            purpose: purpose
        }));
        
        emit RecordAccessed(recordId, msg.sender, accessType);
    }
    
    function setEmergencyContacts(address[] memory contacts) external onlyPatient {
        emergencyContacts[msg.sender] = contacts;
    }
    
    function activateEmergencyAccess(address patient) external {
        require(hasRole(PATIENT_ROLE, patient), "Invalid patient");
        
        address[] memory contacts = emergencyContacts[patient];
        bool isEmergencyContact = false;
        for (uint256 i = 0; i < contacts.length; i++) {
            if (contacts[i] == msg.sender) {
                isEmergencyContact = true;
                break;
            }
        }
        
        require(isEmergencyContact || hasRole(ADMIN_ROLE, msg.sender), "Not authorized for emergency access");
        
        emergencyOverride[patient] = true;
        emit EmergencyAccessActivated(patient, msg.sender);
    }
    
    function deactivateEmergencyAccess() external onlyPatient {
        emergencyOverride[msg.sender] = false;
    }
    
    function getPatientRecords(address patient) external view returns (uint256[] memory) {
        return patientRecords[patient];
    }
    
    function getPatientConsents(address patient) external view returns (uint256[] memory) {
        return patientConsents[patient];
    }
    
    function getRecordAccessLogs(uint256 recordId) external view returns (AccessLog[] memory) {
        return recordAccessLogs[recordId];
    }
    
    function isConsentValid(uint256 consentId) external view returns (bool) {
        ConsentGrant storage consent = consentGrants[consentId];
        return consent.status == ConsentStatus.GRANTED && 
               (consent.expiresAt == 0 || consent.expiresAt > block.timestamp);
    }
    
    function getRecordDetails(uint256 recordId) external view returns (
        address patient,
        string memory ipfsHash,
        RecordType recordType,
        uint256 timestamp
    ) {
        MedicalRecord storage record = medicalRecords[recordId];
        require(record.isActive, "Record not found");
        
        bool hasAccess = false;
        
        if (record.patientAddress == msg.sender) {
            hasAccess = true;
        } else if (hasRole(DOCTOR_ROLE, msg.sender)) {
            uint256[] memory consents = patientConsents[record.patientAddress];
            for (uint256 i = 0; i < consents.length; i++) {
                ConsentGrant storage consent = consentGrants[consents[i]];
                if (consent.doctor == msg.sender && 
                    consent.status == ConsentStatus.GRANTED &&
                    (consent.expiresAt == 0 || consent.expiresAt > block.timestamp)) {
                    hasAccess = true;
                    break;
                }
            }
        }
        
        return (
            record.patientAddress,
            hasAccess ? record.ipfsHash : "",
            record.recordType,
            record.timestamp
        );
    }
}