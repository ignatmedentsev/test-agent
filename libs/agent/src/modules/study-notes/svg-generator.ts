import type { Svg } from '@svgdotjs/svg.js';
import { SVG, registerWindow } from '@svgdotjs/svg.js';
import sharp from 'sharp';

import type { TStudyData } from '~common/types';

// returns a window with a document and an svg root node
const { createSVGWindow } = require('svgdom');

const window = createSVGWindow();
const document = window.document;

// register window and document
registerWindow(window, document);

type TSvgOptions = {
  height: number,
  width: number,
  margin: number,
  fontSize: number,
  headerFontSize: number,
  sectionHeaderFontSize: number,
  rowSpace: number,
}

type TRow = {
  label?: string,
  value: string,
}

type TColumn = {
  header?: string,
  data: TRow[],
};

export class SVGGenerator {
  public static renderTemplate(data: TStudyData) {
    const defaultOptions: TSvgOptions = {
      height: 1200,
      width: 1200,
      margin: 40,
      fontSize: 18,
      headerFontSize: 28,
      sectionHeaderFontSize: 24,
      rowSpace: 10,
    };
    const generator = new SVGGenerator(defaultOptions);

    return generator.renderTemplate(data);
  }

  private readonly draw: Svg;
  private lastYMargin: number;
  constructor(
    private readonly options: TSvgOptions,
  ) {
    this.draw = SVG().size(this.options.width, this.options.height);

    this.addStyles();

    this.lastYMargin = this.options.margin;
  }

  private renderTemplate(studyData: TStudyData) {
    this.addHeader();
    this.addMainColumns(studyData);
    this.addAdditionalData(studyData);
    this.addSeriesData(studyData);

    return sharp(Buffer.from(this.draw.svg()));
  }

  private addSeriesData(studyData: TStudyData) {
    this.draw.text(this.cleanXmlString('Series')).addClass('section-header').move(this.options.margin, this.lastYMargin);
    this.lastYMargin += this.options.sectionHeaderFontSize + this.options.rowSpace;

    const seriesNumberColumnData = studyData.series.map(series => ({ value: series.number }));
    const seriesDateColumnData = studyData.series.map(series => ({ value: series.date }));
    const seriesTimeColumnData = studyData.series.map(series => ({ value: series.time }));
    const seriesModalityColumnData = studyData.series.map(series => ({ value: series.modality }));
    const seriesBodyPartColumnData = studyData.series.map(series => ({ value: series.bodyPart }));

    this.addColumns([
      { header: 'Number', data: seriesNumberColumnData },
      { header: 'Date', data: seriesDateColumnData },
      { header: 'Time', data: seriesTimeColumnData },
      { header: 'Modality', data: seriesModalityColumnData },
      { header: 'Body Part', data: seriesBodyPartColumnData },
    ]);
  }

  private addAdditionalData(studyData: TStudyData) {
    const additionalData = [
      {
        label: 'Additional Patient History',
        value: studyData.additionalPatientHistory,
      },
      {
        label: 'Reason for Visit',
        value: studyData.reasonForVisit,
      },
    ];

    this.addColumns([
      { data: additionalData },
    ]);
  }

  private addHeader() {
    this.draw.text('Study Notes').addClass('header').move(this.options.margin, this.lastYMargin);
    this.lastYMargin = this.lastYMargin + this.options.headerFontSize + this.options.rowSpace;
  }

