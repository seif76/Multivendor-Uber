const { Wallet, WalletTransaction, WithdrawalRequest,adminWallet ,DebtTransaction} = require('../index');

const syncWalletTables = async () => {
  try {
    console.log('🔄 Syncing wallet tables...');
    
    // Sync wallet tables
    await Wallet.sync({ force: false });
    await WalletTransaction.sync({ force: false });
    await WithdrawalRequest.sync({ force: false });
    await adminWallet.sync({ force: false });
    await DebtTransaction.sync({ force: false });
    console.log('✅ Wallet tables synced successfully!');
  } catch (error) {
    console.error('❌ Error syncing wallet tables:', error);
  }
};

module.exports = syncWalletTables;
