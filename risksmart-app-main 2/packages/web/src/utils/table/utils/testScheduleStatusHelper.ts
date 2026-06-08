/**
 * Determines the test schedule status based on the next test due date and overdue date.
 *
 * @param nextTestOverdueDate - The ISO date string representing when the test becomes overdue
 * @param nextTestDueDate - The ISO date string representing when the test becomes due
 * @returns 'due' if the due date has been reached but not yet overdue, 'overdue' if the overdue date has passed, or '-' if no schedule or not yet due
 */

type TestScheduleStatusReturnType = 'due' | 'overdue' | '-';

export const getTestScheduleStatus = (
  nextTestOverdueDate?: string | null,
  nextTestDueDate?: string | null
): TestScheduleStatusReturnType => {
  if (!nextTestOverdueDate) {
    return '-';
  }

  const now = new Date();
  const overdueDate = new Date(nextTestOverdueDate);

  if (overdueDate < now) {
    return 'overdue';
  }

  if (nextTestDueDate) {
    const dueDate = new Date(nextTestDueDate);
    if (dueDate > now) {
      return '-';
    }
  }

  return 'due';
};
