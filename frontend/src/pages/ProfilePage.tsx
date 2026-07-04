import { useState } from "react";
import { Check, Copy, UserRound } from "lucide-react";
import { LoadingDots } from "../components/_Common/LoadingDots";
import { ProfileEditableField } from "../components/Profile/ProfileEditableField";
import { useProfile } from "../hooks/useProfile";
import { FeedbackToast } from "../components/_Common/FeedbackToast";
import { CreatePasswordSection } from "../components/Profile/CreatePasswordSection";
import { PasswordManagementSection } from "../components/Profile/PasswordManegmantSection";

export const ProfilePage = () => {
  const [copiedUserId, setCopiedUserId] = useState(false);

  const handleCopyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(true);

      window.setTimeout(() => {
        setCopiedUserId(false);
      }, 3000);
    } catch {
      setCopiedUserId(false);
    }
  };

  const {
    userState,
    nameState,
    emailState,
    passwordState,
    resetPasswordState,
    createPasswordState,
    authInfoState,
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

  const { resetEmail, isSendingReset, resetError, handleRequestPasswordReset } =
    resetPasswordState;

  const {
    createPassword,
    setCreatePassword,
    confirmCreatePassword,
    setConfirmCreatePassword,
    isCreatingPassword,
    createPasswordError,
    handleCreatePassword,
  } = createPasswordState;

  const { hasPassword, hasGoogleAuth } = authInfoState;

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
          <div className="flex flex-col gap-6 w-auto">
            <div className="flex flex-col gap-3 bg-background-body border border-secondary/40 rounded-xl py-2 px-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-primary">
                ID do usuário:{" "}
                <span className="text-sm break-all text-text/90">
                  {user.id}
                </span>
              </p>

              <button
                type="button"
                disabled={copiedUserId}
                onClick={() => void handleCopyUserId(user.id)}
                className="flex w-fit items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2 text-sm font-semibold text-accent transition hover:bg-secondary/20"
                aria-label="Copiar ID do usuário"
                title="Copiar ID do usuário"
              >
                {copiedUserId ? (
                  <>
                    <Check size={16} />
                    <span className="text-text">Copiado </span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span className="text-text">Copiar ID </span>
                  </>
                )}
              </button>
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

            {!hasPassword && hasGoogleAuth ? (
              <CreatePasswordSection
                createPassword={createPassword}
                setCreatePassword={setCreatePassword}
                confirmCreatePassword={confirmCreatePassword}
                setConfirmCreatePassword={setConfirmCreatePassword}
                isCreatingPassword={isCreatingPassword}
                createPasswordError={createPasswordError}
                handleCreatePassword={handleCreatePassword}
              />
            ) : (
              <PasswordManagementSection
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmNewPassword={confirmNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                isUpdatingPassword={isUpdatingPassword}
                passwordError={passwordError}
                handleUpdatePassword={handleUpdatePassword}
                resetEmail={resetEmail}
                isSendingReset={isSendingReset}
                resetError={resetError}
                handleRequestPasswordReset={handleRequestPasswordReset}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
};
