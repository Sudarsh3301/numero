export const PERSON_COLORS = { p1: '#c9a24b', p2: '#5f8fae' } as const;
export const SEMANTIC = { success: '#6fae7c', warning: '#d9a45c', danger: '#c97b6a' } as const;

export type PersonKey = keyof typeof PERSON_COLORS;
