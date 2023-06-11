// This fn take a fn as parameter and return fn if have no any error either have any error catch send to the global error fn
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
