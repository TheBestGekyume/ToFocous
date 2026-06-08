import { useEffect, useState } from "react";
import { Check, Pencil, UserRound, X } from "lucide-react";
import { useUser } from "../hooks/useUser";
import { LoadingDots } from "../components/_Common/LoadingDots";

export const ProfilePage = () => {
  const { user, loading, updating, fetchMyUser, updateUser } = useUser();

  const [name, setName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyUser();
  }, [fetchMyUser]);

  useEffect(() => {
    if (!user) return;

    setName(user.name);
  }, [user]);

  const handleCancelEdit = () => {
    if (!user) return;

    setName(user.name);
    setError("");
    setIsEditing(false);
  };

  const handleUpdateUser = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("O nome não pode ficar vazio.");
      return;
    }

    if (trimmedName === user?.name) {
      setIsEditing(false);
      return;
    }

    setError("");

    await updateUser({
      name: trimmedName,
    });

    setIsEditing(false);
  };

  return (
    <main className="w-full min-h-full p-4 md:p-8 text-text">
      <section className="max-w-3xl mx-auto bg-background-header border border-secondary/40 rounded-2xl shadow-xl p-5 md:p-7 flex flex-col gap-6">
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
            {" "}
            <span className="text-text">Carregando perfil</span> <LoadingDots />
          </p>
        ) : !user ? (
          <p className="text-lg text-red-400 text-center">
            Não foi possível carregar os dados do usuário.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <div className="flex bg-background-body border border-secondary/40 rounded-xl p-4">
                <p className="text-sm text-primary">
                  ID do usuário:{" "}
                  <span className="text-sm break-all text-zinc-300">
                    {user.id}
                  </span>
                </p>
              </div>
              <label
                htmlFor="profile-name"
                className="text-sm font-semibold text-primary"
              >
                Nome
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEditing || updating}
                  className="w-full p-3 rounded-lg bg-zinc-800 border border-transparent text-text 
                  outline-none disabled:opacity-70 hover:bg-zinc-700 focus:bg-zinc-900 focus:border-accent transition"
                />

                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-3 rounded-lg bg-accent hover:bg-purple-700 text-white font-semibold transition flex items-center justify-center gap-2"
                  >
                    <Pencil size={18} />
                    Editar
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUpdateUser}
                      disabled={updating}
                      className="px-4 py-3 rounded-lg bg-green-600 hover:bg-green-800 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Salvar
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={updating}
                      className="px-4 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            {/* 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
            </div> */}
          </div>
        )}
      </section>
    </main>
  );
};
