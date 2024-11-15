export function createUpdateData(fields: any): any {
  const updateData: any = {};

  Object.keys(fields).forEach((key) => {
    const value = fields[key];
    if (value !== undefined) {
      if (Array.isArray(value) && typeof value[0] === 'number') {
        updateData[key] = { set: value.map((id: number) => ({ id })) };
      } else {
        updateData[key] = value;
      }
    }
  });

  return updateData;
}
