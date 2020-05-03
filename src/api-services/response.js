export const errorResponse = (resultObject) => {
  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'Error',
      error: resultObject,
    }),
  };
};

export const successResponse = (resultObject) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resultObject),
  };
};
