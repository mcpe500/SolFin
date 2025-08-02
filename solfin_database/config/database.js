// Database configuration for sharded SQLite setup
module.exports = {
  shards: {
    // User-related data shard
    users: {
      path: './shards/users.db',
      tables: ['users', 'user_sessions', 'user_preferences']
    },
    // Financial accounts shard
    accounts: {
      path: './shards/accounts.db',
      tables: ['accounts', 'account_balances']
    },
    // Transactions shard (can be further partitioned by date)
    transactions: {
      path: './shards/transactions.db',
      tables: ['transactions', 'transaction_splits']
    },
    // Pouches and goals shard
    pouches: {
      path: './shards/pouches.db',
      tables: ['pouches', 'goals', 'pouch_shares']
    },
    // Transfers shard
    transfers: {
      path: './shards/transfers.db',
      tables: ['transfers']
    }
  },
  
  // Load balancing configuration
  loadBalancer: {
    readReplicas: 3, // Number of read replicas per shard
    writeTimeout: 5000,
    readTimeout: 3000,
    maxConnections: 100
  },

  // Sharding strategy
  shardingStrategy: {
    users: 'user_id',
    accounts: 'user_id',
    transactions: 'user_id', // Could also shard by date
    pouches: 'user_id',
    transfers: 'user_id'
  }
};