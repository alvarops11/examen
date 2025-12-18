import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Type definition for jsPDF with autotable because of missing types in some environments
interface jsPDFWithAutoTable extends jsPDF {
    autoTable: (options: any) => jsPDF;
}

interface ExamQuestion {
    id: number;
    question: string;
    choices: string[];
    answerIndex: number;
    explanation: string;
}

interface ExamData {
    title: string;
    difficulty: string;
    questions: ExamQuestion[];
}

export const generateExamPDF = (
    examData: ExamData,
    curso: string,
    corregido: boolean = false
) => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Helper to add watermark
    const addWatermark = (pdfDoc: jsPDF) => {
        pdfDoc.saveGraphicsState();
        pdfDoc.setGState(pdfDoc.GState({ opacity: 0.1 }));
        pdfDoc.setFontSize(60);
        pdfDoc.setTextColor(150, 150, 150);
        pdfDoc.setFont("helvetica", "bold");

        // Rotate and draw watermark
        const text = "EXAMSPHERE";
        const x = pageWidth / 2;
        const y = pageHeight / 2;
        pdfDoc.text(text, x, y, {
            align: "center",
            angle: 45,
        });
        pdfDoc.restoreGraphicsState();
    };

    // Set initial font
    doc.setFont("helvetica");

    // Add Header
    doc.setFontSize(22);
    doc.setTextColor(63, 81, 181); // Indigo color
    doc.text("EXAMSPHERE", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("AI POWERED LEARNING", 14, 28);

    // Exam Info
    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text(examData.title || `Examen ${curso}`, 14, 45);

    doc.setFontSize(11);
    doc.text(`Curso: ${curso}`, 14, 55);
    doc.text(`Dificultad: ${examData.difficulty.charAt(0).toUpperCase() + examData.difficulty.slice(1)}`, 14, 62);
    doc.text(`Total preguntas: ${examData.questions.length}`, 14, 69);

    if (corregido) {
        doc.setTextColor(76, 175, 80); // Green color
        doc.setFont("helvetica", "bold");
        doc.text("VERSIÓN CORREGIDA", pageWidth - 14, 22, { align: "right" });
        doc.setFont("helvetica", "normal");
        doc.setTextColor(33, 33, 33);
    }

    let currentY = 80;

    // Add questions
    examData.questions.forEach((q, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 40) {
            addWatermark(doc);
            doc.addPage();
            currentY = 20;
        }

        // Question text
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        const questionText = `${index + 1}. ${q.question}`;
        const splitQuestion = doc.splitTextToSize(questionText, pageWidth - 28);
        doc.text(splitQuestion, 14, currentY);
        currentY += (splitQuestion.length * 7);

        // Choices
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        q.choices.forEach((choice, cIndex) => {
            const char = String.fromCharCode(97 + cIndex); // a, b, c, d...
            const choiceText = `${char}) ${choice}`;

            // Highlight if corrected
            if (corregido && cIndex === q.answerIndex) {
                doc.setTextColor(76, 175, 80);
                doc.setFont("helvetica", "bold");
            }

            const splitChoice = doc.splitTextToSize(choiceText, pageWidth - 35);
            doc.text(splitChoice, 20, currentY);
            currentY += (splitChoice.length * 6);

            // Reset style
            doc.setTextColor(33, 33, 33);
            doc.setFont("helvetica", "normal");
        });

        // Explanation if corrected
        if (corregido) {
            currentY += 2;
            doc.setFont("helvetica", "italic");
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            const explanationText = `Explicación: ${q.explanation}`;
            const splitExplanation = doc.splitTextToSize(explanationText, pageWidth - 35);
            doc.text(splitExplanation, 20, currentY);
            currentY += (splitExplanation.length * 5) + 5;
            doc.setTextColor(33, 33, 33);
            doc.setFont("helvetica", "normal");
        } else {
            currentY += 8;
        }
    });

    // Add watermark to all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        addWatermark(doc);

        // Add page number
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }

    // Save the PDF
    const fileName = `Examen_${curso}_${corregido ? "corregido" : "sin_corregir"}.pdf`;
    doc.save(fileName);
};
