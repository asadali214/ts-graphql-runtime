import { AbortError, GraphQLClientConfig, GraphQLResponse } from '.';
import { HttpClient } from '@apimatic/axios-client-adapter';
import { HttpRequest } from '@apimatic/core-interfaces';

enum QueryType {
  Query = 'query',
  Mutation = 'mutation'
}

export class GraphQLClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private httpClient: HttpClient;

  constructor(config: GraphQLClientConfig) {
    this.baseUrl = config.baseUrl;
    this.headers = config.headers ?? {};
    this.httpClient = new HttpClient(AbortError, {
      timeout: config.timeout,
    });
  }

  async executeQuery<T>(
    operationName: string,
    queryObj: Record<string, any>,
    variables?: Record<string, any>,
    types?: Record<string, string>
  ): Promise<GraphQLResponse<T>> {
    const query = this.buildQuery(
      QueryType.Query,
      types ?? {},
      operationName,
      variables ? Object.keys(variables) : [],
      this.buildFields(queryObj)
    );
    return this.execute(query, variables);
  }

  async executeMutation<T>(
    operationName: string,
    queryObj: Record<string, any>,
    variables?: Record<string, any>,
    types?: Record<string, string>
  ): Promise<GraphQLResponse<T>> {
    const query = this.buildQuery(
      QueryType.Mutation,
      types ?? {},
      operationName,
      variables ? Object.keys(variables) : [],
      this.buildFields(queryObj)
    );
    return this.execute(query, variables);
  }

  private async execute<T>(query: string, variables?: Record<string, any>): Promise<GraphQLResponse<T>> {
    const request: HttpRequest = {
      method: 'POST',
      url: this.baseUrl,
      headers: { ...this.headers, 'Content-Type': 'application/json' },
      body: {
        type: 'text',
        content: JSON.stringify({ query, variables })
      }
    };
    const response = await this.httpClient.executeRequest(request);

    return typeof response.body === 'string'
      ? JSON.parse(response.body)
      : { data: {}, errors: [] };
  }

  private buildQuery(
    operation: QueryType,
    types: Record<string, string>,
    operationName: string,
    variables: string[],
    fields: string,
    ): string {
    const varNames = variables.length > 0 ?
        `(${variables.map(v => `${v}: $${v}`).join(', ')})` : '';
    const filteredTypes = Object.keys(types).filter(t => variables.includes(t));
    const typeDefs = filteredTypes.length > 0 ?
        `(${filteredTypes.map(t => `$${t}: ${types[t]}`).join(', ')})` : '';

    return `${operation}${typeDefs} { ${operationName}${varNames} {${fields}} }`;
  }

  private buildFields(obj: Record<string, any>): string {
    return Object.entries(obj)
      .filter(([_, v]) => v)
      .map(([k, v]) => {
        if (typeof v === 'object') {
          return `${k} {${this.buildFields(v)}}`;
        }
        return k;
      })
    .join(' ');
  }
}
