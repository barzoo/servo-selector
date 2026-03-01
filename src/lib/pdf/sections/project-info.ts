import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { defaultTableStyles, getCurrentY, addSectionTitle } from '../styles';
import type { TranslationFunction, ReportProjectInfo } from '../types';

export function addProjectInfoSection(
  doc: jsPDF,
  t: TranslationFunction,
  project: ReportProjectInfo
): void {
  let y = getCurrentY(doc);
  y = addSectionTitle(doc, t('pdf.sections.projectInfo'), y);

  const tableData = [
    [t('pdf.projectInfo.name'), project.name || '-'],
    [t('pdf.projectInfo.customer'), project.customer || '-'],
  ];

  if (project.salesPerson) {
    tableData.push([t('pdf.projectInfo.salesPerson'), project.salesPerson]);
  }

  tableData.push([t('pdf.projectInfo.date'), project.date]);

  if (project.notes) {
    tableData.push([t('pdf.projectInfo.notes'), project.notes]);
  }

  autoTable(doc, {
    ...defaultTableStyles,
    startY: y,
    body: tableData,
    columns: [
      { header: t('pdf.projectInfo.item'), dataKey: 'item' },
      { header: t('pdf.projectInfo.value'), dataKey: 'value' },
    ],
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    headStyles: {
      ...defaultTableStyles.headStyles,
      fillColor: [240, 240, 240],
    },
  });
}
