/**
 * Two-stage guard for the one destructive action in the Review Panel.
 * No data is modified by this helper; it only returns true when the user
 * confirms both stages, including an exact typed confirmation.
 */
export function confirmHistoryClear(collectionName, dialogs) {
  const name = String(collectionName || 'this collection');
  const first = dialogs.confirm(
    'Clear the review history for ' + name + ' on this browser?\n\n' +
    'This will remove saved ratings and review dates for this collection.'
  );
  if (first !== true) return false;
  const second = dialogs.prompt(
    'Final confirmation for ' + name + '.\n\n' +
    'Type CLEAR (in uppercase) to permanently reset the saved history. ' +
    'Select Cancel or leave blank to keep your progress.'
  );
  return second === 'CLEAR';
}
