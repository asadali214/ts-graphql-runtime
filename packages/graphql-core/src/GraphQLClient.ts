import { GraphQLClientConfig } from './GraphQLClientConfig';

enum QueryType {
  Query = 'query',
  Mutation = 'mutation'
}

export class GraphQLClient {
  private config: GraphQLClientConfig;

  constructor(config: GraphQLClientConfig) {
    this.config = {
      baseUrl: config.baseUrl,
      timeout: config.timeout ?? 30000,
      headers: config.headers ?? {},
    };
  }

  async executeQuery<T>(
    operationName: string,
    queryObj: Record<string, any>,
    variables?: Record<string, any>,
    types?: Record<string, string>
  ): Promise<T> {
    const query = this.buildQuery(
      QueryType.Query,
      types ?? {},
      operationName,
      variables ? Object.keys(variables) : [],
      this.buildFields(queryObj)
    );
    return this.execute<T>(query, variables);
  }

  async executeMutation<T>(
    operationName: string,
    queryObj: Record<string, any>,
    variables?: Record<string, any>,
    types?: Record<string, string>
  ): Promise<T> {
    const query = this.buildQuery(
      QueryType.Mutation,
      types ?? {},
      operationName,
      variables ? Object.keys(variables) : [],
      this.buildFields(queryObj)
    );
    return this.execute<T>(query, variables);
  }

  private async execute<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const body = JSON.stringify({ query, variables });
    console.log('GraphQL Request Body:', body); // Debug log
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    try {
      const res = await fetch(this.config.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.config.headers },
        body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.errors) {
        throw new Error(JSON.stringify(json.errors));
      }
      return json.data[Object.keys(json.data)[0]];
    } catch (err) {
      if ((err as any).name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw err;
    }
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
