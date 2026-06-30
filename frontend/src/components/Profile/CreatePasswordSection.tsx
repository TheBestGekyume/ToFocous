import { Check, KeyRound } from "lucide-react";
import { PasswordInput } from "../_Common/PasswordInput";
import { LoadingDots } from "../_Common/LoadingDots";

type Props = {
  createPassword: string;
  setCreatePassword: (value: string) => void;

  confirmCreatePassword: string;
  setConfirmCreatePassword: (value: string) => void;

  isCreatingPassword: boolean;
  createPasswordError: string;
  handleCreatePassword: () => void;
};

const inputClass = `
  w-full p-3 rounded-lg bg-zinc-800 border border-transparent text-text
  outline-none disabled:opacity-70 hover:bg-zinc-700 focus:bg-zinc-900
  focus:border-accent transition
`;

const buttonBaseClass = `
  px-4 py-3 rounded-lg text-white font-semibold transition
  flex items-center justify-center gap-2 disabled:opacity-50
`;

export const CreatePasswordSection = ({
  createPassword,
  setCreatePassword,

  confirmCreatePassword,
  setConfirmCreatePassword,

  isCreatingPassword,
  createPasswordError,
  handleCreatePassword,
}: Props) => {
  return (
    <div className="flex flex-col gap-3 border-t border-secondary/50 pt-5">
      <div className="flex items-center gap-2 text-primary">
        <KeyRound size={20} />
        <h2 className="text-lg text-text font-semibold">
          Criar senha de acesso
        </h2>
      </div>

      <p className="text-sm text-primary/80">
        Sua conta usa login com Google. Crie uma senha para também acessar com
        e-mail e senha.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <fieldset>
          <label
            htmlFor="createPassword"
            className="text-sm font-semibold text-primary"
          >
            Senha
          </label>

          <PasswordInput
            id="createPassword"
            name="createPassword"
            value={createPassword}
            onChange={setCreatePassword}
            disabled={isCreatingPassword}
            className={inputClass}
          />
        </fieldset>

        <fieldset>
          <label
            htmlFor="confirmCreatePassword"
            className="text-sm font-semibold text-primary"
          >
            Confirme a senha
          </label>

          <PasswordInput
            id="confirmCreatePassword"
            name="confirmCreatePassword"
            value={confirmCreatePassword}
            onChange={setConfirmCreatePassword}
            disabled={isCreatingPassword}
            className={inputClass}
          />
        </fieldset>
      </div>

      {createPasswordError && (
        <p className="text-sm text-red-400">{createPasswordError}</p>
      )}

      <button
        type="button"
        onClick={handleCreatePassword}
        disabled={isCreatingPassword}
        className={`${buttonBaseClass} bg-green-600 hover:bg-green-800 self-end`}
      >
        {isCreatingPassword ? (
          <LoadingDots />
        ) : (
          <>
            <Check size={18} />
            Criar senha
          </>
        )}
      </button>
    </div>
  );
};
