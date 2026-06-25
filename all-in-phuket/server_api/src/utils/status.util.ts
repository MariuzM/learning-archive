const statusCodes = {
  400: { status: 400, message: 'Bad Request' },
  401: { status: 401, message: 'Unauthorized' },
  403: { status: 403, message: 'Forbidden' },
  404: { status: 404, message: 'Not Found' },
  500: { status: 500, message: 'Internal Server Error' },
};

export const status = (statusCode: keyof typeof statusCodes, customMsg?: string) => {
  const sC = statusCodes[statusCode];
  const code = { ...sC, message: customMsg || sC.message };
  return { status: code.status, message: code };
};

// export const throwStatus = (statusCode: keyof typeof statusCodes, customMsg?: string) => {
//   const sC = statusCodes[statusCode];
//   const code = { ...sC, message: customMsg || sC.message };
//   throw { status: code.status, message: code };
// };
