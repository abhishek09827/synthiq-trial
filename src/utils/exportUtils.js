import { Parser } from 'json2csv';
import pkg from 'exceljs';
const { Workbook } = pkg;


const ExportUtils = {

// Export data to CSV format
async exportToCSV(data) {
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);
    return csv;
  },
  
// Export data to Excel format
async exportToExcel(data) {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Call Logs');
  
    // Add columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Assistant ID', key: 'assistant_id', width: 20 },
      { header: 'Type', key: 'type', width: 15 },
      { header: 'Started At', key: 'started_at', width: 25 },
      { header: 'Ended At', key: 'ended_at', width: 25 },
      { header: 'Cost', key: 'cost', width: 10 },
      { header: 'Status', key: 'status', width: 15 }
    ];
  
    // Add rows
    data.forEach(call => {
      worksheet.addRow(call);
    });
  
    // Generate buffer and return it
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  },
};

export default ExportUtils;
