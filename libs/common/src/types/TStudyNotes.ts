import type { ReadStream } from 'fs';

import type { PhiPlatformDto } from '~common/dto';
import type { IPacsFileInfo } from '~common/interfaces';

export type TStudyNotes = {
  pacsFileInfo: IPacsFileInfo,
  phiForStudyNotes: PhiPlatformDto,
  uploadedFile: ReadStream,
};
