const sendInternalError = (res, context, error) => {
  console.error(`${context}:`, error);
  return res.status(500).json({ message: 'Internal server error' });
};

module.exports = { sendInternalError };
