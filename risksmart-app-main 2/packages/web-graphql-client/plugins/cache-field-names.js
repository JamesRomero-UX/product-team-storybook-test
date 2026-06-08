/** Custom codegen plugin that generates a CacheFieldName union from the schema's root query fields. */
module.exports = {
  plugin(schema) {
    const queryType = schema.getQueryType();
    if (!queryType) return '';
    const fields = Object.keys(queryType.getFields()).sort();
    return `\nexport type CacheFieldName = ${fields.map((f) => `'${f}'`).join('\n  | ')};\n`;
  },
};
