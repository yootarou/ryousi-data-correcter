import type { ValidationSchema } from '@/hooks/useForm';

export const required = (value: unknown, fieldName: string): string | undefined => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName}は必須です`;
  }
  return undefined;
};

export const minLength = (value: string, min: number, fieldName: string): string | undefined => {
  if (value.length < min) {
    return `${fieldName}は${min}文字以上で入力してください`;
  }
  return undefined;
};

export const positiveNumber = (value: number, fieldName: string): string | undefined => {
  if (value < 0) {
    return `${fieldName}は0以上で入力してください`;
  }
  return undefined;
};

export const createValidationSchema = <T extends object>(
  rules: Partial<Record<keyof T, (value: T[keyof T]) => string | undefined>>,
): ValidationSchema<T> => ({
  validate(data: T) {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    for (const [field, rule] of Object.entries(rules)) {
      const error = (rule as (value: unknown) => string | undefined)(data[field as keyof T]);
      if (error) {
        errors[field as keyof T] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  },
});
