import { Injectable } from '@nestjs/common';
import fs from 'fs';
import joinImages from 'join-images';
import merge from 'lodash/merge';
import path from 'path';

import { AiAgentConfigService, AiAgentPathService } from '~ai-agent/services';
import { EDicomVr } from '~common/enums';
import type { IDataset } from '~common/interfaces';
import type { TDeepPartial } from '~common/types';
import { ChildProcessService, ErrorSpawnHandler } from '~core/child-process';
import { LogService } from '~core/log';

const dcmjs = require('dcmjs');

interface IDicomImageOptions {
  height: number;
  width: number;
}

const GS_BAD_PDF_WARN = ['The file was produced by', 'File has some garbage before'];
const VET_AI_SERIES_NUMBER = 997;

@Injectable()
export class VetAiDicomGeneratorService {
  constructor(
    private readonly aiAgentPathService: AiAgentPathService,
    private readonly configService: AiAgentConfigService,
    private readonly childProcessService: ChildProcessService,
    private readonly logger: LogService,
  ) {
    logger.setContext(this.constructor.name);
  }

  public async generateImageDicomReport(
    reqId: string,
    patchDataset: TDeepPartial<IDataset>,
    imageBuffer: ArrayBufferLike,
    options?: IDicomImageOptions,
  ) {
    const aiReportPath = this.getAiReportPath(patchDataset.SOPInstanceUID!, reqId);
    const baseDataset: TDeepPartial<IDataset> = {
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.7',
      ContentDate: '',
      SeriesTime: '',
      ContentTime: '',
      Modality: 'OT',
      ConversionType: 'SI',
      SpecificCharacterSet: 'ISO_IR 192',
      PatientOrientation: '',
      SeriesDescription: 'Vet AI Report',
      SeriesNumber: VET_AI_SERIES_NUMBER,
      SamplesPerPixel: 3,
      PhotometricInterpretation: 'YBR_FULL_422',
      PlanarConfiguration: 0,
      Rows: options?.height ?? 1200,
      Columns: options?.width ?? 1200,
      BitsAllocated: 8,
      BitsStored: 8,
      HighBit: 7,
      PixelRepresentation: 0,
      LossyImageCompression: '01',
      PixelData: imageBuffer,
      _meta: {
        FileMetaInformationVersion: {
          Value: [
            {
              0: 0,
              1: 1,
            },
          ],
          vr: EDicomVr.OTHER_BYTE_STRING,
        },
        MediaStorageSOPClassUID: {
          Value: [
            '1.2.840.10008.5.1.4.1.1.7',
          ],
          vr: EDicomVr.UID,
        },
        TransferSyntaxUID: {
          Value: [
            '1.2.840.10008.1.2.4.50',
          ],
          vr: EDicomVr.UID,
        },
      },
      _vrMap: { PixelData: 'OW' },
    };

    const dataset = merge(baseDataset, patchDataset) as IDataset;
    const dicomDict = dcmjs.data.datasetToDict(dataset);
    const buffer = Buffer.from(dicomDict.write({ framentMultiframe: false }));
    await fs.promises.writeFile(aiReportPath, buffer);

    return aiReportPath;
  }

  public async generateEncapsulatedPdfDicomReport(reqId: string, patchDataset: TDeepPartial<IDataset>, pdfBuffer: ArrayBufferLike) {
    const aiReportPath = this.getAiReportPath(patchDataset.SOPInstanceUID!, reqId);
    const baseDataset: TDeepPartial<IDataset> = {
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.104.1',
      ContentDate: '',
      SeriesTime: '',
      ContentTime: '',
      Modality: 'OT',
      ConversionType: 'SD',
      SpecificCharacterSet: 'ISO_IR 192',
      PatientOrientation: '',
      SeriesDescription: 'Vet AI Report',
      SeriesNumber: VET_AI_SERIES_NUMBER,
      MIMETypeOfEncapsulatedDocument: 'application/pdf',
      DocumentTitle: 'Vet AI report',
      EncapsulatedDocument: pdfBuffer,
      _meta: {
        FileMetaInformationVersion: {
          Value: [
            {
              0: 0,
              1: 1,
            },
          ],
          vr: EDicomVr.OTHER_BYTE_STRING,
        },
        MediaStorageSOPClassUID: {
          Value: [
            '1.2.840.10008.5.1.4.1.1.4',
          ],
          vr: EDicomVr.UID,
        },

        TransferSyntaxUID: {
          Value: [
            '1.2.840.10008.1.2.1',
          ],
          vr: EDicomVr.UID,
        },
      },
      _vrMap: { },
    };

    const dataset = merge(baseDataset, patchDataset) as IDataset;
    const dicomDict = dcmjs.data.datasetToDict(dataset);
    const buffer = Buffer.from(dicomDict.write({ framentMultiframe: false }));
    await fs.promises.writeFile(aiReportPath, buffer);

    return aiReportPath;
  }

