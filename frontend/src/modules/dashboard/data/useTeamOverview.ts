import {
  teamActivityMock,
  teamLeaveCalendarMock,
  teamOverviewSummaryMock,
  teamTaskStatusMock,
} from '@/modules/dashboard/mock/teamOverview.mock'

/** No Team Work module yet — mock data isolated in teamOverview.mock.ts, swap this hook to a real query once it lands. */
export function useTeamOverview() {
  return {
    summary: teamOverviewSummaryMock,
    taskStatus: teamTaskStatusMock,
    leaveCalendar: teamLeaveCalendarMock,
    activity: teamActivityMock,
  }
}
