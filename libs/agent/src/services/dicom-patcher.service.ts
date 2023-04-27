import merge from 'lodash/merge';

import { extractPersonName } from '~agent/utils/dicom/extractPersonNameValue';
import { EDicomVr } from '~common/enums';
import type { EDicomTag } from '~common/enums';
import type { TDicomAttributeValue, TDicomPatchingData } from '~common/types';

import { dicomStandardTags } from '../utils/dicom/dicomStandardTags';

const dcmjsDimse = require('dcmjs-dimse');

const { Dataset } = dcmjsDimse;
export class DicomPatcherService {
  public static async patchFile(filePath: string, patchingData: TDicomPatchingData) {
    const dicomPatcher = new DicomPatcherService();

    await dicomPatcher.patchFile(filePath, patchingData);
  }

  private async patchFile(filePath: string, patchingData: TDicomPatchingData) {
    const dicomDataset = await this.datasetFromFile(filePath);
    this.patchDataset(dicomDataset, patchingData);
    await this.datasetToFile(dicomDataset, filePath);
  }

  private async datasetFromFile(filePath: string) {
    return new Promise((resolve, reject) => {
      Dataset.fromFile(filePath, (error: Error, result: any) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  private async datasetToFile(dataSet: any, filePath: string) {
    return new Promise<void>((resolve, reject) => {
      dataSet.toFile(filePath, (error: Error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      }, { fragmentMultiframe: false });
    });
  }

  private patchDataset(dataset: any, patchingData: TDicomPatchingData) {
  // Delete this field because it can lead to a problem with VR inside dcmjs-dimse
    delete dataset.elements.VOILUTSequence;

    const patchingDataset = PatchingDataConverter.convertPatchingData(patchingData);
    merge(dataset.elements, patchingDataset.elements);
  }
}

class PatchingDataConverter {
  public static convertPatchingData(patchingData: TDicomPatchingData) {
    const converter = new PatchingDataConverter();

    return converter.process(patchingData);
  }

  private result: any = { elements: {} as any };

  private process(tagsData: TDicomPatchingData) {
    Object.entries(tagsData).forEach(([tag, data]) => {
      this.processTag(this.result.elements, tag as EDicomTag, data);
    });

    return this.result;
  }

  private processTag(root: any, tag: EDicomTag, data: TDicomAttributeValue) {
    const attSetting = dicomStandardTags[tag];

    if (!attSetting) {
      return;
    }
    switch (data.vr) {
      case EDicomVr.SEQUENCE:
        const leaf: any = {};

        for (const [innerTag, innerData] of Object.entries(data.Value[0])) {
          this.processTag(leaf, innerTag as EDicomTag, innerData as TDicomAttributeValue);
        }
        root[attSetting.keyword] = leaf;
        break;
      case EDicomVr.PERSON_NAME:
        root[attSetting.keyword] = extractPersonName(data);
        break;
      default:
        root[attSetting.keyword] = data.Value
          ? data.Value[0]?.Alphabetic || data.Value[0]
          : '';
        break;
    }
  }
}