  public getAiReportImagePath() {
    return this.aiAgentPathService.getPathToTemp();
  }

  // Is not ready yet, don't use it.
  public async generateSrDicomReport(reqId: string, patchDataset: TDeepPartial<IDataset>, detectedResult: string) {
    this.logger.debug(detectedResult);
    const aiReportPath = this.getAiReportPath(patchDataset.SOPInstanceUID!, reqId);
    const baseDataset: TDeepPartial<IDataset> = {
      SOPClassUID: '1.2.840.10008.5.1.4.1.1.88.11',
      ContentDate: '',
      SeriesTime: '',
      ContentTime: '',
      Modality: 'SR',
      SpecificCharacterSet: 'ISO_IR 192',
      PatientOrientation: '',
      SeriesDescription: 'Vet AI Report',
      SeriesNumber: VET_AI_SERIES_NUMBER,
      _meta: {
        FileMetaInformationVersion: {
          Value: [
            {
              0: 0,
              1: 1,
            },
          ],
          vr: EDicomVr.OTHER_BYTE_STRING,
        },
        MediaStorageSOPClassUID: {
          Value: [
            '1.2.840.10008.5.1.4.1.1.88.11',
          ],
          vr: EDicomVr.UID,
        },
        TransferSyntaxUID: {
          Value: [
            '1.2.840.10008.1.2',
          ],
          vr: EDicomVr.UID,
        },
      },
      _vrMap: { },
    };

    const dataset = merge(baseDataset, patchDataset) as IDataset;
    const dicomDict = dcmjs.data.datasetToDict(dataset);
    const buffer = Buffer.from(dicomDict.write({ framentMultiframe: false }));
    await fs.promises.writeFile(aiReportPath, buffer);

    return aiReportPath;
  }

  public async pdfToImage(pdfFilePath: string) {
    const jpegDir = await fs.promises.mkdtemp(`${this.aiAgentPathService.getPathToTemp()}/`);
    const paths = await this.convertPdfToImage(pdfFilePath, jpegDir);

    try {
      const images = await joinImages(paths);

      return images;
    } finally {
      await fs.promises.unlink(pdfFilePath);
      await fs.promises.rm(jpegDir, { force: true, recursive: true });
    }
  }

  private async convertPdfToImage(source: string, destDir: string) {
    if (!source) {
      throw new Error('ConvertPdfToJpeg: the path to the PDF file is missing');
    }

    return new Promise<string[]>(async (resolve, reject) => {
      try {
        await this.childProcessService.runSpawn(this.configService.getGhostScriptPath(), [
          '-dNOPAUSE',
          '-dBATCH',
          '-dPDFFitPage',
          '-sDEVICE=jpeg',
          '-dJPEGQ=100',
          '-r200',
          `-sOutputFile=${destDir}/%04d.jpg`,
          source,
        ], new ErrorSpawnHandler(
          undefined,
          (stderr: any) => GS_BAD_PDF_WARN.forEach((gsWarn => !stderr.toString().includes(gsWarn))),
        ));
        const paths = await fs.promises.readdir(destDir);
        resolve(paths.map(path => `${destDir}/${path}`));
      } catch (error) {
        this.logger.error(`ConvertPdfToJpeg: cannot convert with error: ${error}`);
        reject(error);
      }
    });
  }

  private getAiReportPath(sopInstanceUid: string, reqId: string) {
    return path.join(this.aiAgentPathService.getPathToTemp(), `${reqId}-${sopInstanceUid}-vet-ai-report.dcm`);
  }
}
