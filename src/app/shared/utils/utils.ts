type FirestoreDocument = {
  fields: { [key: string]: FirestoreField };
};

type FirestoreField = {
  arrayValue?: {
    values?: { stringValue?: string; integerValue?: string; booleanValue?: boolean }[];
  };
  stringValue?: string;
  integerValue?: string;
  booleanValue?: boolean;
};

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

export function extractAndFlattenFields(
  input: FirestoreDocument | FirestoreDocument[]
): Record<string, any> | Record<string, any>[] {
  // Helper function to flatten a single document
  const flattenDocument = (document: FirestoreDocument): Record<string, any> => {
    const flattenedFields: Record<string, any> = {};

    // Iterate over all keys in the `fields` object
    for (const [key, value] of Object.entries(document.fields)) {
      if (value?.arrayValue?.values) {
        // Handle array values
        flattenedFields[key] = value.arrayValue.values.map((v) =>
          v.stringValue || v.integerValue || v.booleanValue || null
        );
      } else if (value?.stringValue) {
        // Handle string values
        flattenedFields[key] = value.stringValue;
      } else if (value?.integerValue) {
        // Handle integer values
        flattenedFields[key] = Number(value.integerValue);
      } else if (value?.booleanValue) {
        // Handle boolean values
        flattenedFields[key] = value.booleanValue;
      } else {
        // Handle other types or missing values
        flattenedFields[key] = null;
      }
    }

    return flattenedFields;
  };

  // If input is an array, map through it
  if (Array.isArray(input)) {
    return input.map((doc) => flattenDocument(doc));
  }

  // Otherwise, process a single document
  return flattenDocument(input);
}
