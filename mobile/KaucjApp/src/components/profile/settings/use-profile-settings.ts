import { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/src/auth/use-auth";
import { useUpdateUser } from "@/src/api/hooks/use-user";
import { UpdateUserFormValues, UpdateUserSchema } from "@/src/validation/user";

export const useProfileSettingsForm = () => {
  const { user } = useAuth();
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutate: updateUser, isPending } = useUpdateUser();

  const form = useForm<UpdateUserFormValues>({
    resolver: zodResolver(UpdateUserSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const { isDirty, isValid } = form.formState;
  const isSaveDisabled = !isDirty || !isValid || isPending;

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const onSubmit = form.handleSubmit((data: UpdateUserFormValues) => {
    Keyboard.dismiss();

    updateUser(data, {
      onSuccess: () => {
        setIsSuccess(true);
        form.reset(data);
      },
    });
  });

  return {
    control: form.control,
    errors: form.formState.errors,
    onSubmit,
    isSaveDisabled,
    isPending,
    isSuccess,
  };
};
