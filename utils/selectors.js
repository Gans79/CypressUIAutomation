const selectorByAttributeValue = (attr, value) => `[${attr}='${value}']`;

// A pseudo-random class suffix gets attached to our React compoenents, this bypasses that by specifiying a prefix class
const selectorByClassPrefix = prefix => `[class*='${prefix}']`;

const selectorById = id => `#${id}`;

module.exports = {
    selectorByAttributeValue,
    selectorByClassPrefix,
    selectorById
};