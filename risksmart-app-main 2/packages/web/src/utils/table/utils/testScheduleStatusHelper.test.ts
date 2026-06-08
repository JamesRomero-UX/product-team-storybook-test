import { getTestScheduleStatus } from './testScheduleStatusHelper';

describe('getTestScheduleStatus', () => {
  it('should return "-" when nextTestOverdueDate is null', () => {
    expect(getTestScheduleStatus(null)).toBe('-');
  });

  it('should return "overdue" when the overdue date is in the past', () => {
    const pastOverdue = new Date();
    pastOverdue.setDate(pastOverdue.getDate() - 7);
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 14);

    expect(
      getTestScheduleStatus(pastOverdue.toISOString(), pastDue.toISOString())
    ).toBe('overdue');
  });

  it('should return "due" when the due date has passed but overdue date is in the future', () => {
    const futureOverdue = new Date();
    futureOverdue.setDate(futureOverdue.getDate() + 7);
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 3);

    expect(
      getTestScheduleStatus(futureOverdue.toISOString(), pastDue.toISOString())
    ).toBe('due');
  });

  it('should return "-" when the due date has not yet been reached', () => {
    const futureOverdue = new Date();
    futureOverdue.setDate(futureOverdue.getDate() + 14);
    const futureDue = new Date();
    futureDue.setDate(futureDue.getDate() + 7);

    expect(
      getTestScheduleStatus(
        futureOverdue.toISOString(),
        futureDue.toISOString()
      )
    ).toBe('-');
  });

  it('should return "due" when no due date is provided but overdue date is in the future', () => {
    const futureOverdue = new Date();
    futureOverdue.setDate(futureOverdue.getDate() + 7);

    expect(getTestScheduleStatus(futureOverdue.toISOString())).toBe('due');
  });

  it('should return "overdue" when the overdue date is 1 millisecond in the past', () => {
    const pastOverdue = new Date(Date.now() - 1);
    const pastDue = new Date();
    pastDue.setDate(pastDue.getDate() - 7);

    expect(
      getTestScheduleStatus(pastOverdue.toISOString(), pastDue.toISOString())
    ).toBe('overdue');
  });
});
