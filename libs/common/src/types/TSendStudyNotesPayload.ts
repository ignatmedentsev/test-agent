import type { IPacsServer } from '../interfaces';

import type { TRequestStudyNotesPayload } from './TRequestStudyNotesPayload';

export type TSendStudyNotesPayload = TRequestStudyNotesPayload & {
  pacsServer: IPacsServer,
};
