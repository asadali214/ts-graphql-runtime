import { GraphQLClient } from '../src/GraphQLClient';

describe('GraphQLClient', () => {
  const baseUrl = 'http://localhost:4000';
  const config = { baseUrl };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be instantiated with a config', () => {
    const client = new GraphQLClient(config);
    expect(client).toBeInstanceOf(GraphQLClient);
  });

  it('should execute a query', async () => {
    const client = new GraphQLClient(config);
    const mockResponse = {
      json: async () => ({ data: { testQuery: { id: 1, name: 'Test' } } }),
      ok: true,
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    const result = await client.executeQuery('testQuery', { id: true, name: true });
    expect(result).toEqual({ id: 1, name: 'Test' });
  });

  it('should execute a mutation', async () => {
    const client = new GraphQLClient(config);
    const mockResponse = {
      json: async () => ({ data: { testMutation: { success: true } } }),
      ok: true,
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
    const result = await client.executeMutation('testMutation', { success: true });
    expect(result).toEqual({ success: true });
  });
});
