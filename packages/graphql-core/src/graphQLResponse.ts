export type GraphQLResponse<T> = {
  data?: Record<string, T>;
  errors?: object[];
};
