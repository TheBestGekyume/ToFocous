import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { AgendaCalendar } from "../components/Agenda/AgendaCalendar";
import { AgendaHeader } from "../components/Agenda/AgendaHeader";
import { useAgenda } from "../hooks/useAgenda";

export const AgendaPage = () => {
  const {
    loading,
    currentMonth,
    agendaItemsByDate,
    activeDateKey,
    pinnedDateKey,
    selectedProjectId,
    projectOptions,

    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleHoverDate,
    handlePinDate,
    closePopover,
    updateAgendaItemDate,
    navigateToAgendaItem,
    changeSelectedProjectId,
  } = useAgenda();

  return (
    <>
      <LoadingOverlay show={loading} />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-10">
        <AgendaHeader
          currentMonth={currentMonth}
          selectedProjectId={selectedProjectId}
          projectOptions={projectOptions}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
          onToday={goToToday}
          onChangeProject={changeSelectedProjectId}
        />

        <AgendaCalendar
          currentMonth={currentMonth}
          agendaItemsByDate={agendaItemsByDate}
          activeDateKey={activeDateKey}
          pinnedDateKey={pinnedDateKey}
          onHoverDate={handleHoverDate}
          onPinDate={handlePinDate}
          onClosePopover={closePopover}
          onUpdateDate={updateAgendaItemDate}
          onNavigate={navigateToAgendaItem}
        />
      </section>
    </>
  );
};