exports.handler = async (event) => {
  console.log('request: ', JSON.stringify(event, undefined, 2));
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/plain',
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(`Hello, CDK! You've hit ${event.path}\n`)
  }
}