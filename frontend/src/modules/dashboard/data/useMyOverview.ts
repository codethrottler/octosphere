import { myActivityMock, myCalendarEventsMock, myOverviewSummaryMock } from '@/modules/dashboard/mock/myOverview.mock'

/** No My Work module yet — mock data isolated in myOverview.mock.ts, swap this hook to a real query once it lands. */
export function useMyOverview() {
  return {
    summary: myOverviewSummaryMock,
    calendarEvents: myCalendarEventsMock,
    activity: myActivityMock,
  }
}
