import { array, GraphQLClient, number, object, optional, QueryType, string } from '../src';
import { startTestServer, stopTestServer } from './testServer';

describe('GraphQLClient', () => {
  beforeAll(async () => {
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
  });
  const baseUrl = 'http://localhost:4404';
  const client = new GraphQLClient({ baseUrl });
  const userSchema = object({
    id: ['id', optional(string())],
    name: ['name', optional(string())],
    accounts: ['accounts', optional(array(object({
      id: ['id', optional(string())],
      balance: ['balance', optional(number())],
    })))],
  });

  it('should execute a valid query', async () => {
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

  it('should execute an invalid query', async () => {
    const result = await client.execute(
      'errorQuery',
      QueryType.Query,
      { id: true, name: true, accounts: { id: true, balance: true } },
      userSchema
    );
    expect(result.data).toBeUndefined();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe('invalid query name');
    expect(result.extensions).toBeUndefined();
  });

  it('should execute a valid query with wrong schema', async () => {
    const wrongSchema = object({
      name: ['name', optional(number())]
    });
    const result = await client.execute(
      'currentUser',
      QueryType.Query,
      { id: true, name: true, accounts: { id: true, balance: true } },
      wrongSchema
    );
    expect(result.data).toBeNull();
    expect(result.errors).toBeDefined();
    expect(result.errors?.[0].message).toBe("Expected value to be of type 'Optional<number>' but found 'string'.\n\nGiven value: \"Test User\"\nType: 'string'\nExpected type: 'Optional<number>'\nPath: name");
    expect(result.extensions).toBeUndefined();
  });
});
