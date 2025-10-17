const parseContactType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;
  const isGender = (contactType) => ['work', 'home', 'personal'].includes(contactType);

  if (isGender(contactType)) return contactType;
};

export const parseFilterParams = (query) => {
  const { contactType } = query;

  const parsedContactType = parseContactType(contactType);

  return {
    contactType: parsedContactType,
  };
};
