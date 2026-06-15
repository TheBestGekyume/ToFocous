import { Check, KeyRound, RotateCcwKey, UserRound } from "lucide-react";
import { LoadingDots } from "../components/_Common/LoadingDots";
import { ProfileEditableField } from "../components/Profile/ProfileEditableField";
import { useProfile } from "../hooks/useProfile";
import { FeedbackToast } from "../components/_Common/FeedbackToast";

const inputClass = `
  w-full p-3 rounded-lg bg-zinc-800 border border-transparent text-text
  outline-none disabled:opacity-70 hover:bg-zinc-700 focus:bg-zinc-900
  focus:border-accent transition
`;

const buttonBaseClass = `
  px-4 py-3 rounded-lg text-white font-semibold transition
  flex items-center justify-center gap-2 disabled:opacity-50
`;

export const ProfilePage = () => {
  const {
    userState,
    nameState,
    emailState,
    passwordState,
    resetPasswordState,
    feedback,
  } = useProfile();

  const { user, loading, updating } = userState;

  const {
    name,
    setName,
    isEditingName,
    setIsEditingName,
    nameError,
    handleCancelNameEdit,
    handleUpdateUser,
  } = nameState;

  const {
    // email,
    newEmail,
    setNewEmail,
    isEditingEmail,
    setIsEditingEmail,
    isUpdatingEmail,
    emailError,
    handleCancelEmailEdit,
    handleUpdateEmail,
  } = emailState;

  const {
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    isUpdatingPassword,
    passwordError,
    handleUpdatePassword,
  } = passwordState;

  const {
    resetEmail,
    setResetEmail,
    isSendingReset,
    resetError,
    handleRequestPasswordReset,
  } = resetPasswordState;

  // console.log(email);

  return (
    <main className="w-full min-h-full p-4 md:p-8 text-text">
      {feedback && (
        <FeedbackToast type={feedback.type} message={feedback.message} />
      )}

      <section className="max-w-4xl mx-auto bg-background-header rounded-2xl shadow-xl p-5 md:p-7 flex flex-col gap-6">
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-accent/20 text-primary">
              <UserRound size={28} />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Meu perfil</h1>
              <p className="text-sm text-primary/80">
                Gerencie as informações da sua conta.
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <p className="text-lg text-accent text-center">
            <span className="text-text">Carregando perfil</span> <LoadingDots />
          </p>
        ) : !user ? (
          <p className="text-lg text-red-400 text-center">
            Não foi possível carregar os dados do usuário.
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex bg-background-body border border-secondary/40 rounded-xl p-4">
              <p className="text-sm text-primary">
                ID do usuário:{" "}
                <span className="text-sm break-all text-zinc-300">
                  {user.id}
                </span>
              </p>
            </div>

            <ProfileEditableField
              id="profile-name"
              label="Nome"
              value={name}
              error={nameError}
              isEditing={isEditingName}
              isLoading={updating}
              onChange={setName}
              onStartEdit={() => setIsEditingName(true)}
              onCancelEdit={handleCancelNameEdit}
              onSave={handleUpdateUser}
            />

            <ProfileEditableField
              id="profile-email"
              label="E-mail"
              type="email"
              value={newEmail}
              placeholder="Ainda não retornado pelo backend"
              error={emailError}
              helperText="A alteração vai exigir confirmação no e-mail atual."
              isEditing={isEditingEmail}
              isLoading={isUpdatingEmail}
              // canEdit={false}
              onChange={setNewEmail}
              onStartEdit={() => setIsEditingEmail(true)}
              onCancelEdit={handleCancelEmailEdit}
              onSave={handleUpdateEmail}
            />

            <div className="flex flex-col gap-3 border-t border-secondary/50 pt-5">
              <div className="flex items-center gap-2 text-primary">
                <KeyRound size={20} />
                <h2 className="text-lg text-text font-semibold">
                  Trocar senha
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <fieldset>
                  <label
                    htmlFor="currentPassword"
                    className="text-sm font-semibold text-primary"
                  >
                    Senha atual
                  </label>
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
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
                <h2 className="text-lg text-text font-semibold">
                  Resetar senha
                </h2>
              </div>

              <p className="text-sm text-primary/80">
                Envie um link de redefinição para o e-mail da conta.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled
                  placeholder="E-mail da conta"
                  className={inputClass}
                />

                <button
                  type="button"
                  onClick={handleRequestPasswordReset}
                  disabled={isSendingReset}
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

              {resetError && (
                <p className="text-sm text-red-400">{resetError}</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
};
