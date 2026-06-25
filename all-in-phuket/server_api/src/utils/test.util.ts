type Row = Record<string, any>;

function snakeToCamel(snakeStr: string): string {
  return snakeStr.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function convertToCamelCase(resultSet: Row[] | Row): Row[] | Row {
  if (Array.isArray(resultSet)) {
    return resultSet.map((row) => {
      const newRow: Row = {};
      for (const key in row) {
        if (row.hasOwnProperty(key)) {
          newRow[snakeToCamel(key)] = row[key];
        }
      }
      return newRow;
    });
  } else if (typeof resultSet === 'object') {
    const newObject: Row = {};
    for (const key in resultSet) {
      if (resultSet.hasOwnProperty(key)) {
        newObject[snakeToCamel(key)] = resultSet[key];
      }
    }
    return newObject;
  } else {
    return resultSet;
  }
}
