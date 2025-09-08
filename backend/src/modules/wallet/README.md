# Wallet System Documentation

## Overview

The wallet system provides a comprehensive solution for managing user balances, transactions, and withdrawals in the Multivendor-Uber application. It supports customers, delivery men, and admin operations.

## Features

### Customer Features
- Store wallet balance
- Pay for orders using wallet
- Receive refunds/cashback into wallet
- Top-up wallet (with Paymob integration ready)
- View transaction history

### Delivery Man Features
- Automatically receive earnings
- Request withdrawals
- View earnings history

### Admin Features
- Approve/reject withdrawals
- Adjust balances manually
- Monitor all transactions
- View withdrawal requests

## Database Models

### Wallet
- `id`: Primary key
- `user_id`: Foreign key to User
- `balance`: Current wallet balance
- `last_updated`: Last balance update timestamp

### WalletTransaction
- `id`: Primary key
- `wallet_id`: Foreign key to Wallet
- `type`: Transaction type (payment, earning, refund, withdrawal, topup, adjustment)
- `amount`: Transaction amount
- `balance_before`: Balance before transaction
- `balance_after`: Balance after transaction
- `description`: Transaction description
- `reference_id`: Related entity ID (order, withdrawal, etc.)
- `reference_type`: Type of reference (order, withdrawal, etc.)
- `status`: Transaction status
- `created_by`: Admin ID for manual adjustments

### WithdrawalRequest
- `id`: Primary key
- `wallet_id`: Foreign key to Wallet
- `amount`: Withdrawal amount
- `bank_account`: Bank account number
- `bank_name`: Bank name
- `account_holder_name`: Account holder name
- `iban`: IBAN (optional)
- `status`: Request status (pending, approved, rejected, processing, completed)
- `rejection_reason`: Reason for rejection
- `processed_by`: Admin ID who processed the request
- `processed_at`: Processing timestamp
- `notes`: Additional notes

## API Endpoints

### Customer Endpoints

#### GET `/api/wallet`
Get wallet balance and recent transactions
- **Authentication**: Required
- **Query Parameters**: `limit` (default: 10)

#### POST `/api/wallet/topup/mock`
Mock top-up for testing (without Paymob)
- **Authentication**: Required
- **Body**: `amount`, `description` (optional)

#### POST `/api/wallet/pay`
Pay for order using wallet
- **Authentication**: Required
- **Body**: `order_id`, `amount`, `description` (optional)

#### POST `/api/wallet/withdraw`
Create withdrawal request
- **Authentication**: Required
- **Body**: `amount`, `bank_account`, `bank_name`, `account_holder_name`, `iban` (optional)

#### GET `/api/wallet/transactions`
Get wallet transactions history
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`, `type`

### System Endpoints

#### POST `/api/wallet/earnings`
Add delivery man earnings
- **Authentication**: Required
- **Body**: `user_id`, `amount`, `description` (optional), `order_id` (optional)

#### POST `/api/wallet/refund`
Refund order amount to wallet
- **Authentication**: Required
- **Body**: `user_id`, `amount`, `description` (optional), `order_id` (optional)

### Admin Endpoints

#### GET `/api/admin/wallet/withdrawals`
Get all withdrawal requests
- **Authentication**: Required (Admin)
- **Query Parameters**: `page`, `limit`, `status`

#### POST `/api/admin/wallet/withdraw/:id/approve`
Approve a withdrawal request
- **Authentication**: Required (Admin)
- **Parameters**: `id` (withdrawal request ID)

#### POST `/api/admin/wallet/withdraw/:id/reject`
Reject a withdrawal request
- **Authentication**: Required (Admin)
- **Parameters**: `id` (withdrawal request ID)
- **Body**: `rejection_reason`

#### POST `/api/admin/wallet/adjust`
Manually adjust user wallet balance
- **Authentication**: Required (Admin)
- **Body**: `user_id`, `amount`, `description`

## Usage Examples

### Customer Pays for Order
```javascript
// 1. Verify wallet balance >= order amount
const walletInfo = await getWalletInfo(userId);

// 2. Deduct order amount from wallet
const result = await deductFunds(userId, orderAmount, `Payment for order #${orderId}`, orderId, 'order');

// 3. Create wallet_transactions record with type='payment'
```

### Delivery Man Completes Delivery
```javascript
// 1. Add earnings to delivery man wallet
const result = await addEarnings(deliverymanId, earningsAmount, 'Delivery earnings', orderId);

// 2. Create wallet_transactions record with type='earning'
```

### Refund an Order
```javascript
// 1. Add refund amount to customer wallet
const result = await refundToWallet(customerId, refundAmount, 'Order refund', orderId);

// 2. Create wallet_transactions record with type='refund'
```

### Delivery Man Requests Withdrawal
```javascript
// 1. Insert new record into withdrawal_requests with status='pending'
const withdrawalRequest = await createWithdrawalRequest(userId, amount, bankDetails);

// 2. When admin approves:
const result = await approveWithdrawal(withdrawalId, adminId);
// - Deduct amount from wallet
// - Create wallet_transactions record with type='withdrawal'
```

## Middleware

### Validation Middleware
- `validateWalletBalance`: Ensures sufficient balance for payments
- `validateWithdrawalAmount`: Validates withdrawal amount and minimum limits
- `validateBankDetails`: Validates bank account information
- `validateAdminAccess`: Ensures admin role for admin operations
- `validateAdjustmentAmount`: Validates manual balance adjustments
- `validatePagination`: Validates pagination parameters

## Security Features

- JWT authentication required for all endpoints
- Role-based access control for admin operations
- Balance validation before transactions
- Transaction logging for audit trail
- Input validation and sanitization

## Error Handling

The system provides comprehensive error handling with appropriate HTTP status codes:
- `400`: Bad Request (validation errors, insufficient balance)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found (wallet or request not found)
- `500`: Internal Server Error (server errors)

## Database Setup

To set up the wallet system:

1. Uncomment the wallet seeder in `server.js`:
```javascript
const syncWalletTables = require('./src/app/models/seeders/walletSeeders');
syncWalletTables();
```

2. Restart the server to create the tables

3. Comment out the seeder after first run

## Integration Notes

- The wallet system is designed to integrate seamlessly with the existing order system
- Delivery man integration is prepared but not yet connected (as requested)
- Paymob integration can be added to the top-up endpoint
- All transactions are logged for audit purposes
- The system follows the existing project patterns and architecture

## Future Enhancements

- Paymob payment gateway integration
- Real-time balance updates via WebSocket
- Transaction notifications
- Bulk withdrawal processing
- Advanced reporting and analytics
- Multi-currency support
