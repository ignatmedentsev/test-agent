import type { EDicomUniversalEntityIdType } from '~common/enums';

import type { TDicomSingleMultiplicityValue } from './TDicomSingleMultiplicityValue';

export type TDicomUniversalEntityIdValue = TDicomSingleMultiplicityValue<`${EDicomUniversalEntityIdType}`>;
