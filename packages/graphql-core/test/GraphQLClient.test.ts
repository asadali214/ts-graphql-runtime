import { GraphQLClient } from '../src';
import { HttpClient } from '@apimatic/axios-client-adapter';

describe('GraphQLClient', () => {
  const baseUrl = 'http://localhost:4000';
  const config = { baseUrl };

  let executeRequestMock: jest.SpyInstance;
  beforeEach(() => {
    executeRequestMock = jest.spyOn(HttpClient.prototype, 'executeRequest');
  });

  afterEach(() => {
    executeRequestMock.mockRestore();
  });

  it('should execute a query', async () => {
    const client = new GraphQLClient(config);
    executeRequestMock.mockResolvedValue({
      body: JSON.stringify({ data: { testQuery: { id: 1, name: 'Test' } }, errors: [] }),
      statusCode: 200,
      headers: {},
    });
    const result = await client.executeQuery('testQuery', { id: true, name: true });
    expect(result.data['testQuery']).toEqual({ id: 1, name: 'Test' });
    expect(result.errors).toEqual([]);
  });

  it('should execute a mutation', async () => {
    const client = new GraphQLClient(config);
    executeRequestMock.mockResolvedValue({
      body: JSON.stringify({ data: { testMutation: { success: true } }, errors: [] }),
      statusCode: 200,
      headers: {},
    });
    const result = await client.executeMutation('testMutation', { success: true });
    expect(result.data['testMutation']).toEqual({ success: true });
    expect(result.errors).toEqual([]);
  });
});
