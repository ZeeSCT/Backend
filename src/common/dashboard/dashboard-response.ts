export function screenResponse(screenKey: string, title: string, payload: Record<string, unknown>) {
  return {
    screenKey,
    title,
    generatedAt: new Date().toISOString(),
    ...payload,
  };
}
export function enumCountRows(grouped: Array<Record<string, any>>, key: string, label = 'count') {
  return grouped.map((item) => ({ key: item[key], [label]: item._count?.[key] ?? item._count ?? 0 }));
}