  private addMainColumns(studyData: TStudyData) {
    const patientInformation = [
      {
        label: 'Name',
        value: studyData.patientName,
      },
      {
        label: 'Date of Birth',
        value: studyData.patientDob,
      },
      {
        label: 'ID',
        value: studyData.patientId,
      },
      {
        label: 'Sex',
        value: studyData.patientSex,
      },
      {
        label: 'Age',
        value: studyData.patientAge,
      },
    ];

    const studyInformation = [
      {
        label: 'Institution Name',
        value: studyData.institutionName,
      },
      {
        value: studyData.studyDate,
        label: 'Date',
      },
      {
        label: 'Time',
        value: studyData.studyTime,
      },
      {
        label: 'Description',
        value: studyData.studyDescription,
      },
      {
        label: 'Protocol Name',
        value: studyData.protocolName,
      },
    ];

    const referringPhysicianInformation = [
      {
        label: 'Name',
        value: studyData.referringPhysicianName,
      },
      {
        label: 'Email',
        value: studyData.referringPhysicianMail,
      },
      {
        label: 'Phone',
        value: studyData.referringPhysicianPhone,
      },
    ];

    this.addColumns([
      { header: 'Study', data: studyInformation },
      { header: 'Patient', data: patientInformation },
      { header: 'Referring Physician', data: referringPhysicianInformation },
    ]);

    return this.lastYMargin;
  }

  private addStyles() {
    const defs = this.draw.defs();

    const textStyle = defs.style();
    textStyle.rule('text', {
      'font-style': 'normal',
      'font-variant': 'normal',
      'font-weight': 'normal',
      'font-stretch': 'normal',
      'font-family': 'sans-serif',
      '-inkscape-font-specification': 'sans-serif, Bold',
      'font-variant-ligatures': 'normal',
      'font-variant-caps': 'normal',
      'font-variant-numeric': 'normal',
      'font-variant-east-asian': 'normal',
      'fill': '#ffffff',
      'fill-opacity': 1,
      'stroke-width': 0.264583,
      'font-size': `${this.options.fontSize}px`,
    });
    textStyle.rule('text.label', { 'font-weight': 'bold' });
    textStyle.rule('text.header', { 'font-weight': 'bold', 'font-size': `${this.options.headerFontSize}px` });
    textStyle.rule('text.section-header', { 'font-weight': 'bold', 'font-size': `${this.options.sectionHeaderFontSize}px` });
  }

  private cleanXmlString(value: string | number) {
    if (typeof value === 'number') {
      return value.toString();
    }

    if (typeof value === 'string') {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/&(?!(amp;)|(lt;)|(gt;)|(quot;)|(#39;)|(apos;))/g, '&amp;')
        .replace(/'/g, '&#39;')
        .replace(/([^\\])((\\\\)*)\\(?![\\/{])/g, '$1\\\\$2');
    }

    return '';
  }

  private addColumns(columns: TColumn[]) {
    if (!columns.length) {
      return this.lastYMargin;
    }
    const columnWidth = (this.options.width - 2 * this.options.margin) / columns.length;
    for (const [index, column] of columns.entries()) {
      this.addColumn(column,
        index,
        columnWidth,
        this.lastYMargin,
      );
    }

    this.lastYMargin = Math.max(...columns.map(column => column.data.length))
    * 2 * (this.options.fontSize + this.options.rowSpace)
    + this.lastYMargin
    + 3 * this.options.rowSpace; // ?

    return this.lastYMargin
    ;
  }

  private addColumn(
    column: {header?: string, data: Array<{label?: string, value: string}>},
    columnNumber: number,
    columnWidth: number,
    ymargin: number,
  ) {
    const x = this.options.margin + columnNumber * columnWidth;
    if (column.header) {
      this.draw.text(this.cleanXmlString(column.header)).addClass('section-header').move(x, ymargin);
    }
    const baseY = column.header
      ? this.options.sectionHeaderFontSize + this.options.rowSpace + ymargin
      : ymargin;
    for (const [index, field] of column.data.entries()) {
      const numberOfRows = field.label ? 2 : 1;
      if (field.label) {
        const headerYMargin = baseY + (index * numberOfRows) * (this.options.fontSize + this.options.rowSpace);
        this.draw.text(this.cleanXmlString(field.label)).addClass('label').move(x, headerYMargin);
      }
      const valueYMargin = baseY + (index * numberOfRows + 1 + (field.label ? 0 : -1)) * (this.options.fontSize + this.options.rowSpace);
      this.draw.text(this.cleanXmlString(field.value)).addClass('value').move(x, valueYMargin);
    }
  }
}
