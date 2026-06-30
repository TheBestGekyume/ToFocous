import { FeedbackToast } from "../components/_Common/FeedbackToast";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { AgendaCalendar } from "../components/Agenda/AgendaCalendar";
import { AgendaHeader } from "../components/Agenda/AgendaHeader";
import { useAgenda } from "../hooks/useAgenda";

export const AgendaPage = () => {
  const {
    loading,
    error,

    currentMonth,
    agendaItemsByDate,
    activeDateKey,
    selectedDateKey,
    selectedProjectId,
    projectOptions,

    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleHoverDate,
    openDayModal,
    closeDayModal,
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

        {error && <FeedbackToast type={"error"} message={error} />}

        <AgendaCalendar
          currentMonth={currentMonth}
          agendaItemsByDate={agendaItemsByDate}
          activeDateKey={activeDateKey}
          selectedDateKey={selectedDateKey}
          onHoverDate={handleHoverDate}
          onOpenModal={openDayModal}
          onCloseModal={closeDayModal}
          onUpdateDate={updateAgendaItemDate}
          onNavigate={navigateToAgendaItem}
        />
      </section>
    </>
  );
};
