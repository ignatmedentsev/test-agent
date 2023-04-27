
import type { EDicomTag } from '~common/enums';
import type { IDicomAttributeJsonModel } from '~common/interfaces';

export type TDicomData = Partial<Record<EDicomTag, IDicomAttributeJsonModel>>
