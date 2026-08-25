export const lambda_handler = async (event) => {
  const id = event.pathParameters.id;
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "get_todos hit", id })
  };
};