import { array, GraphQLClient, lazy, number, object, optional, QueryType, Schema, string } from '../src';

describe('GraphQLClient', () => {
  const baseUrl = 'http://localhost:4000';
  const config = { baseUrl };

  const accountSchema: Schema<any> = object({
    id: ['id', optional(string())],
    user: ['user', optional(lazy(() => userSchema))],
    type: ['type', optional(string())],
    balance: ['balance', optional(number())],
    currency: ['currency', optional(string())],
    transactions: ['transactions', optional(array(lazy(() => transactionSchema)))],
  });

  const userSchema: Schema<any> = object({
    id: ['id', optional(string())],
    name: ['name', optional(string())],
    email: ['email', optional(string())],
    accounts: ['accounts', optional(array(accountSchema))],
  });

  const transactionSchema: Schema<any> = object({
    id: ['id', optional(string())],
    account: ['account', optional(accountSchema)],
    timestamp: ['timestamp', optional(string())],
    description: ['description', optional(string())],
    amount: ['amount', optional(number())],
    currency: ['currency', optional(string())],
    balanceAfter: ['balanceAfter', optional(number())],
    category: ['category', optional(string())], 
  });

  const paymentSchema: Schema<any> = object({
    id: ['id', optional(string())],
    fromAccount: ['fromAccount', optional(accountSchema)],
    toAccount: ['toAccount', optional(accountSchema)],
    amount: ['amount', optional(number())],
    currency: ['currency', optional(string())],
    timestamp: ['timestamp', optional(string())],
    status: ['status', optional(string())],
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
