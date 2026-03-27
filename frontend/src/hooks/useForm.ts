import { useState, useCallback } from 'react';

export interface ValidationSchema<T> {
  validate(data: T): { isValid: boolean; errors: Partial<Record<keyof T, string>> };
}

export const useForm = <T extends object>(
  initialValues: T,
  validationSchema?: ValidationSchema<T>,
) => {
  const [data, setData] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = useCallback(() => {
    if (!validationSchema) return true;
    const result = validationSchema.validate(data);
    setErrors(result.errors);
    return result.isValid;
  }, [data, validationSchema]);

  const handleChange = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors],
  );

  const reset = useCallback(() => {
    setData(initialValues);
    setErrors({});
  }, [initialValues]);

  return { data, setData, errors, setErrors, validate, handleChange, reset };
};
