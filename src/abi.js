export const abi = [
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "cid", type: "string" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "AccessRevoked",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "string", name: "cid", type: "string" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bool", name: "added", type: "bool" },
    ],
    name: "AccessUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "cid", type: "string" },
    ],
    name: "FileDeleted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "string", name: "cid", type: "string" },
      {
        indexed: false,
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      { indexed: false, internalType: "string", name: "name", type: "string" },
    ],
    name: "FileStored",
    type: "event",
  },
  {
    inputs: [{ internalType: "string", name: "_cid", type: "string" }],
    name: "deleteCID",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsersPublic",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_cid", type: "string" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "removeAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieve",
    outputs: [
      {
        components: [
          { internalType: "string", name: "cid", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          {
            internalType: "address[]",
            name: "peopleWithAccess",
            type: "address[]",
          },
        ],
        internalType: "struct IPFSStorage.FileEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "retrieveSharedFiles",
    outputs: [
      {
        components: [
          { internalType: "string", name: "cid", type: "string" },
          { internalType: "uint256", name: "timestamp", type: "uint256" },
          { internalType: "string", name: "name", type: "string" },
          {
            internalType: "address[]",
            name: "peopleWithAccess",
            type: "address[]",
          },
        ],
        internalType: "struct IPFSStorage.FileEntry[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_cid", type: "string" },
      { internalType: "string", name: "_name", type: "string" },
    ],
    name: "store",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "_cid", type: "string" },
      { internalType: "address", name: "_user", type: "address" },
    ],
    name: "updateAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
