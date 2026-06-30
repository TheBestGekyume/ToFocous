import { Check, KeyRound, RotateCcwKey } from "lucide-react";
import { PasswordInput } from "../_Common/PasswordInput";
import { LoadingDots } from "../_Common/LoadingDots";

type Props = {
  currentPassword: string;
  setCurrentPassword: (value: string) => void;

  newPassword: string;
  setNewPassword: (value: string) => void;

  confirmNewPassword: string;
  setConfirmNewPassword: (value: string) => void;

  isUpdatingPassword: boolean;
  passwordError: string;
  handleUpdatePassword: () => void;

  resetEmail: string;
  isSendingReset: boolean;
  resetError: string;
  handleRequestPasswordReset: () => void;
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

export const PasswordManagementSection = ({
  currentPassword,
  setCurrentPassword,

  newPassword,
  setNewPassword,

  confirmNewPassword,
  setConfirmNewPassword,

  isUpdatingPassword,
  passwordError,
  handleUpdatePassword,

  resetEmail,
  isSendingReset,
  resetError,
  handleRequestPasswordReset,
}: Props) => {
  return (
    <>
      <div className="flex flex-col gap-3 border-t border-secondary/50 pt-5">
        <div className="flex items-center gap-2 text-primary">
          <KeyRound size={20} />
          <h2 className="text-lg text-text font-semibold">Trocar senha</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <fieldset>
            <label
              htmlFor="currentPassword"
              className="text-sm font-semibold text-primary"
            >
              Senha atual
            </label>

            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              value={currentPassword}
              onChange={setCurrentPassword}
              disabled={isUpdatingPassword}
              className={inputClass}
            />
          </fieldset>

          <fieldset>
            <label
              htmlFor="newPassword"
              className="text-sm font-semibold text-primary"
            >
              Nova senha
            </label>

            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={setNewPassword}
              disabled={isUpdatingPassword}
              className={inputClass}
            />
          </fieldset>

          <fieldset>
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-primary"
            >
              Confirme a senha
            </label>

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirmNewPassword}
              onChange={setConfirmNewPassword}
              disabled={isUpdatingPassword}
              className={inputClass}
            />
          </fieldset>
        </div>

        {passwordError && (
          <p className="text-sm text-red-400">{passwordError}</p>
        )}

        <button
          type="button"
          onClick={handleUpdatePassword}
          disabled={isUpdatingPassword}
          className={`${buttonBaseClass} bg-green-600 hover:bg-green-800 self-end`}
        >
          {isUpdatingPassword ? (
            <LoadingDots />
          ) : (
            <>
              <Check size={18} />
              Atualizar senha
            </>
          )}
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-secondary/50 pt-5">
        <div className="flex items-center gap-2 text-primary">
          <RotateCcwKey size={20} />
          <h2 className="text-lg text-text font-semibold">Resetar senha</h2>
        </div>

        <p className="text-sm text-primary/80">
          Envie um link de redefinição para o e-mail da conta.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={resetEmail}
            disabled
            placeholder="E-mail da conta"
            className={inputClass}
          />

          <button
            type="button"
            onClick={handleRequestPasswordReset}
            disabled={isSendingReset || !resetEmail}
            className={`${buttonBaseClass} bg-zinc-700 hover:bg-zinc-600 whitespace-nowrap`}
          >
            {isSendingReset ? (
              <LoadingDots />
            ) : (
              <>
                <RotateCcwKey size={18} />
                Enviar reset
              </>
            )}
          </button>
        </div>

        {resetError && <p className="text-sm text-red-400">{resetError}</p>}
      </div>
    </>
  );
};