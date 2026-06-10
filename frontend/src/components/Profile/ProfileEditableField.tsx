import { Check, Pencil, X } from "lucide-react";
import { LoadingDots } from "../_Common/LoadingDots";

type ProfileEditableFieldProps = {
  id: string;
  label: string;
  type?: "text" | "email";
  value: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  isEditing: boolean;
  isLoading?: boolean;
  canEdit?: boolean;
  onChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
};

const inputClass = `
  w-full p-3 rounded-lg bg-zinc-800 border border-transparent text-text
  outline-none disabled:opacity-70 hover:bg-zinc-700 focus:bg-zinc-900
  focus:border-accent transition
`;

const buttonBaseClass = `
  px-4 py-3 rounded-lg text-white font-semibold transition
  flex items-center justify-center gap-2 disabled:opacity-50
  whitespace-nowrap shrink-0
`;

export const ProfileEditableField = ({
  id,
  label,
  type = "text",
  value,
  placeholder,
  error,
  helperText,
  isEditing,
  isLoading = false,
  canEdit = true,
  onChange,
  onStartEdit,
  onCancelEdit,
  onSave,
}: ProfileEditableFieldProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={!isEditing || isLoading}
          placeholder={placeholder}
          className={inputClass}
        />
        {canEdit && (
          <>
            {!isEditing ? (
              <button
                type="button"
                onClick={onStartEdit}
                // disabled={!canEdit}
                className={`${buttonBaseClass} bg-accent hover:bg-purple-700`}
              >
                <Pencil size={18} />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSave}
                  disabled={isLoading}
                  className={`${buttonBaseClass} bg-green-600 hover:bg-green-800`}
                >
                  {isLoading ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <Check size={18} />
                      Salvar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onCancelEdit}
                  disabled={isLoading}
                  className={`${buttonBaseClass} bg-zinc-700 hover:bg-zinc-600`}
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {helperText && <p className="text-xs text-primary/70">{helperText}</p>}
    </div>
  );
};
