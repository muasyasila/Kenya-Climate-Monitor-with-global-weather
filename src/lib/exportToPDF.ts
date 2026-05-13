import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportToPDF(elementId: string, filename: string) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
        });

        const imgWidth = 297; // A4 landscape width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${filename}.pdf`);
    } catch (error) {
        console.error('PDF export failed:', error);
    }
}