// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IPFSStorage {
    struct FileEntry {
        string cid;
        uint256 timestamp;
        string name;
        address[] peopleWithAccess;
        mapping(address => string) encryptedCids; // Map of user addresses to their encrypted versions of CID
    }

    // We need to change the storage structure since FileEntry now has a mapping
    mapping(address => mapping(uint256 => FileEntry)) private userFiles;
    mapping(address => uint256) private userFileCount;
    
    mapping(string => mapping(address => bool)) private accessPermissions;
    mapping(string => address) private cidToOwner; // Track original CID owners
    mapping(address => mapping(string => bool)) private filesSharedWithUser;
    
    // Add user tracking
    address[] private allUsers;
    mapping(address => bool) private isUser;

    event FileStored(address indexed user, string cid, uint256 timestamp, string name);
    event FileDeleted(address indexed user, string cid);
    event AccessUpdated(string cid, address indexed user, bool added, string encryptedCid);
    event AccessRevoked(string cid, address indexed user);

    // Store function
    function store(string memory _cid, string memory _name) external {
        // Add user to tracking if first time
        if (!isUser[msg.sender]) {
            allUsers.push(msg.sender);
            isUser[msg.sender] = true;
        }
        
        uint256 newIndex = userFileCount[msg.sender];
        FileEntry storage newEntry = userFiles[msg.sender][newIndex];
        newEntry.cid = _cid;
        newEntry.timestamp = block.timestamp;
        newEntry.name = _name;
        
        userFileCount[msg.sender]++;
        accessPermissions[_cid][msg.sender] = true;
        cidToOwner[_cid] = msg.sender;

        emit FileStored(msg.sender, _cid, block.timestamp, _name);
    }

    // Retrieve function
    function retrieve() external view returns (
        string[] memory cids,
        uint256[] memory timestamps,
        string[] memory names,
        address[][] memory peopleWithAccess
    ) {
        uint256 count = userFileCount[msg.sender];
        cids = new string[](count);
        timestamps = new uint256[](count);
        names = new string[](count);
        peopleWithAccess = new address[][](count);
        
        for (uint256 i = 0; i < count; i++) {
            FileEntry storage entry = userFiles[msg.sender][i];
            cids[i] = entry.cid;
            timestamps[i] = entry.timestamp;
            names[i] = entry.name;
            
            // Copy people with access
            address[] memory accessList = new address[](entry.peopleWithAccess.length);
            for (uint256 j = 0; j < entry.peopleWithAccess.length; j++) {
                accessList[j] = entry.peopleWithAccess[j];
            }
            peopleWithAccess[i] = accessList;
        }
        
        return (cids, timestamps, names, peopleWithAccess);
    }

    // Retrieve files shared with the user - needs to be updated to return encrypted CIDs
    function retrieveSharedFiles() external view returns (
        string[] memory cids,
        uint256[] memory timestamps,
        string[] memory names,
        address[] memory owners
    ) {
        // First, determine how many files are shared with this user
        uint256 sharedCount = 0;
        
        for (uint256 u = 0; u < allUsers.length; u++) {
            address owner = allUsers[u];
            if (owner == msg.sender) continue; // Skip own files
            
            uint256 ownerFileCount = userFileCount[owner];
            for (uint256 i = 0; i < ownerFileCount; i++) {
                FileEntry storage entry = userFiles[owner][i];
                string memory originCid = entry.cid;
                if (accessPermissions[originCid][msg.sender]) {
                    sharedCount++;
                }
            }
        }
        
        // Now create and populate the result arrays
        cids = new string[](sharedCount);
        timestamps = new uint256[](sharedCount);
        names = new string[](sharedCount);
        owners = new address[](sharedCount);
        
        uint256 resultIndex = 0;
        
        for (uint256 u = 0; u < allUsers.length; u++) {
            address owner = allUsers[u];
            if (owner == msg.sender) continue; // Skip own files
            
            uint256 ownerFileCount = userFileCount[owner];
            for (uint256 i = 0; i < ownerFileCount; i++) {
                FileEntry storage entry = userFiles[owner][i];
                string memory originCid = entry.cid;
                
                if (accessPermissions[originCid][msg.sender]) {
                    // Use the encrypted CID for this user
                    cids[resultIndex] = entry.encryptedCids[msg.sender];
                    timestamps[resultIndex] = entry.timestamp;
                    names[resultIndex] = entry.name;
                    owners[resultIndex] = owner;
                    resultIndex++;
                }
            }
        }
        
        return (cids, timestamps, names, owners);
    }
    
    // Get all users for admin purposes
    function getAllUsersPublic() external view returns (address[] memory) {
        return allUsers;
    }

    // Delete function - updated
    function deleteCID(string memory _cid) external {
        uint256 count = userFileCount[msg.sender];
        for (uint256 i = 0; i < count; i++) {
            if (keccak256(abi.encodePacked(userFiles[msg.sender][i].cid)) == keccak256(abi.encodePacked(_cid))) {
                // Move the last element to the position of the deleted element
                if (i != count - 1) {
                    // Copy data from the last element
                    userFiles[msg.sender][i].cid = userFiles[msg.sender][count - 1].cid;
                    userFiles[msg.sender][i].timestamp = userFiles[msg.sender][count - 1].timestamp;
                    userFiles[msg.sender][i].name = userFiles[msg.sender][count - 1].name;
                    
                    // Handle peopleWithAccess array
                    delete userFiles[msg.sender][i].peopleWithAccess;
                    for (uint j = 0; j < userFiles[msg.sender][count - 1].peopleWithAccess.length; j++) {
                        userFiles[msg.sender][i].peopleWithAccess.push(
                            userFiles[msg.sender][count - 1].peopleWithAccess[j]
                        );
                    }
                }
                
                userFileCount[msg.sender]--;
                delete accessPermissions[_cid][msg.sender];
                delete cidToOwner[_cid];

                emit FileDeleted(msg.sender, _cid);
                return;
            }
        }
        revert("CID not found");
    }

    // Update access function - modified to handle encrypted CIDs
    function updateAccess(string memory _cid, address _user, string memory _encryptedCid) external {
        require(accessPermissions[_cid][msg.sender], "You don't own this CID");

        uint256 count = userFileCount[msg.sender];
        for (uint256 i = 0; i < count; i++) {
            if (keccak256(abi.encodePacked(userFiles[msg.sender][i].cid)) == keccak256(abi.encodePacked(_cid))) {
                userFiles[msg.sender][i].peopleWithAccess.push(_user);
                // Store the encrypted version of the CID for this user
                userFiles[msg.sender][i].encryptedCids[_user] = _encryptedCid;
                accessPermissions[_cid][_user] = true;
                filesSharedWithUser[_user][_cid] = true;

                emit AccessUpdated(_cid, _user, true, _encryptedCid);
                return;
            }
        }
        revert("CID not found");
    }

    // Remove access function - needs updating to handle encrypted CIDs
    function removeAccess(string memory _cid, address _user) external {
        require(accessPermissions[_cid][msg.sender], "You don't own this CID");

        uint256 count = userFileCount[msg.sender];
        for (uint256 i = 0; i < count; i++) {
            if (keccak256(abi.encodePacked(userFiles[msg.sender][i].cid)) == keccak256(abi.encodePacked(_cid))) {
                address[] storage accessList = userFiles[msg.sender][i].peopleWithAccess;
                for (uint256 j = 0; j < accessList.length; j++) {
                    if (accessList[j] == _user) {
                        accessList[j] = accessList[accessList.length - 1];
                        accessList.pop();
                        delete accessPermissions[_cid][_user];
                        delete filesSharedWithUser[_user][_cid];
                        // Delete the encrypted version for this user
                        delete userFiles[msg.sender][i].encryptedCids[_user];

                        emit AccessRevoked(_cid, _user);
                        return;
                    }
                }
                revert("User not found in access list");
            }
        }
        revert("CID not found");
    }
}
