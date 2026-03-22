const { Wallet, WalletTransaction, WithdrawalRequest,adminWallet ,DebtTransaction} = require('../index');

const syncWalletTables = async () => {
  try {
    console.log('🔄 Syncing wallet tables...');
    
    // Sync wallet tables
    await Wallet.sync({ alter: true  });
    await WalletTransaction.sync({ alter: true});
    await WithdrawalRequest.sync({ alter: true });
    await adminWallet.sync({ alter: true });
    await DebtTransaction.sync({ alter: true});
    console.log('✅ Wallet tables synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing wallet tables:', error);
  }
};


module.exports = syncWalletTables;

// Run automatically if executed directly
if (require.main === module) {
  (async () => {
    await module.exports();
  })();
}