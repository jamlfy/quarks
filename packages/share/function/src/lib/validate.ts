export function validate(schema: any, data: any): any {
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error(
      result.error.errors
        .map((e: any) => e.path.join('.') + ': ' + e.message)
        .join(', '),
    );
    (err as any).status = 400;
    throw err;
  }
  return result.data;
}
