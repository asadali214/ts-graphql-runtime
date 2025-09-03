import { array, GraphQLClient, lazy, number, object, optional, QueryType, Schema, string } from '../src';

interface User {
  id?: string;
  name?: string;
  email?: string;
  accounts?: Account[];
}

export interface Account {
  id?: string;
  user?: User;
  type?: string;
  balance?: number;
  currency?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  id?: string;
  account?: Account;
  timestamp?: string;
  description?: string;
  amount?: number;
  currency?: string;
  balanceAfter?: number;
  category?: string;
}

describe('GraphQLClient', () => {
  const baseUrl = 'http://localhost:4000';
  const config = { baseUrl };

  const accountSchema: Schema<Account> = object({
    id: ['id', optional(string())],
    user: ['user', optional(lazy(() => userSchema))],
    type: ['type', optional(string())],
    balance: ['balance', optional(number())],
    currency: ['currency', optional(string())],
    transactions: ['transactions', optional(array(lazy(() => transactionSchema)))],
  });

  const userSchema: Schema<User> = object({
    id: ['id', optional(string())],
    name: ['name', optional(string())],
    email: ['email', optional(string())],
    accounts: ['accounts', optional(array(accountSchema))],
  });

  const transactionSchema: Schema<Transaction> = object({
    id: ['id', optional(string())],
    account: ['account', optional(accountSchema)],
    timestamp: ['timestamp', optional(string())],
    description: ['description', optional(string())],
    amount: ['amount', optional(number())],
    currency: ['currency', optional(string())],
    balanceAfter: ['balanceAfter', optional(number())],
    category: ['category', optional(string())], 
  });

  it('should execute a query', async () => {
    const client = new GraphQLClient(config);
    const result = await client.execute(
      'currentUser',
      QueryType.Query,
      { id: true, name: true, accounts: { id: true, balance: true } },
      userSchema
    );
    expect(result.data).toEqual({ id: "1", name: 'Test User', accounts: [{ id: "101", balance: 1000 }] });
    expect(result.errors).toBeUndefined();
    expect(result.extensions).toBeUndefined();
  });
});
