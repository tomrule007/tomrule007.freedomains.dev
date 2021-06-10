export const sendQuery = (query) => {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      operationName: null,
      variables: {},
      query,
    }),
  })
    .then((r) => r.json())
    .then((r) => r.data);
};

export default { sendQuery };
