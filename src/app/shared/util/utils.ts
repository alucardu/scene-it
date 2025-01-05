export function mapFirestoreFields(fields: any): any {
  const mappedData: any = {};
  for (const key in fields) {
    if (fields.hasOwnProperty(key)) {
      // Firestore stores values in objects like { stringValue, integerValue, etc. }
      const valueKey = Object.keys(fields[key])[0]; // e.g., 'stringValue', 'integerValue'
      mappedData[key] = fields[key][valueKey];
    }
  }
  return mappedData;
}
