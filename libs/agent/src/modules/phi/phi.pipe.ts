import type { PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import type { PhiDto } from '~common/dto';
import { EDicomTag, EDicomVr } from '~common/enums';
import type { IDicomAttributeJsonModel, IValueDicomElement } from '~common/interfaces';
import { LogService } from '~core/log';

type TDicomData = PhiDto['dicomData'];

@Injectable()
export class PhiValidationPipe implements PipeTransform {
  constructor(
    private readonly logger: LogService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  public transform(phi: PhiDto, _: ArgumentMetadata) {
    if (!phi.studyInstanceUid) {
      throw new HttpException(`Field 'studyInstanceUid' is required`, HttpStatus.BAD_REQUEST);
    }
    if (!phi.sopInstanceUid) {
      throw new HttpException(`Field 'sopInstanceUid' is required`, HttpStatus.BAD_REQUEST);
    }
    if (!phi.dicomData) {
      throw new HttpException(`Field 'dicomData' is required`, HttpStatus.BAD_REQUEST);
    }

    this.validateDicomData(phi.dicomData);

    return phi;
  }

  private validateDicomData(dicomData: TDicomData) {
    for (const [tag, dicomModel] of Object.entries(dicomData)) {
      this.validateDicomTag(tag as EDicomTag);
      this.validateDicomModel(dicomModel);
    }
  }

  private validateDicomModel(dicomModel: IDicomAttributeJsonModel) {
    this.validateDicomVr(dicomModel.vr);

    if (!dicomModel.Value) {
      return;
    }

    if (Array.isArray(dicomModel.Value)) {
      for (const dicomData of dicomModel.Value) {
        if (dicomModel.vr === EDicomVr.SEQUENCE && typeof dicomData === 'object') {
          this.validateDicomData(dicomData as TDicomData);
        }

        if (dicomModel.vr === EDicomVr.PERSON_NAME && !this.validateValueFieldObject(dicomData as IValueDicomElement)) {
          this.logger.error(`Unknown Value Field: ${Object.keys(dicomData as IValueDicomElement)[0]}`);
        }
      }
    }
  }

  private validateValueFieldObject(value: IValueDicomElement) {
    return typeof value === 'object'
      && value !== null
      && ('Alphabetic' in value || 'Ideographic' in value || 'Phonetic' in value);
  }

  private validateDicomVr(vr: EDicomVr) {
    const dicomVr = Object.values(EDicomVr);

    if (!dicomVr.includes(vr)) {
      this.logger.error(`Unknown DICOM VR: ${vr}`);
      throw new HttpException(`Unknown DICOM VR: ${vr}`, HttpStatus.BAD_REQUEST);
    }
  }

  private validateDicomTag(tag: EDicomTag) {
    const dicomTags = Object.values(EDicomTag);

    if (!dicomTags.includes(tag)) {
      this.logger.error(`Unknown dicom tag: ${tag}`);
    }
  }
}
