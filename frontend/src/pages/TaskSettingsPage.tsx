import { useTaskSettings } from "../hooks/useTaskSettings";
import type { ITaskSettings } from "../types/TSettings";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";

export const TaskSettingsPage = () => {
  const {
    settings,
    updateSettings,
    canUseStartTime,
    canShowCalendarOption,
    loading,
    updating
  } = useTaskSettings();

  return (
    <>
      <LoadingOverlay show={loading || updating} />

      {settings && (
        <div className="w-full flex justify-center px-4 py-8">
          <div className="w-full max-w-xl bg-background-header rounded-2xl p-6 shadow-md border border-secondary/20">
            <h1 className="text-2xl font-semibold text-text mb-6">
              Configurações de Tarefas
            </h1>

            <div className="flex flex-col gap-5">
              <label className="flex items-center justify-between bg-background-body p-4 rounded-xl border border-secondary/10">
                <div>
                  <p className="font-medium text-text">
                    Prioridade de subtarefas
                  </p>
                  <span className="text-sm text-secondary">
                    Permitir definir prioridade nas subtarefas
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.use_subtask_priority}
                  onChange={(e) =>
                    updateSettings({
                      use_subtask_priority: e.target.checked,
                    })
                  }
                  className="accent-primary w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between bg-background-body p-4 rounded-xl border border-secondary/10">
                <div>
                  <p className="font-medium text-text">
                    Uso de horário
                  </p>
                  <span className="text-sm text-secondary">
                    Habilita hora de início e de prazo
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.use_time}
                  onChange={(e) =>
                    updateSettings({ use_time: e.target.checked })
                  }
                  className="accent-primary w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between bg-background-body p-4 rounded-xl border border-secondary/10">
                <div>
                  <p className="font-medium text-text">
                    Data de início
                  </p>
                  <span className="text-sm text-secondary">
                    Permite definir uma data de início para tarefas
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.use_start_date}
                  onChange={(e) =>
                    updateSettings({
                      use_start_date: e.target.checked,
                    })
                  }
                  className="accent-primary w-5 h-5"
                />
              </label>

              {canUseStartTime && (
                <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm">
                  Horário de início habilitado (requer data de início + horário)
                </div>
              )}

              {canShowCalendarOption && (
                <div className="bg-background-body p-4 rounded-xl border border-secondary/10 flex flex-col gap-3">
                  <div>
                    <p className="font-medium text-text">
                      Comportamento do calendário
                    </p>
                    <span className="text-sm text-secondary">
                      Escolha qual data será exibida
                    </span>
                  </div>

                  <select
                    value={settings.which_date_use_in_calendar}
                    onChange={(e) =>
                      updateSettings({
                        which_date_use_in_calendar:
                          e.target
                            .value as ITaskSettings["which_date_use_in_calendar"],
                      })
                    }
                    className="bg-background-header border border-secondary/20 rounded-lg px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="UseStartDate">Data de início</option>
                    <option value="UseDueDate">Data de prazo</option>
                    <option value="UseBoth">Ambas</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};