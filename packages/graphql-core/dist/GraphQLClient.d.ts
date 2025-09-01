import { GraphQLClientConfig } from './GraphQLClientConfig';
export declare class GraphQLClient {
    private config;
    constructor(config: GraphQLClientConfig);
    executeQuery<T>(operationName: string, queryObj: Record<string, any>, variables?: Record<string, any>, types?: Record<string, string>): Promise<T>;
    executeMutation<T>(operationName: string, queryObj: Record<string, any>, variables?: Record<string, any>, types?: Record<string, string>): Promise<T>;
    private execute;
    private buildQuery;
    private buildFields;
}
