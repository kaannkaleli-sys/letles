package com.example.wordtopdf.data

import android.content.Context
import android.net.Uri
import androidx.documentfile.provider.DocumentFile
import com.example.wordtopdf.domain.ConversionResult
import com.example.wordtopdf.domain.DocxToPdfConverter
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.pdmodel.PDPage
import com.tom_roush.pdfbox.pdmodel.PDPageContentStream
import com.tom_roush.pdfbox.pdmodel.common.PDRectangle
import com.tom_roush.pdfbox.pdmodel.font.PDType1Font
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.apache.poi.xwpf.usermodel.XWPFDocument

class DocxToPdfConverterImpl(
    private val context: Context
) : DocxToPdfConverter {

    override suspend fun convert(
        inputUri: String,
        outputDirectory: String,
        outputFileName: String
    ): ConversionResult = withContext(Dispatchers.IO) {
        try {
            val source = Uri.parse(inputUri)
            val outputTree = Uri.parse(outputDirectory)

            val directory = DocumentFile.fromTreeUri(context, outputTree)
                ?: return@withContext ConversionResult.Failure("Kayıt dizinine erişilemedi")

            val rawText = context.contentResolver.openInputStream(source)?.use { input ->
                XWPFDocument(input).use { doc ->
                    doc.paragraphs.joinToString("\n") { it.text.orEmpty() }
                }
            } ?: return@withContext ConversionResult.Failure("Word dosyası okunamadı")

            val baseName = outputFileName.removeSuffix(".pdf")
            val outputFile = directory.createFile("application/pdf", baseName)
                ?: return@withContext ConversionResult.Failure("PDF dosyası oluşturulamadı")

            val document = PDDocument()
            try {
                val page = PDPage(PDRectangle.A4)
                document.addPage(page)

                val font = PDType1Font.HELVETICA
                val fontSize = 12f
                val leading = 16f
                val margin = 50f
                val width = page.mediaBox.width - 2 * margin

                PDPageContentStream(document, page).use { stream ->
                    stream.beginText()
                    stream.setFont(font, fontSize)
                    stream.newLineAtOffset(margin, page.mediaBox.height - margin)

                    for (line in wrapLines(rawText, width, font, fontSize)) {
                        stream.showText(line)
                        stream.newLineAtOffset(0f, -leading)
                    }

                    stream.endText()
                }

                context.contentResolver.openOutputStream(outputFile.uri, "w")?.use { out ->
                    document.save(out)
                } ?: return@withContext ConversionResult.Failure("PDF kaydı başlatılamadı")
            } finally {
                document.close()
            }

            ConversionResult.Success(outputFile.uri.toString())
        } catch (e: Exception) {
            ConversionResult.Failure("Dönüştürme hatası: ${e.message ?: "bilinmeyen"}")
        }
    }

    private fun wrapLines(
        text: String,
        maxWidth: Float,
        font: PDType1Font,
        fontSize: Float
    ): List<String> {
        val result = mutableListOf<String>()
        text.split("\n").forEach { paragraph ->
            if (paragraph.isBlank()) {
                result += " "
                return@forEach
            }

            val words = paragraph.split(" ")
            val lineBuilder = StringBuilder()

            for (word in words) {
                val candidate = if (lineBuilder.isEmpty()) word else "${lineBuilder} $word"
                val size = font.getStringWidth(candidate) / 1000 * fontSize
                if (size <= maxWidth) {
                    lineBuilder.clear()
                    lineBuilder.append(candidate)
                } else {
                    result += lineBuilder.toString()
                    lineBuilder.clear()
                    lineBuilder.append(word)
                }
            }

            if (lineBuilder.isNotEmpty()) result += lineBuilder.toString()
        }
        return result
    }
}
