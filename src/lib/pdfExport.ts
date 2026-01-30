import { jsPDF } from 'jspdf';
import { 
  Cat, 
  HealthRecord, 
  WeightRecord, 
  getRecordsForCat, 
  getWeightRecordsForCat,
  getStatusInfo,
  convertWeight
} from './healthStorage';

interface ExportOptions {
  cat: Cat;
  preferredUnit: 'kg' | 'lbs';
  maxRecords?: number;
}

export const generateVetReportPDF = ({ cat, preferredUnit, maxRecords = 30 }: ExportOptions): void => {
  const doc = new jsPDF();
  const healthRecords = getRecordsForCat(cat.id).slice(0, maxRecords);
  const weightRecords = getWeightRecordsForCat(cat.id).slice(0, maxRecords);
  
  let yPos = 20;
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - 40;
  
  // Helper to check page break
  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > 270) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Header
  doc.setFillColor(139, 92, 246); // Primary purple
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Cat Health Report', leftMargin, 28);
  
  yPos = 55;
  
  // Cat Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(leftMargin, yPos, contentWidth, 35, 3, 3, 'F');
  
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(cat.name, leftMargin + 10, yPos + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Generated: ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, leftMargin + 10, yPos + 25);
  
  yPos += 45;
  
  // Summary Statistics
  if (healthRecords.length > 0 || weightRecords.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Summary Statistics', leftMargin, yPos);
    yPos += 10;
    
    const statsBoxWidth = contentWidth / 3 - 5;
    
    // Health stats
    if (healthRecords.length > 0) {
      const avgScore = Math.round(healthRecords.reduce((sum, r) => sum + r.percentage, 0) / healthRecords.length);
      const latestScore = healthRecords[0].percentage;
      const statusCounts = healthRecords.reduce((acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Avg Score Box
      doc.setFillColor(239, 246, 255);
      doc.roundedRect(leftMargin, yPos, statsBoxWidth, 30, 2, 2, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`${avgScore}%`, leftMargin + statsBoxWidth/2, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Avg Health Score', leftMargin + statsBoxWidth/2, yPos + 23, { align: 'center' });
      
      // Latest Score Box
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(leftMargin + statsBoxWidth + 5, yPos, statsBoxWidth, 30, 2, 2, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(`${latestScore}%`, leftMargin + statsBoxWidth + 5 + statsBoxWidth/2, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Latest Score', leftMargin + statsBoxWidth + 5 + statsBoxWidth/2, yPos + 23, { align: 'center' });
      
      // Total Records Box
      doc.setFillColor(254, 249, 195);
      doc.roundedRect(leftMargin + (statsBoxWidth + 5) * 2, yPos, statsBoxWidth, 30, 2, 2, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(202, 138, 4);
      doc.text(`${healthRecords.length}`, leftMargin + (statsBoxWidth + 5) * 2 + statsBoxWidth/2, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Health Records', leftMargin + (statsBoxWidth + 5) * 2 + statsBoxWidth/2, yPos + 23, { align: 'center' });
      
      yPos += 40;
      
      // Status breakdown
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const statusText = Object.entries(statusCounts)
        .map(([status, count]) => `${getStatusInfo(status as HealthRecord['status']).label}: ${count}`)
        .join('  •  ');
      doc.text(`Status Breakdown: ${statusText}`, leftMargin, yPos);
      yPos += 15;
    }
    
    // Weight stats
    if (weightRecords.length > 0) {
      const latestWeight = convertWeight(weightRecords[0].weight, weightRecords[0].unit, preferredUnit);
      const weights = weightRecords.map(r => convertWeight(r.weight, r.unit, preferredUnit));
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Weight: Current ${latestWeight} ${preferredUnit}  •  Range: ${minWeight} - ${maxWeight} ${preferredUnit}  •  ${weightRecords.length} records`, leftMargin, yPos);
      yPos += 15;
    }
  }
  
  yPos += 5;
  
  // Health Records Table
  if (healthRecords.length > 0) {
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Health Records', leftMargin, yPos);
    yPos += 8;
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, yPos, contentWidth, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Date', leftMargin + 5, yPos + 7);
    doc.text('Score', leftMargin + 45, yPos + 7);
    doc.text('Status', leftMargin + 70, yPos + 7);
    doc.text('Key Observations', leftMargin + 100, yPos + 7);
    yPos += 12;
    
    healthRecords.forEach((record, index) => {
      checkPageBreak(12);
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(leftMargin, yPos - 2, contentWidth, 10, 'F');
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      const dateStr = new Date(record.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      doc.text(dateStr, leftMargin + 5, yPos + 5);
      doc.text(`${record.percentage}%`, leftMargin + 45, yPos + 5);
      
      const statusInfo = getStatusInfo(record.status);
      // Set color based on status
      switch (record.status) {
        case 'excellent': doc.setTextColor(34, 197, 94); break;
        case 'good': doc.setTextColor(59, 130, 246); break;
        case 'warning': doc.setTextColor(245, 158, 11); break;
        case 'critical': doc.setTextColor(239, 68, 68); break;
      }
      doc.text(statusInfo.label, leftMargin + 70, yPos + 5);
      
      // Key observations
      doc.setTextColor(100, 116, 139);
      const observations = getKeyObservations(record);
      const truncated = observations.length > 40 ? observations.substring(0, 37) + '...' : observations;
      doc.text(truncated, leftMargin + 100, yPos + 5);
      
      yPos += 10;
    });
    
    yPos += 10;
  }
  
  // Weight Records Table
  if (weightRecords.length > 0) {
    checkPageBreak(50);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Weight Records', leftMargin, yPos);
    yPos += 8;
    
    // Table header
    doc.setFillColor(241, 245, 249);
    doc.rect(leftMargin, yPos, contentWidth / 2, 10, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Date', leftMargin + 5, yPos + 7);
    doc.text(`Weight (${preferredUnit})`, leftMargin + 50, yPos + 7);
    yPos += 12;
    
    weightRecords.forEach((record, index) => {
      checkPageBreak(12);
      
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(leftMargin, yPos - 2, contentWidth / 2, 10, 'F');
      }
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      
      const dateStr = new Date(record.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      doc.text(dateStr, leftMargin + 5, yPos + 5);
      
      const weight = convertWeight(record.weight, record.unit, preferredUnit);
      doc.text(`${weight}`, leftMargin + 50, yPos + 5);
      
      yPos += 10;
    });
  }
  
  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Generated by Happy Kitty Score  •  Page ${i} of ${pageCount}`,
      pageWidth / 2,
      285,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const fileName = `${cat.name.replace(/[^a-zA-Z0-9]/g, '_')}_health_report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Helper to get key observations from a health record
const getKeyObservations = (record: HealthRecord): string => {
  const issues: string[] = [];
  const { answers } = record;
  
  if (answers.eating === '0') issues.push('No eating');
  if (answers.eating === '1') issues.push('Ate once');
  if (answers.water === 'very-little') issues.push('Low water');
  if (answers.water === 'a-lot') issues.push('Excess water');
  if (answers.poop === 'diarrhea') issues.push('Diarrhea');
  if (answers.poop === 'no-poop') issues.push('No stool');
  if (answers.activity === 'hiding') issues.push('Hiding');
  if (answers.activity === 'lazy') issues.push('Lethargic');
  if (answers.mood === 'depressed') issues.push('Depressed');
  if (answers.mood === 'aggressive') issues.push('Aggressive');
  if (answers.vomiting === 'more-than-once') issues.push('Vomiting');
  if (answers.appetite === 'refusing-food') issues.push('Refusing food');
  
  return issues.length > 0 ? issues.join(', ') : 'All normal';
};
