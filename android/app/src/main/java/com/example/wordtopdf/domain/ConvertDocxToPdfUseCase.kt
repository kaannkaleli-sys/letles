package com.example.wordtopdf.domain

class ConvertDocxToPdfUseCase(
    private val converter: DocxToPdfConverter
) {
    suspend operator fun invoke(inputUri: String, outputFileName: String): ConversionResult {
        if (inputUri.isBlank()) return ConversionResult.Failure("Geçersiz dosya")
        if (!outputFileName.endsWith(".pdf")) return ConversionResult.Failure("Çıktı uzantısı .pdf olmalı")

        return converter.convert(inputUri, outputFileName)
    }
}
