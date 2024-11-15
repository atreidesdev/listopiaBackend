export type UpdateThemeType = {
  id: number;
  name?: string;
  description?: string;
};

export type UpdateThemeTypeWithoutId = Omit<UpdateThemeType, 'id'>;
