// use-profile-settings.ts
import { Keyboard } from "react-native";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/src/auth/use-auth";
import { useUpdateUser } from "@/src/api/hooks/use-user";
import { UpdateUserFormValues, UpdateUserSchema } from "@/src/validation/user";

export const useProfileSettingsForm = () => {
  const { user } = useAuth();
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

  // Computed state
  const isSaveDisabled = !isDirty || !isValid || isPending;

  // Handlers
  const onSubmit = form.handleSubmit((data: UpdateUserFormValues) => {
    Keyboard.dismiss();
    updateUser(data);
  });

  return {
    control: form.control,
    errors: form.formState.errors,
    onSubmit,
    isSaveDisabled,
    isPending,
  };
};
