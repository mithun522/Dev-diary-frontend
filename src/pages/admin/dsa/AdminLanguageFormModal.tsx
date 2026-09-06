import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import Button from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useForm } from "react-hook-form";
import { logger } from "../../../utils/logger";
import { useAddLanguage } from "../../../api/hooks/useFetchLanguage";
import { useUpdateLanguage } from "../../../api/hooks/useAdminLanguage";
import type { LanguageType } from "../../../api/hooks/useFetchLanguage";

type LanguageFormValues = {
  language: string;
};

type AdminLanguageFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  languageData?: LanguageType | null; // if provided -> edit mode
};

const errorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { message?: string })?.message || fallback;
};

const AdminLanguageFormModal: React.FC<AdminLanguageFormModalProps> = ({
  open,
  setOpen,
  languageData,
}) => {
  const [disabled, setDisabled] = useState(false);
  const addLanguageMutation = useAddLanguage();
  const updateLanguageMutation = useUpdateLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LanguageFormValues>({
    defaultValues: { language: languageData?.language ?? "" },
  });

  useEffect(() => {
    reset({ language: languageData?.language ?? "" });
  }, [open, languageData, reset]);

  const onSubmit = async (data: LanguageFormValues) => {
    setDisabled(true);
    try {
      if (languageData) {
        await updateLanguageMutation.mutateAsync({
          id: languageData.id,
          language: data.language,
        });
        toast.success("Language updated successfully");
      } else {
        await addLanguageMutation.mutateAsync(data.language);
        toast.success("Language added successfully");
      }
      setOpen(false);
      reset();
    } catch (error) {
      toast.error(errorMessage(error, "Failed to save language"));
      logger.error("Error submitting language:", error);
    } finally {
      setDisabled(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl p-6 shadow-xl bg-background dark:text-white border border-white z-[101]"
          data-cy="admin-languages-form-modal"
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title
              className="text-lg font-semibold"
              data-cy="admin-languages-form-title"
            >
              {languageData ? "Edit Language" : "Add Language"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <X
                className="text-primary-background cursor-pointer"
                data-cy="admin-languages-form-close"
              />
            </Dialog.Close>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Label htmlFor="language" isMandatory>
              Language name
            </Label>
            <div>
              <Input
                id="language"
                placeholder="e.g. Python"
                {...register("language", {
                  required: "Language name is required",
                })}
                className={errors.language ? "border border-red-600" : ""}
                data-cy="admin-languages-form-name"
              />
              {errors.language && (
                <p
                  className="text-red-500 text-sm"
                  data-cy="admin-languages-form-name-error"
                >
                  {errors.language.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  variant="danger"
                  data-cy="admin-languages-form-cancel"
                >
                  Cancel
                </Button>
              </Dialog.Close>
              <Button
                variant="primary"
                type="submit"
                disabled={disabled}
                className="flex items-center justify-center gap-2 min-w-[70px]"
                data-cy="admin-languages-form-save"
              >
                {disabled ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminLanguageFormModal;
