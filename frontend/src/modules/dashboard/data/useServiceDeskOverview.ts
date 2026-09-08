import { serviceDeskActivityMock } from '@/modules/dashboard/mock/serviceDeskActivity.mock'
import { ticketsByDeskMock, ticketTotalsMock } from '@/shared/analytics/ticketData.mock'

/** Wraps the same ticket source consumed by Executive Overview so the two screens never disagree on totals. */
export function useServiceDeskOverview() {
  return {
    totals: ticketTotalsMock,
    byDesk: ticketsByDeskMock,
    activity: serviceDeskActivityMock,
  }
}
