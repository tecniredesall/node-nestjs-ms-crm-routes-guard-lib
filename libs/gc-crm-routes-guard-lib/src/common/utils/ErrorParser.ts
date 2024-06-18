export const CustomError = (
  internalCode: string,
  title: string,
  detail: any,
  stack = '',
) => {
  const error = { internal_code: internalCode, title, detail, stack };
  return error;
};
