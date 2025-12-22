/**
 * 網頁版專用的 Firebase REST API 服務
 * 使用 REST API 替代 Firestore SDK，避免離線問題
 */

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

const FIRESTORE_REST_API = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

/**
 * 使用 REST API 獲取文檔
 */
export const getDocument = async (collection: string, docId: string): Promise<any> => {
  const url = `${FIRESTORE_REST_API}/${collection}/${docId}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // 文檔不存在
      }
      throw new Error(`Failed to get document: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const converted = convertFirestoreDocument(data);
    return converted;
  } catch (error: any) {
    console.error('❌ REST API getDocument error:', error);
    throw error;
  }
};

/**
 * 使用 REST API 創建或更新文檔
 */
export const setDocument = async (
  collection: string,
  docId: string,
  data: any
): Promise<void> => {
  const url = `${FIRESTORE_REST_API}/${collection}/${docId}`;
  
  const firestoreData = convertToFirestoreFormat(data);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: firestoreData,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set document: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('❌ REST API setDocument error:', error);
    throw error;
  }
};

/**
 * 使用 REST API 查詢文檔
 */
export const queryDocuments = async (
  collection: string,
  field: string,
  operator: string,
  value: any
): Promise<any[]> => {
  const url = `${FIRESTORE_REST_API}`;
  
  // 構建查詢 - Firestore REST API 的查詢格式
  const structuredQuery: any = {
    from: [{ collectionId: collection }],
  };

  // 將操作符映射到 Firestore REST API 格式
  const operatorMap: Record<string, string> = {
    '==': 'EQUAL',
    '!=': 'NOT_EQUAL',
    '<': 'LESS_THAN',
    '<=': 'LESS_THAN_OR_EQUAL',
    '>': 'GREATER_THAN',
    '>=': 'GREATER_THAN_OR_EQUAL',
    'in': 'IN',
    'array-contains': 'ARRAY_CONTAINS',
    'ARRAY_CONTAINS': 'ARRAY_CONTAINS',
    'array-contains-any': 'ARRAY_CONTAINS_ANY',
    'ARRAY_CONTAINS_ANY': 'ARRAY_CONTAINS_ANY',
  };

  // 獲取正確的操作符（如果已經是 REST API 格式，直接使用）
  const restApiOperator = operatorMap[operator] || operator;

  structuredQuery.where = {
    fieldFilter: {
      field: { fieldPath: field },
      op: restApiOperator,
      value: convertToFirestoreValue(value),
    },
  };

  try {
    const response = await fetch(`${url}:runQuery`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ structuredQuery }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Query error response:', errorText);
      throw new Error(`Failed to query documents: ${response.status} ${response.statusText}`);
    }

    const results = await response.json();
    return results
      .filter((result: any) => result.document)
      .map((result: any) => {
        const doc = result.document;
        const data = convertFirestoreDocument(doc);
        return data;
      });
  } catch (error: any) {
    console.error('❌ REST API queryDocuments error:', error);
    throw error;
  }
};

/**
 * 使用 REST API 刪除文檔
 */
export const deleteDocument = async (collection: string, docId: string): Promise<void> => {
  const url = `${FIRESTORE_REST_API}/${collection}/${docId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.status} ${response.statusText}`);
    }
  } catch (error: any) {
    console.error('❌ REST API deleteDocument error:', error);
    throw error;
  }
};

/**
 * 將 Firestore REST API 格式轉換為普通物件
 */
function convertFirestoreDocument(doc: any): any {
  if (!doc) {
    return null;
  }

  // 如果已經是轉換過的格式，直接返回
  if (doc.id && !doc.fields) {
    return doc;
  }

  if (!doc.fields) {
    console.warn('⚠️ convertFirestoreDocument: 沒有 fields 屬性', doc);
    return null;
  }

  const result: any = {};
  for (const [key, value] of Object.entries(doc.fields)) {
    const convertedValue = convertFromFirestoreValue(value as any);
    result[key] = convertedValue;
  }

  // 提取文檔 ID
  if (doc.name) {
    const parts = doc.name.split('/');
    result.id = parts[parts.length - 1];
  }

  return result;
}

/**
 * 將普通物件轉換為 Firestore REST API 格式
 */
function convertToFirestoreFormat(data: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id') continue; // 跳過 id 欄位
    fields[key] = convertToFirestoreValue(value);
  }
  return fields;
}

/**
 * 將值轉換為 Firestore 格式
 */
function convertToFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return { integerValue: String(value) };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (value instanceof Date) {
    return {
      timestampValue: value.toISOString(),
    };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map((item) => convertToFirestoreValue(item)),
      },
    };
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: convertToFirestoreFormat(value),
      },
    };
  }

  return { stringValue: String(value) };
}

/**
 * 從 Firestore 格式轉換為普通值
 */
function convertFromFirestoreValue(value: any): any {
  if (!value) return null;

  if (value.nullValue !== undefined) {
    return null;
  }

  if (value.booleanValue !== undefined) {
    return value.booleanValue;
  }

  if (value.integerValue !== undefined) {
    return parseInt(value.integerValue, 10);
  }

  if (value.doubleValue !== undefined) {
    return parseFloat(value.doubleValue);
  }

  if (value.stringValue !== undefined) {
    return value.stringValue;
  }

  if (value.timestampValue !== undefined) {
    return new Date(value.timestampValue);
  }

  if (value.arrayValue !== undefined) {
    return value.arrayValue.values.map((item: any) => convertFromFirestoreValue(item));
  }

  if (value.mapValue !== undefined) {
    const result: any = {};
    for (const [key, val] of Object.entries(value.mapValue.fields || {})) {
      result[key] = convertFromFirestoreValue(val);
    }
    return result;
  }

  return null;
}

