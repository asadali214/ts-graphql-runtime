"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLClient = void 0;
var QueryType;
(function (QueryType) {
    QueryType["Query"] = "query";
    QueryType["Mutation"] = "mutation";
})(QueryType || (QueryType = {}));
class GraphQLClient {
    constructor(config) {
        this.config = {
            baseUrl: config.baseUrl,
            timeout: config.timeout ?? 30000,
            headers: config.headers ?? {},
        };
    }
    async executeQuery(operationName, queryObj, variables, types) {
        const query = this.buildQuery(QueryType.Query, types ?? {}, operationName, variables ? Object.keys(variables) : [], this.buildFields(queryObj));
        return this.execute(query, variables);
    }
    async executeMutation(operationName, queryObj, variables, types) {
        const query = this.buildQuery(QueryType.Mutation, types ?? {}, operationName, variables ? Object.keys(variables) : [], this.buildFields(queryObj));
        return this.execute(query, variables);
    }
    async execute(query, variables) {
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
        }
        catch (err) {
            if (err.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw err;
        }
    }
    buildQuery(operation, types, operationName, variables, fields) {
        const varNames = variables.length > 0 ?
            `(${variables.map(v => `${v}: $${v}`).join(', ')})` : '';
        const filteredTypes = Object.keys(types).filter(t => variables.includes(t));
        const typeDefs = filteredTypes.length > 0 ?
            `(${filteredTypes.map(t => `$${t}: ${types[t]}`).join(', ')})` : '';
        return `${operation}${typeDefs} { ${operationName}${varNames} {${fields}} }`;
    }
    buildFields(obj) {
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
exports.GraphQLClient = GraphQLClient;
