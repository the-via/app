module.exports = function cssModulesFix(source) {
  return source.replace(
    /_(\w+)_[\w\d]{5}_\d+/g,
    function (fullMatch, originalSelector) {
      return originalSelector;
    },
  );
};
